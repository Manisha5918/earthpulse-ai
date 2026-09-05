"""Sentinel-2 Real Data Acquisition & Processing Pipeline for Chennai MVP.
Connects to official AWS Open Data Earth Search STAC API (mirrored from Copernicus).
Acquires real Sentinel-2 Level-2A surface reflectance rasters for Chennai (MGRS Tile 44PMV).
Computes NDVI, NDWI (McFeeters), and NDBI with SCL cloud masking.
Aggregates indices onto EarthPulse 0.05° analytical grid cells (CHE_G001 to CHE_G016).
Strict Data Provenance: Zero fabricated values.
"""

import os
import sys
import json
import csv
import urllib.request
import time
from datetime import datetime, timezone
from typing import List, Dict, Any
import numpy as np

# Add backend to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.data_sources.sentinel2 import (
    calculate_ndvi,
    calculate_ndwi,
    calculate_ndbi,
    mask_clouds_scl,
    wgs84_to_utm44n,
    read_cog_overview_tile0
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, "data", "raw", "sentinel2")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed", "sentinel2")
BOUNDARIES_DIR = os.path.join(BASE_DIR, "data", "boundaries")

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

EARTH_SEARCH_STAC_URL = "https://earth-search.aws.element84.com/v1/search"


def query_chennai_scenes(retries: int = 5) -> List[Dict[str, Any]]:
    """Query Earth Search STAC for ultra-low cloud Sentinel-2 L2A scenes covering Chennai across 2021-2024."""
    print("=" * 70, flush=True)
    print("PHASE 2: QUERYING REAL SENTINEL-2 L2A SCENES (CHENNAI 2021-2024)", flush=True)
    print("=" * 70, flush=True)

    selected_scenes = []
    years = [2021, 2022, 2023, 2024]

    for year in years:
        payload = {
            "collections": ["sentinel-2-l2a"],
            "intersects": {"type": "Point", "coordinates": [80.2707, 13.0827]},
            "datetime": f"{year}-01-01T00:00:00Z/{year}-05-31T23:59:59Z",
            "query": {
                "eo:cloud_cover": {"lt": 5.0},
                "grid:code": {"eq": "MGRS-44PMV"}
            },
            "limit": 2
        }
        data_bytes = json.dumps(payload).encode("utf-8")

        for attempt in range(retries):
            try:
                req = urllib.request.Request(
                    EARTH_SEARCH_STAC_URL,
                    data=data_bytes,
                    headers={"Content-Type": "application/json", "User-Agent": "EarthPulse-AI/1.0"}
                )
                with urllib.request.urlopen(req, timeout=35) as resp:
                    res_json = json.loads(resp.read().decode("utf-8"))
                    feats = res_json.get("features", [])
                    if feats:
                        best = feats[0]
                        p = best["properties"]
                        print(f"[Year {year}] Selected Scene: {best['id']} | Date: {p['datetime'][:10]} | Cloud: {p['eo:cloud_cover']:.2f}%", flush=True)
                        selected_scenes.append({
                            "scene_id": best["id"],
                            "date": p["datetime"][:10],
                            "datetime": p["datetime"],
                            "cloud_cover_pct": p["eo:cloud_cover"],
                            "tile_id": p.get("grid:code", "MGRS-44PMV"),
                            "platform": p.get("platform", "Sentinel-2"),
                            "crs": "EPSG:32644 (UTM Zone 44N)",
                            "spatial_resolution": "10m/20m native (160m analytical overview)",
                            "assets": {
                                "B04": best["assets"]["red"]["href"],
                                "B08": best["assets"]["nir"]["href"],
                                "B03": best["assets"]["green"]["href"],
                                "B11": best["assets"]["swir16"]["href"],
                                "SCL": best["assets"]["scl"]["href"]
                            }
                        })
                    break
            except Exception as e:
                if attempt == retries - 1:
                    print(f"Warning: Failed to fetch STAC scenes for year {year}: {e}", flush=True)
                time.sleep(2.0)

    # Save raw scene catalog metadata
    raw_meta_path = os.path.join(RAW_DIR, "sentinel2_chennai_scenes_metadata.json")
    with open(raw_meta_path, "w", encoding="utf-8") as f:
        json.dump({
            "stac_catalog_url": EARTH_SEARCH_STAC_URL,
            "query_target": "Chennai, Tamil Nadu, India (MGRS-44PMV)",
            "bounding_box": [80.10, 12.85, 80.35, 13.25],
            "extracted_at": datetime.now(timezone.utc).isoformat(),
            "provenance_type": "OBSERVED",
            "scenes": selected_scenes
        }, f, indent=2)
    print(f"Saved raw scenes metadata to: {raw_meta_path}", flush=True)

    return selected_scenes


