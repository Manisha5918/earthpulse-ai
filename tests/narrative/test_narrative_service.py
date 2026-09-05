import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.schemas.analysis import LocationSpec, LocationType, AvailabilityStatus
from app.schemas.narrative import NarrativeRequest
from app.services.narrative_service import NarrativeService


class TestNarrativeService(unittest.TestCase):

    def test_narrative_service_synchronous_execution_chennai(self):
        """Test generating a grounded narrative briefing for Chennai pilot region."""
        req = NarrativeRequest(
            location=LocationSpec(type=LocationType.REGION, region_code="IN-TN-CHE"),
            async_mode=False
        )
        resp = NarrativeService.execute_narrative_analysis(req)
        self.assertIn(resp.status, [AvailabilityStatus.AVAILABLE, AvailabilityStatus.PARTIAL_DATA])
        self.assertIsNotNone(resp.narrative)
        self.assertIsNotNone(resp.evidence_package_hash)
        self.assertGreater(len(resp.narrative.key_findings), 0)
        self.assertEqual(resp.narrative.provenance_type, "AI_INTERPRETED")

    def test_deterministic_template_fallback_passes_validator(self):
        """Test that the deterministic template fallback automatically passes GroundingValidator."""
        req = NarrativeRequest(
            location=LocationSpec(type=LocationType.GRID_CELL, cell_code="CHE_G006"),
            async_mode=False
        )
        resp = NarrativeService.execute_narrative_analysis(req)
        self.assertIsNotNone(resp.narrative)
        self.assertEqual(resp.narrative.generator_type, "DETERMINISTIC_TEMPLATE_GENERATOR")

    def test_location_isolation_bengaluru(self):
        """Test that querying Bengaluru (12.9716, 77.5946) returns PROCESSING_REQUIRED and zero Chennai narrative."""
        req = NarrativeRequest(
            location=LocationSpec(type=LocationType.POINT, coordinates=[12.9716, 77.5946]),
            async_mode=False
        )
        resp = NarrativeService.execute_narrative_analysis(req)
        self.assertEqual(resp.status, AvailabilityStatus.PROCESSING_REQUIRED)
        self.assertIsNone(resp.narrative)
        self.assertIsNone(resp.evidence_package_hash)

    def test_location_isolation_london(self):
        """Test that querying outside India returns DATA_UNAVAILABLE and zero narrative."""
        req = NarrativeRequest(
            location=LocationSpec(type=LocationType.POINT, coordinates=[51.5074, -0.1278]),
            async_mode=False
        )
        resp = NarrativeService.execute_narrative_analysis(req)
        self.assertEqual(resp.status, AvailabilityStatus.DATA_UNAVAILABLE)
        self.assertIsNone(resp.narrative)

    def test_narrative_zero_synthetic_data(self):
        """Verify that zero synthetic demo tags exist in narrative response."""
        req = NarrativeRequest(
            location=LocationSpec(type=LocationType.REGION, region_code="IN-TN-CHE"),
            async_mode=False
        )
        resp = NarrativeService.execute_narrative_analysis(req)
        for prov in resp.provenance_chain:
            self.assertNotEqual(prov.get("provenance_type"), "SYNTHETIC_DEMO")


if __name__ == "__main__":
    unittest.main()
