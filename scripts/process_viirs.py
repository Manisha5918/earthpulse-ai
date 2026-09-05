"""VIIRS Nighttime Lights Real Data Ingestion & Processing Pipeline for Chennai MVP.
Acquires real VIIRS Day/Night Band (DNB) monthly cloud-free composite radiance (ecm-slcorr)
from the AWS Open Data repository (NOAA / Earth Observation Group / World Bank Open Night Lights).
Processes representative multi-year spring composites (April 2021, 2022, 2023, 2024) for Chennai.
Aggregates nighttime radiance onto EarthPulse 0.05° analytical grid cells (CHE_G001 to CHE_G016).
Strict Data Provenance: Zero fabricated values.
"""

import os
import sys
import json
import csv
import time
from datetime import datetime, timezone
from typing import List, Dict, Any
import numpy as np

# Add backend to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.data_sources.viirs import (
    extract_viirs_chennai_raster,
    aggregate_viirs_radiance_cell,
    fetch_range_with_retry,
    tiff_lzw_decode
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASETS_VIIRS_RAW = os.path.join(BASE_DIR, "datasets", "viirs", "raw")
DATASETS_VIIRS_PROC = os.path.join(BASE_DIR, "datasets", "viirs", "processed")
DATASETS_VIIRS_META = os.path.join(BASE_DIR, "datasets", "viirs", "metadata")

DATA_VIIRS_RAW = os.path.join(BASE_DIR, "data", "raw", "viirs")
DATA_VIIRS_PROC = os.path.join(BASE_DIR, "data", "processed", "viirs")
BOUNDARIES_DIR = os.path.join(BASE_DIR, "data", "boundaries")

for d in [DATASETS_VIIRS_RAW, DATASETS_VIIRS_PROC, DATASETS_VIIRS_META, DATA_VIIRS_RAW, DATA_VIIRS_PROC]:
    os.makedirs(d, exist_ok=True)

S3_BASE_URL = "https://globalnightlight.s3.amazonaws.com"

# 4-Year Representative Spring (April) Composites covering Chennai (MGRS-44PMV)
COMPOSITE_TARGETS = [
    {
        "year": 2021,
        "month": "202104",
        "observation_date": "2021-04-01",
        "period_start": "2021-04-01",
        "period_end": "2021-04-30",
        "product_id": "DNB_npp_20210401-20210430_global_ecm-slcorr_v10_ops",
        "key": "composites/npp_202104_ops/DNB_npp_20210401-20210430_global_ecm-slcorr_v10_ops.avg_rade9.tif"
    },
    {
        "year": 2022,
        "month": "202204",
        "observation_date": "2022-04-01",
        "period_start": "2022-04-01",
        "period_end": "2022-04-30",
        "product_id": "DNB_npp_20220401-20220430_global_ecm-slcorr_v10_ops",
        "key": "composites/npp_202204_ops/DNB_npp_20220401-20220430_global_ecm-slcorr_v10_ops.avg_rade9.tif"
    },
    {
        "year": 2023,
        "month": "202304",
        "observation_date": "2023-04-01",
        "period_start": "2023-04-01",
        "period_end": "2023-04-30",
        "product_id": "DNB_npp_20230401-20230430_global_ecm-slcorr_v10_ops",
        "key": "composites/npp_202304_ops/DNB_npp_20230401-20230430_global_ecm-slcorr_v10_ops.avg_rade9.tif"
    },
    {
        "year": 2024,
        "month": "202404",
        "observation_date": "2024-04-01",
        "period_start": "2024-04-01",
        "period_end": "2024-04-30",
        "product_id": "DNB_npp_20240401-20240430_global_ecm-slcorr_v10_ops",
        "key": "composites/npp_202404_ops/DNB_npp_20240401-20240430_global_ecm-slcorr_v10_ops.avg_rade9.tif"
    }
]