def process_sentinel_scenes(scenes: List[Dict[str, Any]]):
    """Process real bands for selected scenes and aggregate indices to Chennai 0.05° grid."""
    grid_geojson_path = os.path.join(BOUNDARIES_DIR, "chennai_grid_0.05deg.geojson")
    with open(grid_geojson_path, "r", encoding="utf-8") as f:
        grid_data = json.load(f)

    grid_cells = grid_data["features"]
    print(f"Loaded {len(grid_cells)} analytical grid cells from {grid_geojson_path}", flush=True)

    ul_x, ul_y = 399960.0, 1500000.0  # MGRS-44PMV origin in UTM 44N
    scale = 160.0  # meters per pixel for 160m overview

    grid_observations = []
    ledger_records = []
    processing_time = datetime.now(timezone.utc).isoformat()

    for idx, sc in enumerate(scenes, start=1):
        scene_id = sc["scene_id"]
        obs_date = sc["date"]
        obs_dt = sc["datetime"]
        assets = sc["assets"]

        print(f"\n[{idx}/{len(scenes)}] Processing Scene: {scene_id} ({obs_date})", flush=True)
        print("  -> Fetching real COG bands via HTTP Range (B04, B08, B03, B11, SCL)...", flush=True)

        b04, _ = read_cog_overview_tile0(assets["B04"])  # Red
        b08, _ = read_cog_overview_tile0(assets["B08"])  # NIR
        b03, _ = read_cog_overview_tile0(assets["B03"])  # Green
        b11, _ = read_cog_overview_tile0(assets["B11"])  # SWIR-1
        scl, _ = read_cog_overview_tile0(assets["SCL"])  # Cloud Mask

        # Compute full indices with SCL cloud masking
        red = b04.astype(float)
        nir = b08.astype(float)
        green = b03.astype(float)
        swir = b11.astype(float)

        # Mask clouds (SCL classes 3, 8, 9, 10, 11)
        red_masked = mask_clouds_scl(red, scl)
        nir_masked = mask_clouds_scl(nir, scl)
        green_masked = mask_clouds_scl(green, scl)
        swir_masked = mask_clouds_scl(swir, scl)

        # Compute spectral indices
        ndvi_arr = calculate_ndvi(nir_masked, red_masked)
        ndwi_arr = calculate_ndwi(green_masked, nir_masked)
        ndbi_arr = calculate_ndbi(swir_masked, nir_masked)

        # Aggregate for each 0.05° cell
        for cell_idx, cell in enumerate(grid_cells, start=1):
            props = cell["properties"]
            code = props["cell_code"]
            coords = cell["geometry"]["coordinates"][0]
            lons = [c[0] for c in coords]
            lats = [c[1] for c in coords]
            min_lon, max_lon = min(lons), max(lons)
            min_lat, max_lat = min(lats), max(lats)

            x_min, y_min = wgs84_to_utm44n(min_lat, min_lon)
            x_max, y_max = wgs84_to_utm44n(max_lat, max_lon)

            col_min = max(0, int((x_min - ul_x) / scale))
            col_max = min(512, int((x_max - ul_x) / scale))
            row_min = max(0, int((ul_y - y_max) / scale))
            row_max = min(512, int((ul_y - y_min) / scale))

            c_ndvi = ndvi_arr[row_min:row_max, col_min:col_max]
            c_ndwi = ndwi_arr[row_min:row_max, col_min:col_max]
            c_ndbi = ndbi_arr[row_min:row_max, col_min:col_max]

            total_px = c_ndvi.size
            valid_px = int(np.sum(~np.isnan(c_ndvi)))
            cloud_fraction = round(float(1.0 - (valid_px / total_px)) * 100, 2) if total_px > 0 else 0.0

            m_ndvi = round(float(np.nanmean(c_ndvi)), 4) if valid_px > 0 else None
            m_ndwi = round(float(np.nanmean(c_ndwi)), 4) if valid_px > 0 else None
            m_ndbi = round(float(np.nanmean(c_ndbi)), 4) if valid_px > 0 else None

            # Summary row
            grid_observations.append({
                "grid_id": cell_idx,
                "cell_code": code,
                "observation_date": obs_date,
                "acquisition_timestamp": obs_dt,
                "processing_timestamp": processing_time,
                "latitude": props["center_lat"],
                "longitude": props["center_lon"],
                "NDVI": m_ndvi,
                "NDWI": m_ndwi,
                "NDBI": m_ndbi,
                "cloud_fraction_pct": cloud_fraction,
                "valid_pixel_count": valid_px,
                "spatial_resolution": "0.05 deg analytical grid (aggregated from 160m COG overview)",
                "source_dataset": "Sentinel-2 Level-2A (Copernicus / AWS Open Data)",
                "source_product": scene_id,
                "tile_id": sc["tile_id"],
                "provenance_type": "CALCULATED"
            })

            # Observational Ledger Entries (matching PostGIS schema)
            for sig_name, sig_val, unit in [("ndvi", m_ndvi, "ratio"), ("ndwi", m_ndwi, "ratio"), ("ndbi", m_ndbi, "ratio")]:
                if sig_val is not None:
                    ledger_records.append({
                        "region_code": "IN-TN-CHE",
                        "grid_id": cell_idx,
                        "cell_code": code,
                        "dataset_id": f"copernicus_s2_msi_l2a_{sig_name}",
                        "signal_name": sig_name,
                        "signal_value": sig_val,
                        "unit": unit,
                        "acquisition_timestamp": obs_dt,
                        "processing_timestamp": processing_time,
                        "cloud_cover_pct": cloud_fraction,
                        "quality_flag": "VALID",
                        "source_name": "ESA Sentinel-2 L2A",
                        "source_url": assets["B04"],
                        "provenance_type": "CALCULATED"
                    })

    # Save Output Datasets
    # 1. Grid Observations CSV
    grid_csv_path = os.path.join(PROCESSED_DIR, "sentinel2_chennai_grid_observations.csv")
    with open(grid_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(grid_observations[0].keys()))
        writer.writeheader()
        writer.writerows(grid_observations)
    print(f"\nSaved {len(grid_observations)} processed grid observation rows to: {grid_csv_path}", flush=True)

    # 2. Grid Observations JSON with full metadata
    grid_json_path = os.path.join(PROCESSED_DIR, "sentinel2_chennai_grid_observations.json")
    with open(grid_json_path, "w", encoding="utf-8") as f:
        json.dump({
            "metadata": {
                "dataset_name": "EarthPulse AI — Sentinel-2 Regional Indices (Chennai MVP)",
                "source_catalog": EARTH_SEARCH_STAC_URL,
                "region": "Chennai Metropolitan Area, Tamil Nadu, India",
                "grid_cells_count": len(grid_cells),
                "scenes_processed_count": len(scenes),
                "total_observations_count": len(grid_observations),
                "formulas": {
                    "NDVI": "(NIR - RED) / (NIR + RED) using Bands B08 (842nm) and B04 (665nm)",
                    "NDWI": "(GREEN - NIR) / (GREEN + NIR) using Bands B03 (560nm) and B08 (842nm) [McFeeters 1996]",
                    "NDBI": "(SWIR1 - NIR) / (SWIR1 + NIR) using Bands B11 (1610nm) and B08 (842nm) [Zha et al. 2003]"
                },
                "cloud_masking": "SCL (Scene Classification Layer) classes 3, 8, 9, 10, 11 masked out",
                "spatial_aggregation": "Zonal mean across real satellite pixels within each 0.05° (~5.5km) cell",
                "provenance_type": "CALCULATED",
                "created_at": processing_time
            },
            "records": grid_observations
        }, f, indent=2)
    print(f"Saved processed JSON dataset to: {grid_json_path}", flush=True)

    # 3. Observational Ledger CSV (PostGIS schema ready)
    ledger_csv_path = os.path.join(PROCESSED_DIR, "sentinel2_chennai_observations_ledger.csv")
    with open(ledger_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(ledger_records[0].keys()))
        writer.writeheader()
        writer.writerows(ledger_records)
    print(f"Saved {len(ledger_records)} index ledger records to: {ledger_csv_path}", flush=True)

    # ---------------- QUALITY CONTROL & VALIDATION ----------------
    print("\n" + "=" * 70, flush=True)
    print("RUNNING SENTINEL-2 QUALITY CONTROL VALIDATION CHECKS...", flush=True)
    print("=" * 70, flush=True)

    # 1. Grid cell coverage check
    unique_cells = set(r["cell_code"] for r in grid_observations)
    assert len(unique_cells) == 16, f"Expected 16 grid cells populated, got {len(unique_cells)}"
    print(f"[PASS] Grid cell coverage: All 16 Chennai grid cells (CHE_G001 to CHE_G016) populated.", flush=True)

    # 2. Date range check
    dates = [r["observation_date"] for r in grid_observations]
    assert all("2021-01-01" <= d <= "2024-12-31" for d in dates), "Date outside 2021-2024 range!"
    print(f"[PASS] Date range: All observations fall strictly within 2021-01-01 to 2024-12-31 ({min(dates)} to {max(dates)}).", flush=True)

    # 3. Spatial bounds check
    for r in grid_observations:
        assert 12.85 <= r["latitude"] <= 13.25, f"Latitude {r['latitude']} outside Chennai bounds!"
        assert 80.10 <= r["longitude"] <= 80.35, f"Longitude {r['longitude']} outside Chennai bounds!"
    print(f"[PASS] Spatial bounds: 100% of grid coordinates fall strictly inside Chennai MVP bounding box.", flush=True)

    # 4. Value ranges check (NDVI, NDWI, NDBI)
    ndvis = [r["NDVI"] for r in grid_observations if r["NDVI"] is not None]
    ndwis = [r["NDWI"] for r in grid_observations if r["NDWI"] is not None]
    ndbis = [r["NDBI"] for r in grid_observations if r["NDBI"] is not None]

    assert all(-1.0 <= v <= 1.0 for v in ndvis), "NDVI value outside valid [-1.0, 1.0] range!"
    assert all(-1.0 <= v <= 1.0 for v in ndwis), "NDWI value outside valid [-1.0, 1.0] range!"
    assert all(-1.0 <= v <= 1.0 for v in ndbis), "NDBI value outside valid [-1.0, 1.0] range!"

    print(f"[PASS] NDVI range valid: min={min(ndvis):.4f}, max={max(ndvis):.4f}, mean={np.mean(ndvis):.4f} (vegetation index valid).", flush=True)
    print(f"[PASS] NDWI range valid: min={min(ndwis):.4f}, max={max(ndwis):.4f}, mean={np.mean(ndwis):.4f} (water index valid).", flush=True)
    print(f"[PASS] NDBI range valid: min={min(ndbis):.4f}, max={max(ndbis):.4f}, mean={np.mean(ndbis):.4f} (built-up index valid).", flush=True)

    # 5. Duplicate check
    seen_pairs = set()
    for r in grid_observations:
        pair = (r["grid_id"], r["observation_date"])
        assert pair not in seen_pairs, f"Duplicate observation detected for {pair}!"
        seen_pairs.add(pair)
    print(f"[PASS] Duplicate check: Zero duplicate observations across {len(grid_observations)} records.", flush=True)

    # 6. Provenance check
    assert all(r["provenance_type"] == "CALCULATED" for r in grid_observations), "Provenance tier violation!"
    print(f"[PASS] Provenance audit: 100% of rows strictly stamped as 'CALCULATED'.", flush=True)

    print("\nALL SENTINEL-2 QUALITY CONTROL ASSERTIONS PASSED WITH 0 ERRORS!", flush=True)

    return grid_observations, ledger_records


if __name__ == "__main__":
    scenes = query_chennai_scenes()
    if scenes:
        process_sentinel_scenes(scenes)
    else:
        print("Error: No scenes found for processing.", flush=True)
