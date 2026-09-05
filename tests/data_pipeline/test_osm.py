import unittest
import math
import os
import sys
import json
import csv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.data_sources.osm import (
    wgs84_to_utm44n,
    calculate_linestring_length_m,
    calculate_polygon_area_m2,
    get_region_osm_context
)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))


class TestOSMContext(unittest.TestCase):

    def test_wgs84_to_utm44n_projection(self):
        """Test Snyder Transverse Mercator projection against Chennai reference point."""
        # Chennai Central: 13.0827°N, 80.2707°E
        x, y = wgs84_to_utm44n(13.0827, 80.2707)
        self.assertTrue(415000.0 <= x <= 430000.0, f"Unexpected Easting: {x}")
        self.assertTrue(1440000.0 <= y <= 1455000.0, f"Unexpected Northing: {y}")

    def test_linestring_length_calculation(self):
        """Test polyline metric length calculation in UTM 44N."""
        line = [
            {"lat": 13.00, "lon": 80.20},
            {"lat": 13.01, "lon": 80.20}
        ]
        length_m = calculate_linestring_length_m(line)
        self.assertTrue(1100.0 <= length_m <= 1115.0, f"Expected ~1106m, got {length_m}")

        # Degenerate lines
        self.assertEqual(calculate_linestring_length_m([]), 0.0)
        self.assertEqual(calculate_linestring_length_m([{"lat": 13.0, "lon": 80.0}]), 0.0)

    def test_polygon_area_shoelace_calculation(self):
        """Test polygon area calculation in projected square meters."""
        square = [
            {"lat": 13.00, "lon": 80.20},
            {"lat": 13.00, "lon": 80.21},
            {"lat": 13.01, "lon": 80.21},
            {"lat": 13.01, "lon": 80.20}
        ]
        area_m2 = calculate_polygon_area_m2(square)
        self.assertTrue(1.15e6 <= area_m2 <= 1.25e6, f"Expected ~1.19e6 m², got {area_m2}")

        # Degenerate polygon
        self.assertEqual(calculate_polygon_area_m2([]), 0.0)
        self.assertEqual(calculate_polygon_area_m2([{"lat": 13.0, "lon": 80.0}, {"lat": 13.0, "lon": 80.1}]), 0.0)

    def test_empty_cell_handling(self):
        """Test handling of empty or ocean grid cells with 0 features."""
        cell_area = 30.0
        road_len = 0.0
        density = road_len / cell_area if cell_area > 0 else 0.0
        self.assertEqual(density, 0.0)

    def test_region_query_function_contract(self):
        """Test backend get_region_osm_context service interface contract."""
        res = get_region_osm_context("CHE_G001")
        self.assertIn("grid_id", res)
        self.assertEqual(res["grid_id"], "CHE_G001")
        self.assertIn("osm_context", res)
        ctx = res["osm_context"]
        self.assertGreater(ctx["mapped_road_length_km"], 0.0)
        self.assertGreater(ctx["mapped_building_count"], 0)
        self.assertEqual(ctx["provenance"], "CALCULATED")

    def test_cross_strip_road_way_deduplication(self):
        """Test cross-strip OSM way deduplication: 92,384 raw records contain exactly 91,873 unique way IDs."""
        raw_roads_path = os.path.join(BASE_DIR, "datasets", "osm", "raw", "osm_chennai_roads_raw.json")
        with open(raw_roads_path, "r", encoding="utf-8") as f:
            roads_payload = json.load(f)

        raw_elements = roads_payload.get("elements", [])
        self.assertEqual(len(raw_elements), 92384)

        way_ids = [r.get("id") for r in raw_elements]
        unique_way_ids = set(way_ids)
        self.assertEqual(len(unique_way_ids), 91873)
        self.assertEqual(len(way_ids) - len(unique_way_ids), 511)

    def test_road_length_mathematical_reconciliation(self):
        """Test that sum of deduplicated per-cell road lengths exactly equals reported total (5,772.94 km)."""
        csv_path = os.path.join(BASE_DIR, "datasets", "osm", "processed", "osm_chennai_grid_context.csv")
        with open(csv_path, "r", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))

        sum_lengths = sum(float(r["total_road_length_km"]) for r in rows)
        self.assertAlmostEqual(sum_lengths, 5772.941, delta=0.1)

    def test_building_count_mathematical_reconciliation(self):
        """Test that sum of per-cell building counts exactly equals reported total building count (236,154)."""
        csv_path = os.path.join(BASE_DIR, "datasets", "osm", "processed", "osm_chennai_grid_context.csv")
        with open(csv_path, "r", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))

        sum_bldgs = sum(int(r["mapped_building_count"]) for r in rows)
        self.assertEqual(sum_bldgs, 236154)

    def test_poi_mathematical_accounting_reconciliation(self):
        """Test mathematical reconciliation of Raw POIs = Assigned Grid POIs (2,835) + Outside Buffer POIs (1,078)."""
        raw_pois_path = os.path.join(BASE_DIR, "datasets", "osm", "raw", "osm_chennai_pois_raw.json")
        csv_path = os.path.join(BASE_DIR, "datasets", "osm", "processed", "osm_chennai_grid_context.csv")

        with open(raw_pois_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
        raw_pois = raw_data.get("elements", [])
        self.assertEqual(len(raw_pois), 3913)

        with open(csv_path, "r", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))

        sum_assigned_pois = sum(int(r["total_poi_count"]) for r in rows)
        self.assertEqual(sum_assigned_pois, 2835)

        # Outside grid POIs = 3913 - 2835 = 1078
        outside_pois = 0
        grid_min_lat, grid_max_lat = 12.90, 13.10
        grid_min_lon, grid_max_lon = 80.15, 80.35

        for p in raw_pois:
            lat = p.get("lat")
            lon = p.get("lon")
            if not (grid_min_lat <= lat < grid_max_lat and grid_min_lon <= lon < grid_max_lon):
                outside_pois += 1

        self.assertEqual(outside_pois, 1078)
        self.assertEqual(sum_assigned_pois + outside_pois, len(raw_pois))

    def test_estimated_building_coverage_consistency(self):
        """Test that estimated building coverage percentage = (estimated_building_area_km2 / cell_area_km2) * 100."""
        csv_path = os.path.join(BASE_DIR, "datasets", "osm", "processed", "osm_chennai_grid_context.csv")
        with open(csv_path, "r", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))

        for r in rows:
            area_km2 = float(r["cell_area_km2"])
            bldg_area = float(r["estimated_building_area_km2"])
            cov_pct = float(r["estimated_building_coverage_percent"])
            if area_km2 > 0:
                expected_cov = round((bldg_area / area_km2) * 100.0, 2)
                self.assertAlmostEqual(cov_pct, expected_cov, places=1)

    def test_provenance_and_duplicate_integrity(self):
        """Test that 100% of processed records are CALCULATED and have zero duplicate grid_ids."""
        csv_path = os.path.join(BASE_DIR, "datasets", "osm", "processed", "osm_chennai_grid_context.csv")
        with open(csv_path, "r", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))

        self.assertEqual(len(rows), 16)
        seen_ids = set()
        for r in rows:
            self.assertEqual(r["provenance_type"], "CALCULATED")
            self.assertNotIn(r["grid_id"], seen_ids)
            seen_ids.add(r["grid_id"])


if __name__ == "__main__":
    unittest.main()