def run_viirs_pipeline():
    print("=" * 70, flush=True)
    print("PHASE 3: ACQUIRING REAL VIIRS NIGHTTIME LIGHTS (CHENNAI 2021-2024)", flush=True)
    print("=" * 70, flush=True)

    grid_path = os.path.join(BOUNDARIES_DIR, "chennai_grid_0.05deg.geojson")
    with open(grid_path, "r", encoding="utf-8") as f:
        grid_geojson = json.load(f)

    grid_cells = grid_geojson["features"]
    print(f"Loaded {len(grid_cells)} analytical grid cells from {grid_path}", flush=True)

    raw_metadata_records = []
    grid_observations = []
    ledger_records = []
    processing_timestamp = datetime.now(timezone.utc).isoformat()

    for idx, target in enumerate(COMPOSITE_TARGETS, 1):
        year = target["year"]
        month_str = target["month"]
        product_id = target["product_id"]
        composite_url = f"{S3_BASE_URL}/{target['key']}"

        print(f"\n[{idx}/4] Processing Year {year} ({month_str}) VIIRS Composite...", flush=True)
        print(f"  URL: {composite_url}", flush=True)

        # Extract 2x2 stitched raster via HTTP Range
        t0 = time.time()
        stitched_arr, spatial_meta = extract_viirs_chennai_raster(composite_url)
        elapsed = time.time() - t0
        print(f"  -> Extracted 512x512 Chennai VIIRS raster in {elapsed:.2f}s (Min={stitched_arr.min():.2f}, Max={stitched_arr.max():.2f})", flush=True)

        # Save raw stitched raster numpy array to both datasets/ and data/
        raw_npy_name = f"viirs_chennai_{month_str}_raw.npy"
        np.save(os.path.join(DATASETS_VIIRS_RAW, raw_npy_name), stitched_arr)
        np.save(os.path.join(DATA_VIIRS_RAW, raw_npy_name), stitched_arr)

        raw_meta = {
            "product_id": product_id,
            "year": year,
            "month": month_str,
            "observation_date": target["observation_date"],
            "period_start": target["period_start"],
            "period_end": target["period_end"],
            "source_url": composite_url,
            "variable": "avg_rade9",
            "units": "nW/cm2/sr",
            "native_spatial_resolution": "15 arc-seconds (~500m)",
            "raster_dimensions": list(stitched_arr.shape),
            "origin_x": spatial_meta["origin_x"],
            "origin_y": spatial_meta["origin_y"],
            "scale_x": spatial_meta["scale_x"],
            "scale_y": spatial_meta["scale_y"],
            "crs": spatial_meta["crs"],
            "provenance_type": "OBSERVED"
        }
        raw_metadata_records.append(raw_meta)

        # Perform Zonal Spatial Aggregation on 16 Chennai grid cells
        origin_x = spatial_meta["origin_x"]
        origin_y = spatial_meta["origin_y"]
        scale_x = spatial_meta["scale_x"]
        scale_y = spatial_meta["scale_y"]

        for cell_idx, cell in enumerate(grid_cells, 1):
            props = cell["properties"]
            code = props["cell_code"]
            coords = cell["geometry"]["coordinates"][0]
            lons = [pt[0] for pt in coords]
            lats = [pt[1] for pt in coords]
            min_lon, max_lon = min(lons), max(lons)
            min_lat, max_lat = min(lats), max(lats)

            col_min = int((min_lon - origin_x) / scale_x)
            col_max = int((max_lon - origin_x) / scale_x)
            row_min = int((origin_y - max_lat) / scale_y)
            row_max = int((origin_y - min_lat) / scale_y)

            cell_raster = stitched_arr[row_min:row_max, col_min:col_max]
            stats = aggregate_viirs_radiance_cell(cell_raster)

            # Summary Grid Observation
            grid_observations.append({
                "grid_id": cell_idx,
                "cell_code": code,
                "observation_date": target["observation_date"],
                "observation_period": f"{target['period_start']}/{target['period_end']}",
                "latitude": props["center_lat"],
                "longitude": props["center_lon"],
                "nighttime_radiance_mean": stats["mean_rad"],
                "nighttime_radiance_median": stats["median_rad"],
                "nighttime_radiance_max": stats["max_rad"],
                "nighttime_radiance_min": stats["min_rad"],
                "nighttime_radiance_std": stats["std_rad"],
                "units": "nW/cm2/sr",
                "valid_pixel_count": stats["valid_pixels"],
                "native_spatial_resolution": "15 arc-seconds (~500m)",
                "spatial_resolution": "0.05 deg analytical grid",
                "source_dataset": "VIIRS DNB Monthly Cloud-Free Composite v10_ops (NOAA/EOG/World Bank)",
                "source_product": product_id,
                "provenance_type": "CALCULATED"
            })

            # Relational Observations Ledger Record (PostGIS schema ready)
            ledger_records.append({
                "region_code": "IN-TN-CHE",
                "grid_id": cell_idx,
                "cell_code": code,
                "dataset_id": "noaa_viirs_dnb_monthly_radiance",
                "signal_name": "night_light",
                "signal_value": stats["mean_rad"],
                "unit": "nW/cm2/sr",
                "acquisition_timestamp": f"{target['period_end']}T23:59:59Z",
                "processing_timestamp": processing_timestamp,
                "cloud_cover_pct": 0.0,
                "quality_flag": "VALID_CLOUD_FREE_COMPOSITE",
                "source_name": "NOAA/EOG VIIRS DNB",
                "source_url": composite_url,
                "provenance_type": "CALCULATED"
            })

    # Save raw catalog metadata
    raw_meta_json = os.path.join(DATASETS_VIIRS_RAW, "viirs_chennai_composites_metadata.json")
    with open(raw_meta_json, "w", encoding="utf-8") as f:
        json.dump({
            "provider": "Earth Observation Group (EOG) / NOAA / World Bank Open Night Lights",
            "bucket": S3_BASE_URL,
            "region": "Chennai Metropolitan Area, Tamil Nadu, India",
            "bounding_box": [80.10, 12.85, 80.35, 13.25],
            "variable": "avg_rade9 (Average DNB Radiance, nW/cm2/sr)",
            "composites_count": len(raw_metadata_records),
            "records": raw_metadata_records
        }, f, indent=2)
    # Mirror raw metadata to data/raw/viirs
    with open(os.path.join(DATA_VIIRS_RAW, "viirs_chennai_composites_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(raw_metadata_records, f, indent=2)
    print(f"\nSaved raw metadata to: {raw_meta_json}", flush=True)

    # Save Processed Datasets (in both datasets/ and data/)
    # 1. Grid Observations CSV
    fieldnames = list(grid_observations[0].keys())
    for out_dir in [DATASETS_VIIRS_PROC, DATA_VIIRS_PROC]:
        csv_p = os.path.join(out_dir, "viirs_chennai_grid_observations.csv")
        with open(csv_p, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fieldnames)
            w.writeheader()
            w.writerows(grid_observations)
    print(f"Saved {len(grid_observations)} processed grid rows to: {os.path.join(DATASETS_VIIRS_PROC, 'viirs_chennai_grid_observations.csv')}", flush=True)

    # 2. Grid Observations JSON with full provenance
    grid_json_content = {
        "metadata": {
            "dataset_name": "EarthPulse AI — VIIRS Nighttime Radiance Grid Observations (Chennai MVP)",
            "provider": "NOAA / Earth Observation Group (EOG) / World Bank Open Night Lights",
            "product_type": "DNB Monthly Cloud-Free Radiance Composite (ecm-slcorr)",
            "variable": "avg_rade9",
            "units": "nW/cm2/sr",
            "native_spatial_resolution": "15 arc-seconds (~500m)",
            "analytical_resolution": "0.05 deg regular grid (~5.5km)",
            "temporal_coverage": "2021-04 to 2024-04 (multi-year annual spring baseline)",
            "grid_cells_count": len(grid_cells),
            "total_observations_count": len(grid_observations),
            "provenance_type": "CALCULATED",
            "created_at": processing_timestamp
        },
        "records": grid_observations
    }
    for out_dir in [DATASETS_VIIRS_PROC, DATA_VIIRS_PROC]:
        with open(os.path.join(out_dir, "viirs_chennai_grid_observations.json"), "w", encoding="utf-8") as f:
            json.dump(grid_json_content, f, indent=2)
    print(f"Saved processed JSON dataset to: {os.path.join(DATASETS_VIIRS_PROC, 'viirs_chennai_grid_observations.json')}", flush=True)

    # 3. Observational Ledger CSV
    ledger_fields = list(ledger_records[0].keys())
    for out_dir in [DATASETS_VIIRS_PROC, DATA_VIIRS_PROC]:
        l_csv_p = os.path.join(out_dir, "viirs_chennai_observations_ledger.csv")
        with open(l_csv_p, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=ledger_fields)
            w.writeheader()
            w.writerows(ledger_records)
    print(f"Saved {len(ledger_records)} ledger records to: {os.path.join(DATASETS_VIIRS_PROC, 'viirs_chennai_observations_ledger.csv')}", flush=True)

    # Update datasets/viirs/metadata/viirs_metadata.json
    full_meta = {
        "dataset_name": "VIIRS Day/Night Band (DNB) Monthly Cloud-Free Nocturnal Radiance",
        "dataset_id": "noaa_viirs_dnb_monthly_radiance",
        "provider": "Earth Observation Group (EOG) / NOAA / World Bank Open Night Lights",
        "source_archive": S3_BASE_URL,
        "access_method": "HTTP Range requests on Cloud-Optimized BigTIFF composites",
        "authentication_required": False,
        "api_key_used": False,
        "variable": "avg_rade9",
        "variable_description": "Average nocturnal DNB radiance with extended cloud masking and stray light correction",
        "units": "nW/cm2/sr (10^-9 W/cm^2/sr)",
        "native_spatial_resolution": "15 arc-seconds (0.0041666667 degrees, ~500m)",
        "analytical_aggregation_resolution": "0.0500 degrees (~5.5 km)",
        "temporal_resolution": "Monthly composite",
        "temporal_coverage": {
            "start_period": "2021-04-01",
            "end_period": "2024-04-30",
            "composites_included": [
                "DNB_npp_20210401-20210430_global_ecm-slcorr_v10_ops",
                "DNB_npp_20220401-20220430_global_ecm-slcorr_v10_ops",
                "DNB_npp_20230401-20230430_global_ecm-slcorr_v10_ops",
                "DNB_npp_20240401-20240430_global_ecm-slcorr_v10_ops"
            ]
        },
        "crs": "EPSG:4326 (WGS84)",
        "aggregation_method": "Zonal mean of non-negative valid sensor pixels within each 0.05 degree cell (~144 pixels per cell)",
        "license": "Open Data Commons / NOAA Open Access Data Policy",
        "provenance_rules": {
            "source_raster_pixels": "OBSERVED",
            "grid_aggregated_metrics": "CALCULATED"
        }
    }
    with open(os.path.join(DATASETS_VIIRS_META, "viirs_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(full_meta, f, indent=2)
    print("Updated datasets/viirs/metadata/viirs_metadata.json")

    # ---------------- QUALITY CONTROL & VALIDATION CHECKS ----------------
    print("\n" + "=" * 70, flush=True)
    print("RUNNING VIIRS QUALITY CONTROL VALIDATION CHECKS...", flush=True)
    print("=" * 70, flush=True)

    # 1. Grid cell coverage
    cell_codes = set(r["cell_code"] for r in grid_observations)
    assert len(cell_codes) == 16, f"Expected 16 grid cells, got {len(cell_codes)}"
    print(f"[PASS] Grid cell coverage: All 16 Chennai grid cells (CHE_G001 to CHE_G016) populated.", flush=True)

    # 2. Date range check
    dates = [r["observation_date"] for r in grid_observations]
    assert min(dates) >= "2021-01-01" and max(dates) <= "2024-12-31", "Date outside 2021-2024 range!"
    print(f"[PASS] Temporal range: All observations fall strictly within 2021-2024 ({min(dates)} to {max(dates)}).", flush=True)

    # 3. Spatial bounds check
    for r in grid_observations:
        assert 12.85 <= r["latitude"] <= 13.25, f"Latitude {r['latitude']} outside Chennai bounds!"
        assert 80.10 <= r["longitude"] <= 80.35, f"Longitude {r['longitude']} outside Chennai bounds!"
    print(f"[PASS] Spatial bounds: 100% of grid coordinates fall strictly inside Chennai MVP bounding box.", flush=True)

    # 4. Radiance value sanity check
    rad_means = [r["nighttime_radiance_mean"] for r in grid_observations]
    rad_maxs = [r["nighttime_radiance_max"] for r in grid_observations]
    assert all(v >= 0.0 for v in rad_means), "Negative radiance detected in mean!"
    assert all(v < 500.0 for v in rad_means), "Impossible radiance (>500 nW/cm2/sr) in mean!"
    print(f"[PASS] Radiance validity: min={min(rad_means):.2f}, max={max(rad_means):.2f}, overall_mean={np.mean(rad_means):.2f} nW/cm2/sr.", flush=True)
    print(f"       Peak pixel radiance across region: {max(rad_maxs):.2f} nW/cm2/sr (Urban core).", flush=True)

    # 5. Duplicate check
    seen_pairs = set()
    for r in grid_observations:
        pair = (r["grid_id"], r["observation_date"])
        assert pair not in seen_pairs, f"Duplicate detected for {pair}!"
        seen_pairs.add(pair)
    print(f"[PASS] Duplicate check: Zero duplicates across {len(grid_observations)} records.", flush=True)

    # 6. Provenance check
    assert all(r["provenance_type"] == "CALCULATED" for r in grid_observations), "Provenance tier violation!"
    print(f"[PASS] Provenance audit: 100% of grid rows stamped as 'CALCULATED'.", flush=True)

    # 7. Pixel count check
    assert all(r["valid_pixel_count"] > 100 for r in grid_observations), "Insufficient pixel density!"
    print(f"[PASS] Pixel density: Every 0.05° grid cell contains ~144 real 15 arc-sec sensor pixels.", flush=True)

    print("\nALL VIIRS QUALITY CONTROL ASSERTIONS PASSED WITH 0 ERRORS!", flush=True)
    return grid_observations, ledger_records


if __name__ == "__main__":
    run_viirs_pipeline()
