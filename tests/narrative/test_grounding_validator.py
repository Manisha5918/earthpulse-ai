import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.schemas.analysis import LocationSpec, LocationType
from app.services.availability_engine import resolve_location
from app.services.change_profile_service import ChangeProfileService
from app.services.evidence_builder import EvidenceBuilder
from app.services.template_narrative_generator import TemplateNarrativeGenerator
from app.services.grounding_validator import GroundingValidator
from app.schemas.narrative import KeyFinding


class TestGroundingValidator(unittest.TestCase):

    def setUp(self):
        self.loc_spec = LocationSpec(type=LocationType.GRID_CELL, cell_code="CHE_G006")
        self.resolved = resolve_location(self.loc_spec)
        self.profile = ChangeProfileService.build_change_profile("IN-TN-CHE", "CHE_G006")
        self.package = EvidenceBuilder.build_package(self.profile, self.resolved)
        self.narrative = TemplateNarrativeGenerator.generate_grounded_narrative(self.package)

    def test_grounding_validator_accepts_valid_narrative(self):
        """Test that deterministic template narrative passes grounding validator."""
        is_valid, violations = GroundingValidator.validate_narrative(self.narrative, self.package)
        self.assertTrue(is_valid, f"Violations: {violations}")
        self.assertEqual(len(violations), 0)

    def test_grounding_validator_rejects_hallucinated_number(self):
        """Test that an invented number (e.g. 99.876) triggers validation rejection."""
        bad_narrative = self.narrative.model_copy(deep=True)
        bad_narrative.key_findings[0].statement = "The observed value reached 99.876 nW/cm^2*sr unexpectedly."
        is_valid, violations = GroundingValidator.validate_narrative(bad_narrative, self.package)
        self.assertFalse(is_valid)
        self.assertTrue(any("Ungrounded/hallucinated number" in v for v in violations))

    def test_grounding_validator_accepts_number_formatting_tolerance(self):
        """Test that comma-formatted numbers like 24,022 vs 24022 are accepted."""
        formatted_narrative = self.narrative.model_copy(deep=True)
        # Find building finding
        b_finding = next((f for f in formatted_narrative.key_findings if "building" in f.statement.lower()), None)
        if b_finding:
            b_val = int(self.package.evidence_items[b_finding.evidence_ids[0]].canonical_value)
            b_finding.statement = f"OpenStreetMap static spatial snapshot records {b_val:,} mapped structures as of 2026-09-03."
            is_valid, violations = GroundingValidator.validate_narrative(formatted_narrative, self.package)
            self.assertTrue(is_valid, f"Violations: {violations}")

    def test_grounding_validator_rejects_unsupported_use_of_allowed_number(self):
        """Test that using an allowed number in a finding that does NOT reference its evidence ID is rejected."""
        bad_narrative = self.narrative.model_copy(deep=True)
        # Take building count (e.g. 24022) and put it inside the NDVI finding (which references EVID-001)
        ndvi_finding = bad_narrative.key_findings[0]
        ndvi_finding.statement = "Sentinel-2 NDVI was recorded at 24022.0 on 2024-04-29."
        is_valid, violations = GroundingValidator.validate_narrative(bad_narrative, self.package)
        self.assertFalse(is_valid)
        self.assertTrue(any("is not supported by its referenced evidence IDs" in v for v in violations))

    def test_grounding_validator_rejects_prohibited_causal_phrases(self):
        """Test that causal verbs like 'caused' or 'led to' trigger validation rejection."""
        bad_narrative = self.narrative.model_copy(deep=True)
        bad_narrative.key_findings[0].statement += " Urbanization caused this vegetation loss."
        is_valid, violations = GroundingValidator.validate_narrative(bad_narrative, self.package)
        self.assertFalse(is_valid)
        self.assertTrue(any("Prohibited causal" in v for v in violations))

    def test_grounding_validator_rejects_osm_trend_phrases(self):
        """Test that describing OSM snapshot data with trend language is rejected."""
        bad_narrative = self.narrative.model_copy(deep=True)
        b_finding = next((f for f in bad_narrative.key_findings if "building" in f.statement.lower()), None)
        if b_finding:
            b_finding.statement = "OpenStreetMap mapped buildings increased from 2021 to 2024."
            is_valid, violations = GroundingValidator.validate_narrative(bad_narrative, self.package)
            self.assertFalse(is_valid)
            self.assertTrue(any("improperly described with trend language" in v for v in violations))

    def test_grounding_validator_accepts_allowed_associative_phrasing(self):
        """Test that observational language like 'co-occurred with' or 'was accompanied by' is accepted."""
        good_narrative = self.narrative.model_copy(deep=True)
        good_narrative.executive_summary = (
            "Nocturnal radiance increase was accompanied by stable meteorological baselines and co-occurred with localized built-up index changes."
        )
        is_valid, violations = GroundingValidator.validate_narrative(good_narrative, self.package)
        self.assertTrue(is_valid, f"Violations: {violations}")


if __name__ == "__main__":
    unittest.main()
