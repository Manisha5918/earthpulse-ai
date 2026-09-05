import unittest
import math
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.schemas.intelligence import (
    TemporalCompatibilityType,
    CorrelationMethod,
    AnomalySeverity,
    BaselineSummary
)
from app.services.temporal_alignment_service import TemporalAlignmentService
from app.services.baseline_service import BaselineService, compute_series_stats
from app.services.change_service import ChangeService
from app.services.anomaly_service import AnomalyService
from app.services.cross_signal_service import CrossSignalService
from app.services.change_profile_service import ChangeProfileService
from app.services.cache_service import CacheService


class TestStatisticalIntelligence(unittest.TestCase):

    # -------------------------------------------------------------
    # 1. CACHE IDENTITY & VERSIONING TESTS
    # -------------------------------------------------------------
    def test_cache_key_includes_intelligence_version(self):
        """Test that same request with same intelligence_version yields identical key, while different version yields distinct key."""
        k1 = CacheService.generate_cache_key("multi", "profile", "IN-TN-CHE", "2021-01-01", "2024-12-31", "0.05deg", "phase6-v1")
        k2 = CacheService.generate_cache_key("multi", "profile", "IN-TN-CHE", "2021-01-01", "2024-12-31", "0.05deg", "phase6-v1")
        k3 = CacheService.generate_cache_key("multi", "profile", "IN-TN-CHE", "2021-01-01", "2024-12-31", "0.05deg", "phase6-v2")

        self.assertEqual(k1, k2)
        self.assertNotEqual(k1, k3)

    # -------------------------------------------------------------
    # 2. TEMPORAL ALIGNMENT TESTS
    # -------------------------------------------------------------
    def test_temporal_alignment_exact_match(self):
        obs = [
            {"source": "SENTINEL2", "date": "2024-04-29"},
            {"source": "GROUND", "date": "2024-04-29"}
        ]
        res = TemporalAlignmentService.evaluate_compatibility(obs)
        self.assertEqual(res.compatibility, TemporalCompatibilityType.EXACT_MATCH)

    def test_temporal_alignment_same_month(self):
        obs = [
            {"source": "SENTINEL2", "date": "2024-04-29"},
            {"source": "VIIRS", "date": "2024-04-01/2024-04-30"},
            {"source": "NASA_POWER", "start": "2024-04-01", "end": "2024-04-30"}
        ]
        res = TemporalAlignmentService.evaluate_compatibility(obs)
        self.assertEqual(res.compatibility, TemporalCompatibilityType.SAME_MONTH)

    def test_temporal_alignment_incompatible(self):
        obs = [
            {"source": "SENTINEL2", "date": "2021-05-30"},
            {"source": "VIIRS", "date": "2024-04-01/2024-04-30"}
        ]
        res = TemporalAlignmentService.evaluate_compatibility(obs)
        self.assertEqual(res.compatibility, TemporalCompatibilityType.INCOMPATIBLE)

    def test_cross_signal_pattern_rejected_when_incompatible(self):
        align_incompat = TemporalAlignmentService.evaluate_compatibility([
            {"source": "SENTINEL2", "date": "2021-05-30"},
            {"source": "VIIRS", "date": "2024-04-01/2024-04-30"}
        ])
        patterns = CrossSignalService.evaluate_patterns(
            cell_code="CHE_G001",
            ndbi_change=0.05,
            viirs_change=2.5,
            ndvi_change=-0.04,
            temp_change=None,
            precip_change=None,
            temporal_alignment=align_incompat
        )
        self.assertEqual(len(patterns), 0)

    # -------------------------------------------------------------
    # 3. SMALL-SAMPLE SEMANTICS & INVARIANT BASELINES
    # -------------------------------------------------------------
    def test_small_sample_insufficient(self):
        base = BaselineSummary(
            signal="test",
            observation_count=2,
            baseline_period="N/A",
            temporal_semantics="TEST",
            data_completeness=0.5,
            confidence="INSUFFICIENT",
            status="INSUFFICIENT_OBSERVATIONS",
            provenance="CALCULATED"
        )
        anom = AnomalyService.compute_temporal_anomaly("test", "2024-04-29", 0.20, base)
        self.assertEqual(anom.status, "INSUFFICIENT_OBSERVATIONS")
        self.assertIsNone(anom.z_score)

    def test_small_sample_exploratory_n4(self):
        s2_base = BaselineService.compute_sentinel2_baselines("CHE_G006")
        self.assertIn("ndvi", s2_base)
        ndvi_b = s2_base["ndvi"]
        self.assertEqual(ndvi_b.observation_count, 4)
        self.assertEqual(ndvi_b.confidence, "LIMITED")
        self.assertEqual(ndvi_b.status, "EXPLORATORY")

    def test_invariant_baseline_matching_mean(self):
        """When sigma=0 and observed value matches mean, z=0.0 with explicit INVARIANT_BASELINE status and LIMITED confidence."""
        base = BaselineSummary(
            signal="invariant",
            observation_count=4,
            mean=10.0,
            stddev=0.0,
            median=10.0,
            baseline_period="2021-2024",
            temporal_semantics="TEST",
            data_completeness=1.0,
            confidence="LIMITED",
            status="CALCULATED",
            provenance="CALCULATED"
        )
        anom = AnomalyService.compute_temporal_anomaly("invariant", "2024-04-29", 10.0, base)
        self.assertEqual(anom.status, "INVARIANT_BASELINE")
        self.assertEqual(anom.z_score, 0.0)
        self.assertEqual(anom.confidence, "LIMITED")

    def test_invariant_baseline_deviating_from_mean(self):
        """When sigma=0 and observed value deviates from mean, z=None (0 division) with INVARIANT_BASELINE_DEVIATION status."""
        base = BaselineSummary(
            signal="invariant",
            observation_count=4,
            mean=10.0,
            stddev=0.0,
            median=10.0,
            baseline_period="2021-2024",
            temporal_semantics="TEST",
            data_completeness=1.0,
            confidence="LIMITED",
            status="CALCULATED",
            provenance="CALCULATED"
        )
        anom = AnomalyService.compute_temporal_anomaly("invariant", "2024-04-29", 15.0, base)
        self.assertEqual(anom.status, "INVARIANT_BASELINE_DEVIATION")
        self.assertIsNone(anom.z_score)
        self.assertEqual(anom.confidence, "LIMITED")

    # -------------------------------------------------------------
    # 4. MATHEMATICAL CHANGE SAFEGUARDS
    # -------------------------------------------------------------
    def test_change_calculation_standard(self):
        cm = ChangeService.calculate_change("NDVI", 0.20, 0.25, "2021-05-30", "2024-04-29")
        self.assertAlmostEqual(cm.absolute_change, 0.05)
        self.assertAlmostEqual(cm.relative_change, 0.25)
        self.assertEqual(cm.data_sufficiency, "VALID")

    def test_change_calculation_zero_baseline_safe(self):
        cm = ChangeService.calculate_change("precip", 0.0, 15.2, "2021-01-01", "2024-04-29")
        self.assertAlmostEqual(cm.absolute_change, 15.2)
        self.assertIsNone(cm.relative_change)
        self.assertEqual(cm.data_sufficiency, "VALID_ABSOLUTE_ONLY_ZERO_BASELINE")

    # -------------------------------------------------------------
    # 5. SPATIAL ANOMALY & ELIGIBLE CELLS
    # -------------------------------------------------------------
    def test_spatial_anomalies_eligible_cells(self):
        spat = AnomalyService.compute_spatial_anomalies("ndvi", period="2024-04-29")
        self.assertGreaterEqual(len(spat), 15)
        for s in spat:
            self.assertIsNotNone(s.spatial_z_score)
            self.assertGreater(s.eligible_cell_count, 10)
            self.assertGreaterEqual(s.percentile_rank, 0.0)
            self.assertLessEqual(s.percentile_rank, 100.0)

    # -------------------------------------------------------------
    # 6. CROSS-SIGNAL EVIDENCE & NON-CAUSAL CORRELATION
    # -------------------------------------------------------------
    def test_cross_signal_pattern_non_causal(self):
        align_same_month = TemporalAlignmentService.evaluate_compatibility([
            {"source": "SENTINEL2", "date": "2024-04-29"},
            {"source": "VIIRS", "date": "2024-04"}
        ])
        patterns = CrossSignalService.evaluate_patterns(
            cell_code="CHE_G006",
            ndbi_change=0.04,
            viirs_change=3.2,
            ndvi_change=-0.03,
            temp_change=None,
            precip_change=None,
            temporal_alignment=align_same_month
        )
        self.assertEqual(len(patterns), 1)
        p = patterns[0]
        self.assertEqual(p.pattern_type, "BUILT_ENVIRONMENT_CHANGE_WITH_VEGETATION_DECLINE")
        self.assertFalse(p.causal_claim)
        self.assertEqual(p.relationship_type, "CORRELATION")
        self.assertEqual(p.interpretation_status, "EVIDENCE_PATTERN_ONLY")

    def test_exploratory_correlation_non_causal(self):
        x = [0.1, 0.2, 0.3, 0.4]
        y = [10.0, 15.0, 20.0, 25.0]
        rel = CrossSignalService.compute_relationship(x, y, "NDBI", "VIIRS", CorrelationMethod.PEARSON)
        self.assertEqual(rel.sample_size, 4)
        self.assertEqual(rel.status, "EXPLORATORY")
        self.assertFalse(rel.causal_claim)
        self.assertEqual(rel.relationship_type, "CORRELATION")
        self.assertAlmostEqual(rel.correlation_coefficient, 1.0, places=3)
        self.assertIsNotNone(rel.p_value)

    def test_invariant_signal_correlation_yields_null_pvalue(self):
        x = [10.0, 10.0, 10.0, 10.0]
        y = [1.0, 2.0, 3.0, 4.0]
        rel = CrossSignalService.compute_relationship(x, y, "INV_X", "Y", CorrelationMethod.PEARSON)
        self.assertEqual(rel.status, "INVARIANT_SIGNAL")
        self.assertEqual(rel.correlation_coefficient, 0.0)
        self.assertIsNone(rel.p_value)

    # -------------------------------------------------------------
    # 7. REGIONAL CHANGE SCORE TRANSPARENCY
    # -------------------------------------------------------------
    def test_regional_change_score_transparency(self):
        profile = ChangeProfileService.build_change_profile("IN-TN-CHE", "CHE_G006")
        score = profile.regional_change_score
        self.assertIsNotNone(score.overall_score)
        self.assertGreaterEqual(score.overall_score, 0.0)
        self.assertLessEqual(score.overall_score, 100.0)
        self.assertEqual(score.scoring_version, "phase6-v1")
        self.assertEqual(score.weighting_method, "EXPERT_CONFIGURED")
        self.assertAlmostEqual(sum(score.weights.values()), 1.0, places=4)
        for comp_name, comp_val in score.components.items():
            if comp_val is not None:
                self.assertGreaterEqual(comp_val, 0.0)
                self.assertLessEqual(comp_val, 1.0)


if __name__ == "__main__":
    unittest.main()
