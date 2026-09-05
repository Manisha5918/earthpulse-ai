"""Sentinel-2 Multispectral Processing & Index Calculation Module.
Acquires real Sentinel-2 Level-2A surface reflectance data via Earth Search / AWS Open Data COG.
Computes NDVI, NDWI (McFeeters), and NDBI with SCL cloud masking and aggregates to 0.05° analytical grid.
"""

import io
import math
import time
import zlib
import urllib.request
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import tifffile


def wgs84_to_utm44n(lat_deg: float, lon_deg: float) -> Tuple[float, float]:
    """Convert WGS84 (lat, lon) in decimal degrees to UTM Zone 44N (Easting, Northing) in meters.
    Standard Transverse Mercator forward projection (Snyder 1987).
    """
    a = 6378137.0  # WGS84 semi-major axis
    f = 1 / 298.257223563  # flattening
    e2 = 2 * f - f * f  # eccentricity squared
    e_prime2 = e2 / (1 - e2)
    k0 = 0.9996  # UTM scale factor

    lat_rad = math.radians(lat_deg)
    lon_rad = math.radians(lon_deg)
    lon0_rad = math.radians(81.0)  # Central meridian for UTM Zone 44 (81° E)

    sin_lat = math.sin(lat_rad)
    cos_lat = math.cos(lat_rad)
    tan_lat = math.tan(lat_rad)

    N = a / math.sqrt(1 - e2 * sin_lat * sin_lat)
    T = tan_lat * tan_lat
    C = e_prime2 * cos_lat * cos_lat
    A = cos_lat * (lon_rad - lon0_rad)

    M = a * (
        (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2**3 / 256) * lat_rad
        - (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2**3 / 1024) * math.sin(2 * lat_rad)
        + (15 * e2 * e2 / 256 + 45 * e2**3 / 1024) * math.sin(4 * lat_rad)
        - (35 * e2**3 / 3072) * math.sin(6 * lat_rad)
    )

    x = k0 * N * (
        A + (1 - T + C) * A**3 / 6 + (5 - 18 * T + T * T + 72 * C - 58 * e_prime2) * A**5 / 120
    ) + 500000.0

    y = k0 * (
        M + N * tan_lat * (
            A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A**4 / 24
            + (61 - 58 * T + T * T + 600 * C - 330 * e_prime2) * A**6 / 720
        )
    )

    return x, y


def calculate_ndvi(nir_band: np.ndarray, red_band: np.ndarray) -> np.ndarray:
    """Normalized Difference Vegetation Index:
    NDVI = (NIR - Red) / (NIR + Red)
    Bands: B08 (NIR, 842nm), B04 (Red, 665nm)
    Scale: [-1.0, 1.0]. Dense healthy vegetation: 0.3 to 0.8
    """
    denominator = nir_band.astype(float) + red_band.astype(float)
    numerator = nir_band.astype(float) - red_band.astype(float)
    ndvi = np.where(denominator > 0, numerator / denominator, np.nan)
    return np.clip(ndvi, -1.0, 1.0)


def calculate_ndwi(green_band: np.ndarray, nir_band: np.ndarray) -> np.ndarray:
    """Normalized Difference Water Index (McFeeters 1996):
    NDWI = (Green - NIR) / (Green + NIR)
    Bands: B03 (Green, 560nm), B08 (NIR, 842nm)
    Scale: [-1.0, 1.0]. Open water bodies typically > 0.0
    """
    denominator = green_band.astype(float) + nir_band.astype(float)
    numerator = green_band.astype(float) - nir_band.astype(float)
    ndwi = np.where(denominator > 0, numerator / denominator, np.nan)
    return np.clip(ndwi, -1.0, 1.0)


def calculate_ndbi(swir_band: np.ndarray, nir_band: np.ndarray) -> np.ndarray:
    """Normalized Difference Built-up Index (Zha et al. 2003):
    NDBI = (SWIR1 - NIR) / (SWIR1 + NIR)
    Bands: B11 (SWIR-1, 1610nm), B08 (NIR, 842nm)
    Scale: [-1.0, 1.0]. Built-up/impervious surfaces typically > 0.0
    """
    denominator = swir_band.astype(float) + nir_band.astype(float)
    numerator = swir_band.astype(float) - nir_band.astype(float)
    ndbi = np.where(denominator > 0, numerator / denominator, np.nan)
    return np.clip(ndbi, -1.0, 1.0)


def mask_clouds_scl(
    data_array: np.ndarray,
    scl_band: np.ndarray,
    invalid_classes: Tuple[int, ...] = (3, 8, 9, 10, 11)
) -> np.ndarray:
    """Apply Sentinel-2 Scene Classification Layer (SCL) cloud/shadow mask.
    Invalid classes:
      3: Cloud shadows
      8: Cloud medium probability
      9: Cloud high probability
      10: Thin cirrus
      11: Snow / ice
    """
    # If SCL array is different resolution, resample to match data_array shape
    if scl_band.shape != data_array.shape:
        # Nearest-neighbor upscale
        row_scale = data_array.shape[0] / scl_band.shape[0]
        col_scale = data_array.shape[1] / scl_band.shape[1]
        row_idx = np.clip((np.arange(data_array.shape[0]) / row_scale).astype(int), 0, scl_band.shape[0] - 1)
        col_idx = np.clip((np.arange(data_array.shape[1]) / col_scale).astype(int), 0, scl_band.shape[1] - 1)
        scl_resampled = scl_band[np.ix_(row_idx, col_idx)]
    else:
        scl_resampled = scl_band

    mask = np.isin(scl_resampled, invalid_classes)
    masked = data_array.astype(float).copy()
    masked[mask] = np.nan
    return masked


def fetch_bytes_with_retry(url: str, range_header: Optional[str] = None, retries: int = 4, timeout: int = 35) -> bytes:
    """Fetch HTTP bytes with automated retries and backoff for remote satellite endpoints."""
    headers = {"User-Agent": "EarthPulse-AI/1.0 (Geospatial Research)"}
    if range_header:
        headers["Range"] = range_header

    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except Exception as e:
            if attempt == retries - 1:
                raise RuntimeError(f"Failed to fetch {url} after {retries} attempts: {e}")
            time.sleep(1.5 * (attempt + 1))


def read_cog_overview_tile0(band_url: str) -> Tuple[np.ndarray, int]:
    """Read Tile 0 of the 160m overview (Page 4) from a Sentinel-2 Cloud-Optimized GeoTIFF.
    Tile 0 covers the top-left 512x512 pixels containing the Chennai Metropolitan Area.
    """
    # Read TIFF Header
    header_bytes = fetch_bytes_with_retry(band_url, range_header="bytes=0-131071")
    with tifffile.TiffFile(io.BytesIO(header_bytes)) as tif:
        page = tif.pages[-1]  # Overview page
        offset = page.dataoffsets[0]
        count = page.databytecounts[0]
        predictor = page.predictor
        chunks = page.chunks
        dtype = page.dtype
        scale_val = 160 if chunks[0] == 512 else 320

    # Fetch Tile 0 compressed payload
    tile_bytes = fetch_bytes_with_retry(band_url, range_header=f"bytes={offset}-{offset + count - 1}")
    raw = zlib.decompress(tile_bytes)
    arr = np.frombuffer(raw, dtype=dtype).reshape(chunks)
    if predictor == 2:
        arr = np.cumsum(arr, axis=1, dtype=dtype)

    return arr, scale_val
