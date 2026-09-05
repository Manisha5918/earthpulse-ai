"""VIIRS Day/Night Band (DNB) Nighttime Lights Module.
Acquires real VIIRS DNB monthly cloud-free composite radiance (nW/cm^2/sr) from AWS Open Data (NOAA/EOG).
Provides TIFF LZW decoding, HTTP Range tile extraction, and zonal spatial aggregation onto the EarthPulse 0.05° analytical grid.
"""

import io
import time
import urllib.request
from typing import Dict, Any, List, Tuple
import numpy as np
import tifffile


def tiff_lzw_decode(compressed_data: bytes) -> bytes:
    """Standard TIFF 6.0 Section 14 LZW decompressor in pure Python.
    Handles variable bit-lengths (9 to 12 bits), MSB bit ordering, and TIFF clear/EOI codes.
    """
    CLEAR_CODE = 256
    EOI_CODE = 257

    bits_buffer = 0
    bits_count = 0
    byte_idx = 0
    data_len = len(compressed_data)

    def read_code(code_size: int) -> int:
        nonlocal bits_buffer, bits_count, byte_idx
        while bits_count < code_size:
            if byte_idx >= data_len:
                return EOI_CODE
            bits_buffer = (bits_buffer << 8) | compressed_data[byte_idx]
            byte_idx += 1
            bits_count += 8
        bits_count -= code_size
        return (bits_buffer >> bits_count) & ((1 << code_size) - 1)

    out = bytearray()

    def init_table():
        return {i: bytes([i]) for i in range(256)}

    table = init_table()
    code_size = 9
    next_code = 258
    old_entry = None

    while True:
        code = read_code(code_size)
        if code == EOI_CODE:
            break
        if code == CLEAR_CODE:
            table = init_table()
            code_size = 9
            next_code = 258
            old_entry = None
            continue

        if old_entry is None:
            entry = table[code]
            out.extend(entry)
            old_entry = entry
            continue

        if code in table:
            entry = table[code]
        elif code == next_code:
            entry = old_entry + bytes([old_entry[0]])
        else:
            break

        out.extend(entry)
        if next_code < 4096:
            table[next_code] = old_entry + bytes([entry[0]])
            next_code += 1
            if next_code in (511, 1023, 2047):
                code_size += 1
        old_entry = entry

    return bytes(out)


def fetch_range_with_retry(url: str, range_str: str, retries: int = 5, timeout: int = 25) -> bytes:
    """Fetch HTTP Range bytes from AWS S3 with automated retries and backoff."""
    headers = {"Range": range_str, "User-Agent": "EarthPulse-AI/1.0 (Geospatial Research)"}
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except Exception as e:
            if attempt == retries - 1:
                raise RuntimeError(f"Failed to fetch {url} ({range_str}) after {retries} attempts: {e}")
            time.sleep(1.5 * (attempt + 1))


def extract_viirs_chennai_raster(composite_url: str) -> Tuple[np.ndarray, Dict[str, Any]]:
    """Extract and stitch 2x2 VIIRS DNB tiles covering the Chennai Metropolitan Area.
    Chennai bounding box (80.10 to 80.35 E, 12.85 to 13.25 N) spans tile rows [57, 58] and tile cols [243, 244].
    Returns (stitched_array, spatial_metadata).
    """
    # 1. Fetch BigTIFF header (first 1 MB contains tags, tile offsets, scale, and tiepoints)
    header_bytes = fetch_range_with_retry(composite_url, "bytes=0-1048575")
    with tifffile.TiffFile(io.BytesIO(header_bytes)) as tif:
        p0 = tif.pages[0]
        scale_x, scale_y = p0.tags[33550].value[:2]
        origin_x, origin_y = p0.tags[33922].value[3:5]
        tile_h, tile_w = p0.chunks[0], p0.chunks[1]
        tiles_across = int(np.ceil(p0.shape[1] / tile_w))

        # Stitch 2x2 tiles
        stitched = np.zeros((tile_h * 2, tile_w * 2), dtype=np.float32)

        for r_idx, r in enumerate([57, 58]):
            for c_idx, c in enumerate([243, 244]):
                t_idx = r * tiles_across + c
                offset = p0.dataoffsets[t_idx]
                count = p0.databytecounts[t_idx]
                raw_bytes = fetch_range_with_retry(composite_url, f"bytes={offset}-{offset + count - 1}")
                decomp = tiff_lzw_decode(raw_bytes)
                t_arr = np.frombuffer(decomp, dtype=np.float32).reshape((tile_h, tile_w))
                stitched[r_idx * tile_h : (r_idx + 1) * tile_h, c_idx * tile_w : (c_idx + 1) * tile_w] = t_arr

    stitched_origin_x = origin_x + 243 * tile_w * scale_x
    stitched_origin_y = origin_y - 57 * tile_h * scale_y

    meta = {
        "origin_x": stitched_origin_x,
        "origin_y": stitched_origin_y,
        "scale_x": scale_x,
        "scale_y": scale_y,
        "shape": stitched.shape,
        "crs": "EPSG:4326",
        "units": "nW/cm2/sr"
    }

    return stitched, meta


def aggregate_viirs_radiance_cell(
    cell_data: np.ndarray,
    nodata_val: float = -999.0
) -> Dict[str, float]:
    """Calculate summary radiance statistics for a grid cell.
    Discards negative values (VIIRS background noise) and NoData.
    """
    valid = cell_data[(cell_data >= 0) & (cell_data != nodata_val) & ~np.isnan(cell_data)]
    if valid.size == 0:
        return {
            "mean_rad": 0.0,
            "median_rad": 0.0,
            "max_rad": 0.0,
            "min_rad": 0.0,
            "std_rad": 0.0,
            "valid_pixels": 0
        }

    return {
        "mean_rad": round(float(np.mean(valid)), 4),
        "median_rad": round(float(np.median(valid)), 4),
        "max_rad": round(float(np.max(valid)), 4),
        "min_rad": round(float(np.min(valid)), 4),
        "std_rad": round(float(np.std(valid)), 4),
        "valid_pixels": int(valid.size)
    }

# Backward compatibility alias
aggregate_viirs_radiance = aggregate_viirs_radiance_cell
