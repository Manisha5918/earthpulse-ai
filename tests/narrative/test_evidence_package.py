import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.schemas.analysis import LocationSpec, LocationType
from app.services.availability_engine import resolve_location
from app.services.change_profile_service import ChangeProfileService
from app.services.evidence_builder import EvidenceBuilder


class TestEvidencePackage(unittest.TestCase):

    def setUp(self):
        self.loc_spec = LocationSpec(type=LocationType.GRID_CELL, cell_code="CHE_G006")
        self.resolved = resolve_location(self.loc_spec)
        self.profile = ChangeProfileService.build_change_profile("IN-TN-CHE", "CHE_G006")

    def test_evidence_package_immutability(self):
        """Test that EvidencePackage is frozen and raises error on mutation."""
        pkg = EvidenceBuilder.build_package(self.profile, self.resolved)
        with self.assertRaises(Exception):
            pkg.region_id = "MUTATED"

    def test_evidence_package_deterministic_hash(self):
        """Test that identical profiles generate identical evidence_package_hash."""
        pkg1 = EvidenceBuilder.build_package(self.profile, self.resolved)
        pkg2 = EvidenceBuilder.build_package(self.profile, self.resolved)
        self.assertEqual(pkg1.evidence_package_hash, pkg2.evidence_package_hash)
        self.assertEqual(pkg1.package_id, pkg2.package_id)

    def test_evidence_package_dynamic_building_count(self):
        """Test that mapped_building_count is dynamically extracted from profile.spatial_context."""
        pkg = EvidenceBuilder.build_package(self.profile, self.resolved)
        expected_b_count = float(self.profile.spatial_context["mapped_building_count"])

        # Find building evidence item
        b_item = next(
            (item for item in pkg.evidence_items.values() if item.metric_name == "mapped_building_count"),
            None
        )
        self.assertIsNotNone(b_item)
        self.assertEqual(b_item.canonical_value, expected_b_count)

    def test_evidence_package_temporal_semantics_attached(self):
        """Test that each evidence item inherits and carries explicit temporal semantics."""
        pkg = EvidenceBuilder.build_package(self.profile, self.resolved)
        for item in pkg.evidence_items.values():
            if "viirs" in item.metric_name:
                self.assertEqual(item.temporal_semantics, "ANNUAL_BASELINE")
            elif "building" in item.metric_name or "road" in item.metric_name:
                self.assertEqual(item.temporal_semantics, "SNAPSHOT")
            elif item.metric_name in ["ndvi", "ndwi", "ndbi"]:
                self.assertEqual(item.temporal_semantics, "MULTI_TEMPORAL_SCENES")


if __name__ == "__main__":
    unittest.main()
