import unittest
import os
import sys
import time
from datetime import date
from starlette.testclient import TestClient

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.main import app
from app.schemas.analysis import (
    AnalysisRequest,
    LocationSpec,
    LocationType,
    SignalType,
    AvailabilityStatus,
    JobState
)
from app.services.availability_engine import AvailabilityEngine, resolve_location
from app.services.cache_service import CacheService
from app.services.job_service import JobService
from app.services.orchestrator import MultiSignalOrchestrator


class TestUnifiedAnalysisAPI(unittest.TestCase):

    def setUp(self):
        CacheService.clear()
        self.client = TestClient(app)

    # -------------------------------------------------------------
    # 1. CORE SYNCHRONOUS ANALYSIS & PROVENANCE TESTS
    # -------------------------------------------------------------
    def test_chennai_synchronous_analysis_real_data(self):
        """Test unified analysis request for Chennai returns real multi-signal observations."""
        req = AnalysisRequest(
            location=LocationSpec(type=LocationType.REGION, region_code="IN-TN-CHE"),
            start_date=date(2021, 1, 1),
            end_date=date(2024, 12, 31),
            signals=[SignalType.SENTINEL2, SignalType.VIIRS, SignalType.NASA_POWER, SignalType.OSM]
        )
        resp = JobService.execute_analysis(req)

        # Status: VIIRS is annual April baseline, so overall status is PARTIAL_DATA (transparent disclosure)
        self.assertIn(resp.status, [AvailabilityStatus.AVAILABLE, AvailabilityStatus.PARTIAL_DATA])
        self.assertTrue(resp.location.is_verified_pilot_extent)
        self.assertEqual(len(resp.location.matched_cells), 16)

        # Profile Verification
        p = resp.profile
        self.assertIsNotNone(p)

        # 1. Sentinel-2
        self.assertIsNotNone(p.sentinel2)
        self.assertEqual(len(p.sentinel2), 4)  # 4 verified scenes: 2021-05-30, 2022-04-05, 2023-05-20, 2024-04-29
        self.assertEqual(p.sentinel2[0].provenance, "CALCULATED")

        # 2. VIIRS
        self.assertIsNotNone(p.viirs)
        self.assertEqual(len(p.viirs), 4)  # 4 April composites
        self.assertEqual(p.viirs[0].period, "2021-04")
        self.assertEqual(p.viirs[0].unit, "nW/(cm^2*sr)")

        # 3. NASA POWER
        self.assertIsNotNone(p.nasa_power)
        self.assertEqual(p.nasa_power.observation_count, 1461)
        self.assertGreater(p.nasa_power.mean_temperature_c, 20.0)
        self.assertEqual(p.nasa_power.provenance, "OBSERVED")

        # 4. OpenStreetMap
        self.assertIsNotNone(p.osm)
        self.assertAlmostEqual(p.osm.total_road_length_km, 5772.941, delta=0.5)
        self.assertEqual(p.osm.mapped_building_count, 236154)
        self.assertEqual(p.osm.poi_counts["total"], 2835)
        self.assertEqual(p.osm.temporal_semantics, "SNAPSHOT")

    def test_bengaluru_cannot_return_chennai_data(self):
        """Test that a request for Bengaluru (12.9716, 77.5946) returns PROCESSING_REQUIRED and NEVER Chennai data."""
        req = AnalysisRequest(
            location=LocationSpec(type=LocationType.POINT, coordinates=[12.9716, 77.5946]),
            start_date=date(2021, 1, 1),
            end_date=date(2024, 12, 31),
            signals=[SignalType.SENTINEL2, SignalType.VIIRS, SignalType.NASA_POWER, SignalType.OSM]
        )
        resp = JobService.execute_analysis(req)

        self.assertFalse(resp.location.is_verified_pilot_extent)
        self.assertEqual(resp.status, AvailabilityStatus.PROCESSING_REQUIRED)
        self.assertIsNone(resp.location.matched_region)
        self.assertEqual(len(resp.location.matched_cells), 0)

        # Profile MUST NOT contain Chennai data
        p = resp.profile
        self.assertIsNone(p.sentinel2)
        self.assertIsNone(p.viirs)
        self.assertIsNone(p.nasa_power)
        self.assertIsNone(p.osm)

    def test_unsupported_location_outside_india(self):
        """Test that querying outside India (London 51.5074, -0.1278) returns DATA_UNAVAILABLE."""
        req = AnalysisRequest(
            location=LocationSpec(type=LocationType.POINT, coordinates=[51.5074, -0.1278]),
            start_date=date(2021, 1, 1),
            end_date=date(2024, 12, 31),
            signals=[SignalType.SENTINEL2, SignalType.VIIRS, SignalType.NASA_POWER, SignalType.OSM]
        )
        resp = JobService.execute_analysis(req)
        self.assertEqual(resp.status, AvailabilityStatus.DATA_UNAVAILABLE)
        for sig_name, avail in resp.signal_availability.items():
            self.assertEqual(avail.status, AvailabilityStatus.DATA_UNAVAILABLE)

    # -------------------------------------------------------------
    # 2. TEMPORAL & SENSOR INTEGRITY TESTS
    # -------------------------------------------------------------
    def test_sentinel2_exact_scene_date_filtering(self):
        """Test that date filters correctly match verified Sentinel-2 scene dates (2021-05-30, 2022-04-05, etc.)."""
        # Range matching only the 2021-05-30 scene
        req = AnalysisRequest(
            location=LocationSpec(type=LocationType.REGION, region_code="IN-TN-CHE"),
            start_date=date(2021, 5, 1),
            end_date=date(2021, 6, 1),
            signals=[SignalType.SENTINEL2]
        )
        resp = JobService.execute_analysis(req)
        s2_avail = resp.signal_availability["sentinel2"]
        self.assertEqual(s2_avail.status, AvailabilityStatus.AVAILABLE)
        self.assertEqual(s2_avail.actual_available_period, ["2021-05-30"])
        self.assertEqual(len(resp.profile.sentinel2), 1)
        self.assertEqual(resp.profile.sentinel2[0].observation_date, "2021-05-30")

    def test_nasa_power_temporal_bounds(self):
        """Test NASA POWER availability returns DATA_UNAVAILABLE for dates outside 2021-2024."""
        req = AnalysisRequest(
            location=LocationSpec(type=LocationType.REGION, region_code="IN-TN-CHE"),
            start_date=date(2010, 1, 1),
            end_date=date(2010, 12, 31),
            signals=[SignalType.NASA_POWER]
        )
        resp = JobService.execute_analysis(req)
        self.assertEqual(resp.signal_availability["nasa_power"].status, AvailabilityStatus.DATA_UNAVAILABLE)

    def test_viirs_annual_baseline_disclosure(self):
        """Test VIIRS availability returns PARTIAL_DATA with ANNUAL_BASELINE temporal semantics."""
        req = AnalysisRequest(
            location=LocationSpec(type=LocationType.REGION, region_code="IN-TN-CHE"),
            start_date=date(2021, 1, 1),
            end_date=date(2024, 12, 31),
            signals=[SignalType.VIIRS]
        )
        resp = JobService.execute_analysis(req)
        v_avail = resp.signal_availability["viirs"]
        self.assertEqual(v_avail.status, AvailabilityStatus.PARTIAL_DATA)
        self.assertEqual(v_avail.temporal_semantics, "ANNUAL_BASELINE")
        self.assertEqual(v_avail.actual_available_period, ["2021-04", "2022-04", "2023-04", "2024-04"])

    def test_osm_snapshot_temporal_semantics(self):
        """Test OpenStreetMap availability explicitly returns SNAPSHOT semantics and canonical timestamp."""
        req = AnalysisRequest(
            location=LocationSpec(type=LocationType.REGION, region_code="IN-TN-CHE"),
            start_date=date(2021, 1, 1),
            end_date=date(2024, 12, 31),
            signals=[SignalType.OSM]
        )
        resp = JobService.execute_analysis(req)
        osm_avail = resp.signal_availability["osm"]
        self.assertEqual(osm_avail.status, AvailabilityStatus.AVAILABLE)
        self.assertEqual(osm_avail.temporal_semantics, "SNAPSHOT")
        self.assertIn("2026-09-03", osm_avail.actual_available_period["timestamp"])

    # -------------------------------------------------------------
    # 3. SPATIAL RESOLUTION & ENTITY TESTS
    # -------------------------------------------------------------
    def test_single_grid_cell_analysis(self):
        """Test querying individual grid cell (CHE_G006) returns exact cell metrics."""
        req = AnalysisRequest(
            location=LocationSpec(type=LocationType.GRID_CELL, cell_code="CHE_G006"),
            start_date=date(2021, 1, 1),
            end_date=date(2024, 12, 31),
            signals=[SignalType.OSM, SignalType.VIIRS]
        )
        resp = JobService.execute_analysis(req)
        self.assertTrue(resp.location.is_verified_pilot_extent)
        self.assertEqual(resp.location.matched_cells, ["CHE_G006"])
        self.assertAlmostEqual(resp.profile.osm.total_road_length_km, 599.814, delta=0.5)
        self.assertEqual(resp.profile.osm.mapped_building_count, 24022)

    def test_bounding_box_analysis(self):
        """Test bounding box matching overlapping cells inside Chennai."""
        req = AnalysisRequest(
            location=LocationSpec(type=LocationType.BBOX, coordinates=[12.95, 80.20, 13.05, 80.25]),
            start_date=date(2021, 1, 1),
            end_date=date(2024, 12, 31),
            signals=[SignalType.OSM]
        )
        resp = JobService.execute_analysis(req)
        self.assertTrue(resp.location.is_verified_pilot_extent)
        self.assertGreater(len(resp.location.matched_cells), 0)

    def test_invalid_bbox_validation_rejection(self):
        """Test that invalid BBOX coordinates (min_lat > max_lat) are rejected during validation."""
        with self.assertRaises(ValueError):
            LocationSpec(type=LocationType.BBOX, coordinates=[13.25, 80.10, 12.85, 80.35])

    # -------------------------------------------------------------
    # 4. ASYNC JOB LIFECYCLE & CACHING TESTS
    # -------------------------------------------------------------
    def test_asynchronous_job_lifecycle(self):
        """Test asynchronous job submission, polling, and state transition lifecycle."""
        req = AnalysisRequest(
            location=LocationSpec(type=LocationType.REGION, region_code="IN-TN-CHE"),
            start_date=date(2021, 1, 1),
            end_date=date(2024, 12, 31),
            signals=[SignalType.NASA_POWER]
        )
        job_init = JobService.create_async_job(req)
        self.assertIn(job_init.status, [JobState.QUEUED, JobState.RETRIEVING_DATA])

        # Wait for worker completion through state transitions
        for _ in range(30):
            time.sleep(0.05)
            polled = JobService.get_job(job_init.job_id)
            if polled.status in [JobState.COMPLETED, JobState.PARTIAL, JobState.FAILED]:
                break

        final_job = JobService.get_job(job_init.job_id)
        self.assertEqual(final_job.status, JobState.COMPLETED)
        self.assertEqual(final_job.progress_pct, 100)
        self.assertIsNotNone(final_job.result)
        self.assertEqual(final_job.result.profile.nasa_power.observation_count, 1461)
        self.assertGreater(len(final_job.logs), 2)

    def test_deterministic_caching(self):
        """Test that identical subsequent requests hit the cache."""
        req = AnalysisRequest(
            location=LocationSpec(type=LocationType.REGION, region_code="IN-TN-CHE"),
            start_date=date(2021, 1, 1),
            end_date=date(2024, 12, 31),
            signals=[SignalType.NASA_POWER, SignalType.OSM]
        )
        resp1 = JobService.execute_analysis(req)
        self.assertFalse(resp1.cache_hit)

        resp2 = JobService.execute_analysis(req)
        self.assertTrue(resp2.cache_hit)

    def test_cache_key_parameter_sensitivity(self):
        """Test that changing resolution produces a distinct cache identity."""
        key1 = CacheService.generate_cache_key("multi", "profile", "IN-TN-CHE", "2021-01-01", "2024-12-31", "0.05deg")
        key2 = CacheService.generate_cache_key("multi", "profile", "IN-TN-CHE", "2021-01-01", "2024-12-31", "0.01deg")
        self.assertNotEqual(key1, key2)

    def test_no_synthetic_values_in_production(self):
        """Verify that zero synthetic values or SYNTHETIC_DEMO provenance tags appear in production responses."""
        req = AnalysisRequest(
            location=LocationSpec(type=LocationType.REGION, region_code="IN-TN-CHE"),
            start_date=date(2021, 1, 1),
            end_date=date(2024, 12, 31),
            signals=[SignalType.SENTINEL2, SignalType.VIIRS, SignalType.NASA_POWER, SignalType.OSM]
        )
        resp = JobService.execute_analysis(req)
        for prov in resp.provenance_chain:
            self.assertIn(prov["provenance_type"], ["OBSERVED", "CALCULATED"])
            self.assertNotEqual(prov["provenance_type"], "SYNTHETIC_DEMO")

    # -------------------------------------------------------------
    # 5. HTTP ENDPOINT INTEGRATION TESTS (FASTAPI TESTCLIENT)
    # -------------------------------------------------------------
    def test_http_get_availability_canonical_and_alias(self):
        """Test that canonical /api/v1/analysis/availability and alias /api/v1/availability return identical results."""
        # 1. Canonical route
        r1 = self.client.get("/api/v1/analysis/availability?region_code=IN-TN-CHE&start_date=2021-01-01&end_date=2024-12-31")
        self.assertEqual(r1.status_code, 200)
        d1 = r1.json()
        self.assertEqual(d1["overall_status"], "PARTIAL_DATA")
        self.assertIn("sentinel2", d1["signal_availability"])

        # 2. Alias route
        r2 = self.client.get("/api/v1/availability?region_code=IN-TN-CHE&start_date=2021-01-01&end_date=2024-12-31")
        self.assertEqual(r2.status_code, 200)
        d2 = r2.json()
        self.assertEqual(d2["overall_status"], d1["overall_status"])
        self.assertEqual(d2["location"]["matched_region"], d1["location"]["matched_region"])

    def test_http_post_analysis_synchronous(self):
        """Test HTTP POST /api/v1/analysis executes synchronous query returning 200 OK."""
        payload = {
            "location": {"type": "region", "region_code": "IN-TN-CHE"},
            "start_date": "2021-01-01",
            "end_date": "2024-12-31",
            "signals": ["sentinel2", "viirs", "nasa_power", "osm"]
        }
        r = self.client.post("/api/v1/analysis", json=payload)
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["location"]["matched_region"], "IN-TN-CHE")
        self.assertEqual(len(data["profile"]["sentinel2"]), 4)
        self.assertEqual(data["profile"]["nasa_power"]["observation_count"], 1461)
        self.assertEqual(data["profile"]["osm"]["mapped_building_count"], 236154)

    def test_http_post_analysis_async_202_accepted(self):
        """Test HTTP POST /api/v1/analysis with async_mode=true returns 202 Accepted and valid job polling."""
        payload = {
            "location": {"type": "region", "region_code": "IN-TN-CHE"},
            "start_date": "2021-01-01",
            "end_date": "2024-12-31",
            "signals": ["nasa_power"]
        }
        r = self.client.post("/api/v1/analysis?async_mode=true", json=payload)
        self.assertEqual(r.status_code, 202)
        data = r.json()
        job_id = data["detail"]["job_id"]
        self.assertTrue(job_id.startswith("job_"))

        # Poll job
        r_poll = self.client.get(f"/api/v1/analysis/{job_id}")
        self.assertEqual(r_poll.status_code, 200)

    def test_http_get_region_profile_chennai(self):
        """Test HTTP GET /api/v1/regions/IN-TN-CHE returns live aggregated profile."""
        r = self.client.get("/api/v1/regions/IN-TN-CHE")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["code"], "IN-TN-CHE")
        self.assertAlmostEqual(data["profile"]["osm"]["total_road_length_km"], 5772.941, delta=0.5)

    def test_http_get_grid_cell_profile_che_g006(self):
        """Test HTTP GET /api/v1/regions/CHE_G006 returns cell-level metrics."""
        r = self.client.get("/api/v1/regions/CHE_G006")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["cell_code"], "CHE_G006")
        self.assertEqual(data["profile"]["osm"]["mapped_building_count"], 24022)


if __name__ == "__main__":
    unittest.main()
