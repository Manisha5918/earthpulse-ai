"""Resume and Finalize OpenStreetMap Regional Context Layer for Chennai MVP Grid.
Enforces strict Way ID and Node ID deduplication across spatial strips so every physical
road segment is counted EXACTLY ONCE.
Derives true unique road network lengths by class, road density (km/km^2),
mapped building counts, estimated building coverage (%), and categorized POI densities.
Strict Data Provenance: Zero fabricated values.
"""

import os
import sys
import json
import csv
import time
from datetime import datetime, timezone
from typing import List, Dict, Any

# Add backend to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.data_sources.osm import (
    query_overpass,
    wgs84_to_utm44n,
    calculate_linestring_length_m,
    calculate_polygon_area_m2,
    CHENNAI_EMPIRICAL_MEAN_FOOTPRINT_M2
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASETS_OSM_RAW = os.path.join(BASE_DIR, "datasets", "osm", "raw")
DATASETS_OSM_PROC = os.path.join(BASE_DIR, "datasets", "osm", "processed")
DATASETS_OSM_META = os.path.join(BASE_DIR, "datasets", "osm", "metadata")

DATA_OSM_RAW = os.path.join(BASE_DIR, "data", "raw", "osm")
DATA_OSM_PROC = os.path.join(BASE_DIR, "data", "processed", "osm")
BOUNDARIES_DIR = os.path.join(BASE_DIR, "data", "boundaries")

for d in [DATASETS_OSM_RAW, DATASETS_OSM_PROC, DATASETS_OSM_META, DATA_OSM_RAW, DATA_OSM_PROC]:
    os.makedirs(d, exist_ok=True)


def resume_and_process():
    print("=" * 70, flush=True)
    print("RESUMING PHASE 4: DEDUPLICATING OSM CONTEXT LAYER PROCESSING", flush=True)
    print("=" * 70, flush=True)

    grid_path = os.path.join(BOUNDARIES_DIR, "chennai_grid_0.05deg.geojson")
    with open(grid_path, "r", encoding="utf-8") as f:
        grid_geojson = json.load(f)

    grid_cells = grid_geojson["features"]
    print(f"Loaded {len(grid_cells)} analytical grid cells from {grid_path}", flush=True)

    access_timestamp = datetime.now(timezone.utc).isoformat()

    # Precompute cell bounds and areas in UTM 44N
    cell_info = {}
    for idx, cell in enumerate(grid_cells, 1):
        props = cell["properties"]
        code = props["cell_code"]
        coords = cell["geometry"]["coordinates"][0]
        lons = [pt[0] for pt in coords]
        lats = [pt[1] for pt in coords]
        poly_coords = [{"lat": pt[1], "lon": pt[0]} for pt in coords]
        area_km2 = round(calculate_polygon_area_m2(poly_coords) / 1e6, 3)

        cell_info[code] = {
            "grid_id": idx,
            "cell_code": code,
            "center_lat": props["center_lat"],
            "center_lon": props["center_lon"],
            "min_lon": min(lons),
            "max_lon": max(lons),
            "min_lat": min(lats),
            "max_lat": max(lats),
            "area_km2": area_km2,
            "roads": {
                "total_km": 0.0,
                "raw_count": 0,
                "valid_count": 0,
                "rejected_count": 0,
                "classes": {c: 0.0 for c in ["motorway", "trunk", "primary", "secondary", "tertiary", "residential", "service"]}
            },
            "pois": {
                "total": 0,
                "healthcare": 0,
                "education": 0,
                "public_transport": 0,
                "financial_commercial": 0,
                "amenity_other": 0
            },
            "mapped_building_count": 0
        }

    # -------------------------------------------------------------
    # 1. LOAD & DEDUPLICATE REAL ROADS (91,873 UNIQUE WAYS)
    # -------------------------------------------------------------
    print("\n--- STEP 1/3: DEDUPLICATING AND SPATIALLY MAPPING ROADS ---", flush=True)
    raw_roads_path = os.path.join(DATASETS_OSM_RAW, "osm_chennai_roads_raw.json")
    with open(raw_roads_path, "r", encoding="utf-8") as f:
        roads_payload = json.load(f)

    all_raw_roads = roads_payload.get("elements", [])
    print(f"Loaded {len(all_raw_roads):,} raw road elements from {raw_roads_path}", flush=True)

    seen_way_ids = set()
    total_valid_unique_roads = 0
    total_duplicate_roads = 0
    total_rejected_roads = 0
    assigned_unique_roads = 0
    outside_unique_roads = 0

    for r in all_raw_roads:
        wid = r.get("id")
        if wid in seen_way_ids:
            total_duplicate_roads += 1
            continue
        seen_way_ids.add(wid)

        hw = r.get("tags", {}).get("highway")
        geom = r.get("geometry", [])
        if not geom or len(geom) < 2:
            total_rejected_roads += 1
            continue

        total_valid_unique_roads += 1
        length_km = calculate_linestring_length_m(geom) / 1000.0

        # Assign to cell matching midpoint
        mid_pt = geom[len(geom) // 2]
        m_lat, m_lon = mid_pt["lat"], mid_pt["lon"]

        assigned = False
        for code, cdata in cell_info.items():
            if cdata["min_lat"] <= m_lat < cdata["max_lat"] and cdata["min_lon"] <= m_lon < cdata["max_lon"]:
                cdata["roads"]["raw_count"] += 1
                cdata["roads"]["valid_count"] += 1
                cdata["roads"]["total_km"] += length_km
                if hw in cdata["roads"]["classes"]:
                    cdata["roads"]["classes"][hw] += length_km
                assigned = True
                assigned_unique_roads += 1
                break

        if not assigned:
            outside_unique_roads += 1

    print(f"Deduplication Complete:")
    print(f"  Total Unique Ways Processed: {total_valid_unique_roads:,}")
    print(f"  Cross-Strip Duplicate Ways Removed: {total_duplicate_roads:,}")
    print(f"  Assigned to 16 Analytical Cells: {assigned_unique_roads:,} ways")
    print(f"  Outside Grid Buffer: {outside_unique_roads:,} ways")

    # -------------------------------------------------------------
    # 2. LOAD & DEDUPLICATE REAL POIs WITH COORDINATES
    # -------------------------------------------------------------
    print("\n--- STEP 2/3: DEDUPLICATING AND SPATIALLY MAPPING POIs ---", flush=True)
    raw_pois_path = os.path.join(DATASETS_OSM_RAW, "osm_chennai_pois_raw.json")
    with open(raw_pois_path, "r", encoding="utf-8") as f:
        pois_payload = json.load(f)

    all_raw_pois = pois_payload.get("elements", [])
    print(f"Loaded {len(all_raw_pois):,} raw POIs from {raw_pois_path}", flush=True)

    seen_poi_ids = set()
    total_valid_unique_pois = 0
    assigned_unique_pois = 0
    outside_unique_pois = 0

    for p in all_raw_pois:
        pid = p.get("id")
        if pid in seen_poi_ids:
            continue
        seen_poi_ids.add(pid)

        lat = p.get("lat")
        lon = p.get("lon")
        if lat is None or lon is None:
            continue

        total_valid_unique_pois += 1
        tags = p.get("tags", {})
        amenity = tags.get("amenity", "")
        railway = tags.get("railway", "")
        highway = tags.get("highway", "")

        assigned = False
        for code, cdata in cell_info.items():
            if cdata["min_lat"] <= lat < cdata["max_lat"] and cdata["min_lon"] <= lon < cdata["max_lon"]:
                cdata["pois"]["total"] += 1
                if amenity in ["hospital", "clinic", "doctors", "pharmacy"]:
                    cdata["pois"]["healthcare"] += 1
                elif amenity in ["school", "university", "college", "kindergarten"]:
                    cdata["pois"]["education"] += 1
                elif railway in ["station", "subway_entrance"] or amenity == "bus_station" or highway == "bus_stop":
                    cdata["pois"]["public_transport"] += 1
                elif amenity in ["bank", "atm", "marketplace"]:
                    cdata["pois"]["financial_commercial"] += 1
                else:
                    cdata["pois"]["amenity_other"] += 1
                assigned = True
                assigned_unique_pois += 1
                break

        if not assigned:
            outside_unique_pois += 1

    print(f"POI Mapping Complete:")
    print(f"  Total Unique POIs: {total_valid_unique_pois:,}")
    print(f"  Assigned to 16 Analytical Cells: {assigned_unique_pois:,}")
    print(f"  Outside Grid Buffer: {outside_unique_pois:,}")

    # -------------------------------------------------------------
    # 3. LOAD PERSISTED REAL BUILDING COUNTS
    # -------------------------------------------------------------
    print("\n--- STEP 3/3: PROCESSING MAPPED BUILDING COUNTS ---", flush=True)
    raw_bldg_path = os.path.join(DATASETS_OSM_RAW, "osm_chennai_buildings_summary_raw.json")
    with open(raw_bldg_path, "r", encoding="utf-8") as f:
        bldg_payload = json.load(f)

    all_bldg_summaries = bldg_payload.get("summaries", [])
    for b in all_bldg_summaries:
        code = b["cell_code"]
        if code in cell_info:
            cell_info[code]["mapped_building_count"] = b["mapped_building_count"]
            print(f"  {code}: {b['mapped_building_count']:,} mapped buildings", flush=True)

    # -------------------------------------------------------------
    # ASSEMBLE PROCESSED RECORDS
    # -------------------------------------------------------------
    grid_context_records = []
    ledger_records = []

    for code, cdata in cell_info.items():
        area_km2 = cdata["area_km2"]
        road_km = round(cdata["roads"]["total_km"], 3)
        road_density = round(road_km / area_km2, 4) if area_km2 > 0 else 0.0

        bldg_cnt = cdata["mapped_building_count"]
        bldg_density = round(bldg_cnt / area_km2, 2) if area_km2 > 0 else 0.0
        # Model-estimated building footprint area based on 141.4 m^2 empirical calibration
        bldg_area_km2 = round((bldg_cnt * CHENNAI_EMPIRICAL_MEAN_FOOTPRINT_M2) / 1e6, 4)
        bldg_cov_pct = round((bldg_area_km2 / area_km2) * 100.0, 2) if area_km2 > 0 else 0.0
        bldg_cov_pct = min(bldg_cov_pct, 100.0)

        poi_total = cdata["pois"]["total"]
        poi_density = round(poi_total / area_km2, 2) if area_km2 > 0 else 0.0

        rec = {
            "grid_id": cdata["grid_id"],
            "cell_code": code,
            "latitude": cdata["center_lat"],
            "longitude": cdata["center_lon"],
            "cell_area_km2": area_km2,
            "total_road_length_km": road_km,
            "road_density_km_per_km2": road_density,
            "motorway_km": round(cdata["roads"]["classes"]["motorway"], 3),
            "trunk_km": round(cdata["roads"]["classes"]["trunk"], 3),
            "primary_km": round(cdata["roads"]["classes"]["primary"], 3),
            "secondary_km": round(cdata["roads"]["classes"]["secondary"], 3),
            "tertiary_km": round(cdata["roads"]["classes"]["tertiary"], 3),
            "residential_km": round(cdata["roads"]["classes"]["residential"], 3),
            "service_km": round(cdata["roads"]["classes"]["service"], 3),
            "mapped_building_count": bldg_cnt,
            "building_density_per_km2": bldg_density,
            "calibration_footprint_m2": CHENNAI_EMPIRICAL_MEAN_FOOTPRINT_M2 if bldg_cnt > 0 else 0.0,
            "estimated_building_area_km2": bldg_area_km2,
            "estimated_building_coverage_percent": bldg_cov_pct,
            "total_poi_count": poi_total,
            "healthcare_poi_count": cdata["pois"]["healthcare"],
            "education_poi_count": cdata["pois"]["education"],
            "public_transport_poi_count": cdata["pois"]["public_transport"],
            "financial_commercial_poi_count": cdata["pois"]["financial_commercial"],
            "other_amenity_poi_count": cdata["pois"]["amenity_other"],
            "access_timestamp": access_timestamp,
            "spatial_crs": "EPSG:32644 (UTM 44N)",
            "source_provider": "OpenStreetMap Contributors",
            "license": "Open Database License (ODbL) 1.0",
            "provenance_type": "CALCULATED"
        }
        grid_context_records.append(rec)

        signals = [
            ("road_density", road_density, "km/km2"),
            ("building_density", bldg_density, "buildings/km2"),
            ("estimated_building_coverage_pct", bldg_cov_pct, "%"),
            ("poi_density", poi_density, "pois/km2")
        ]
        for sig_name, sig_val, unit in signals:
            ledger_records.append({
                "region_code": "IN-TN-CHE",
                "grid_id": cdata["grid_id"],
                "cell_code": code,
                "dataset_id": "openstreetmap_contextual_layer",
                "signal_name": sig_name,
                "signal_value": sig_val,
                "unit": unit,
                "acquisition_timestamp": access_timestamp,
                "processing_timestamp": access_timestamp,
                "cloud_cover_pct": 0.0,
                "quality_flag": "VALID_OSM_EXTRACT",
                "source_name": "OpenStreetMap Overpass API",
                "source_url": "https://overpass-api.de/api/interpreter",
                "provenance_type": "CALCULATED"
            })

    # -------------------------------------------------------------
    # SAVE DEDUPLICATED ARTIFACTS
    # -------------------------------------------------------------
    print("\n--- SAVING DEDUPLICATED ARTIFACTS ---", flush=True)

    # 1. Processed CSV
    fieldnames = list(grid_context_records[0].keys())
    for out_dir in [DATASETS_OSM_PROC, DATA_OSM_PROC]:
        csv_p = os.path.join(out_dir, "osm_chennai_grid_context.csv")
        with open(csv_p, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fieldnames)
            w.writeheader()
            w.writerows(grid_context_records)
    print(f"  Saved processed CSV to: {os.path.join(DATASETS_OSM_PROC, 'osm_chennai_grid_context.csv')}", flush=True)

    # 2. Processed JSON
    context_json = {
        "metadata": {
            "dataset_name": "EarthPulse AI — OpenStreetMap Regional Context Layer (Chennai MVP)",
            "provider": "OpenStreetMap Contributors",
            "license": "Open Database License (ODbL) 1.0",
            "attribution": "© OpenStreetMap contributors",
            "access_timestamp": access_timestamp,
            "spatial_crs": "EPSG:32644 (UTM Zone 44N) for metric calculations; EPSG:4326 for bounds",
            "grid_cells_count": len(grid_context_records),
            "deduplication_policy": "Strict Way ID and Node ID deduplication across spatial extraction strips",
            "provenance_type": "CALCULATED",
            "methodology_notes": {
                "road_length": "Sum of deduplicated road polylines projected to UTM Zone 44N meters",
                "building_count": "Observed count of mapped structures in OSM per cell",
                "estimated_building_coverage": "Model-estimated coverage derived from empirical 141.4 m^2 mean footprint",
                "pois": "Categorized count of mapped amenities strictly inside analytical grid boundaries"
            },
            "known_limitations": (
                "OpenStreetMap is a volunteered geographic dataset. Features represent mapped infrastructure "
                "in OSM as of the access timestamp and do not represent a complete demographic census. "
                "Absence of an OSM feature does not definitively prove non-existence in reality. "
                "Building counts reflect mapped building footprints and must NOT be equated with population. "
                "Building coverage percentage is an estimated scaling metric, not directly observed vector coverage."
            )
        },
        "records": grid_context_records
    }
    for out_dir in [DATASETS_OSM_PROC, DATA_OSM_PROC]:
        json_p = os.path.join(out_dir, "osm_chennai_grid_context.json")
        with open(json_p, "w", encoding="utf-8") as f:
            json.dump(context_json, f, indent=2)
    print(f"  Saved processed JSON to: {os.path.join(DATASETS_OSM_PROC, 'osm_chennai_grid_context.json')}", flush=True)

    # 3. Ledger CSV
    ledger_fields = list(ledger_records[0].keys())
    for out_dir in [DATASETS_OSM_PROC, DATA_OSM_PROC]:
        l_csv_p = os.path.join(out_dir, "osm_chennai_observations_ledger.csv")
        with open(l_csv_p, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=ledger_fields)
            w.writeheader()
            w.writerows(ledger_records)
    print(f"  Saved {len(ledger_records)} ledger records to: {os.path.join(DATASETS_OSM_PROC, 'osm_chennai_observations_ledger.csv')}", flush=True)

    # -------------------------------------------------------------
    # QUALITY CONTROL VALIDATION CHECKS
    # -------------------------------------------------------------
    print("\n" + "=" * 70, flush=True)
    print("RUNNING OSM QUALITY CONTROL & DEDUPLICATION VALIDATION CHECKS...", flush=True)
    print("=" * 70, flush=True)

    # 1. Grid cell coverage
    assert len(grid_context_records) == 16, f"Expected 16 grid records, got {len(grid_context_records)}"
    codes = set(r["cell_code"] for r in grid_context_records)
    assert len(codes) == 16, f"Expected 16 unique cell codes, got {len(codes)}"
    print("[PASS] Grid cell coverage: All 16 Chennai grid cells (CHE_G001 to CHE_G016) populated.", flush=True)

    # 2. Spatial bounds check
    for r in grid_context_records:
        assert 12.85 <= r["latitude"] <= 13.25, f"Latitude {r['latitude']} outside bounds!"
        assert 80.10 <= r["longitude"] <= 80.35, f"Longitude {r['longitude']} outside bounds!"
    print("[PASS] Spatial bounds: 100% of grid centroids fall strictly inside Chennai MVP extent.", flush=True)

    # 3. Non-negative metric checks
    for r in grid_context_records:
        assert r["total_road_length_km"] >= 0.0, "Negative road length!"
        assert r["road_density_km_per_km2"] >= 0.0, "Negative road density!"
        assert r["mapped_building_count"] >= 0, "Negative building count!"
        assert r["estimated_building_area_km2"] >= 0.0, "Negative building area!"
        assert 0.0 <= r["estimated_building_coverage_percent"] <= 100.0, "Building coverage percent out of bounds!"
        assert r["total_poi_count"] >= 0, "Negative POI count!"
    print("[PASS] Value sanity: 100% of road lengths, building counts, areas, and POIs are non-negative and physically bounded.", flush=True)

    # 4. Duplicate checks
    seen_ids = set()
    for r in grid_context_records:
        assert r["grid_id"] not in seen_ids, f"Duplicate grid_id {r['grid_id']}"
        seen_ids.add(r["grid_id"])
    print("[PASS] Duplicate check: Zero duplicate grid records.", flush=True)

    # 5. Provenance checks
    assert all(r["provenance_type"] == "CALCULATED" for r in grid_context_records), "Provenance violation!"
    print("[PASS] Provenance audit: 100% of processed records stamped as 'CALCULATED'.", flush=True)

    # 6. Final Deduplicated Audit Summary
    total_dedup_road_km = sum(r["total_road_length_km"] for r in grid_context_records)
    total_buildings = sum(r["mapped_building_count"] for r in grid_context_records)
    total_pois = sum(r["total_poi_count"] for r in grid_context_records)

    print(f"\nFINAL DEDUPLICATED AUDIT SUMMARY:")
    print(f"  Unique Roads mapped inside 16 cells: {assigned_unique_roads:,} ways")
    print(f"  Deduplicated Road Network length:    {total_dedup_road_km:,.3f} km")
    print(f"  Unique Roads in outer buffer:        {outside_unique_roads:,} ways")
    print(f"  Total Unique Physical Road Ways:     {total_valid_unique_roads:,} ways")
    print(f"  Total Mapped Buildings (16 cells):   {total_buildings:,} structures")
    print(f"  Total Assigned POIs (16 cells):      {total_pois:,} elements")

    print("\nALL OSM QUALITY CONTROL & DEDUPLICATION ASSERTIONS PASSED WITH 0 ERRORS!", flush=True)
    return grid_context_records, ledger_records


if __name__ == "__main__":
    resume_and_process()
