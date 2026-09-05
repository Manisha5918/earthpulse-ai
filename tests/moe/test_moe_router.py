"""MoE router tests: evidence-aware composite routing scores.

Uses the real Chennai Phase 6 profile for live-data routing, plus minimal
in-memory profiles (no fabricated observations) to exercise logic branches
that current live data does not cover (empty evidence, incompatibility).
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.schemas.analysis import SignalType
from app.schemas.intelligence import (
    AnomalySeverity,
    RegionalChangeProfile,
    RegionalChangeScore,
    TemporalCompatibilityType,
    CrossSignalPattern,
)
from app.services.change_profile_service import ChangeProfileService
from app.services.evidence_builder import EvidenceBuilder
from app.services.moe.models import ExpertId, RelevanceLevel
from app.services.moe.router import route_all, route_expert

ALL_SCOPE = {SignalType.SENTINEL2, SignalType.VIIRS, SignalType.NASA_POWER, SignalType.OSM}


def _chennai_profile():
    return ChangeProfileService.build_change_profile(region_id="IN-TN-CHE", cell_code=None)


def _chennai_package(profile):
    from app.schemas.analysis import LocationSpec, LocationType
    from app.services.availability_engine import resolve_location
    resolved = resolve_location(LocationSpec(type=LocationType.REGION, region_code="IN-TN-CHE"))
    return EvidenceBuilder.build_package(profile, resolved), resolved


def test_chennai_routes_through_moe_with_transparent_scores():
    profile = _chennai_profile()
    package, _ = _chennai_package(profile)
    decisions = route_all(profile, package, ALL_SCOPE)
    assert len(decisions) == 5
    for d in decisions:
        assert d.relevance in list(RelevanceLevel)
        assert 0.0 <= d.score.composite_score <= 1.0
        assert d.reasons, f"{d.expert} must explain its routing"
        for comp in ("signal_relevance", "evidence_availability", "anomaly_strength",
                     "temporal_compatibility", "data_completeness"):
            assert 0.0 <= getattr(d.score, comp) <= 1.0


def test_chennai_vegetation_urban_relevant_climate_bounded():
    profile = _chennai_profile()
    package, _ = _chennai_package(profile)
    by_expert = {d.expert: d for d in route_all(profile, package, ALL_SCOPE)}
    assert by_expert[ExpertId.VEGETATION].relevance in (RelevanceLevel.HIGH, RelevanceLevel.MODERATE)
    assert by_expert[ExpertId.URBAN].relevance in (RelevanceLevel.HIGH, RelevanceLevel.MODERATE)
    # Climate has no anomalies in live data: capped at MODERATE, never HIGH.
    assert by_expert[ExpertId.CLIMATE].relevance != RelevanceLevel.HIGH


def test_empty_profile_deactivates_all_experts():
    profile = RegionalChangeProfile(
        region_id="IN-TN-CHE",
        temporal_scope={"start": "2021-01-01", "end": "2024-12-31"},
        baselines={},
        temporal_anomalies=[],
        spatial_anomalies=[],
        cross_signal_patterns=[],
        relationships=[],
        regional_change_score=RegionalChangeScore(overall_score=None, score_status="INSUFFICIENT"),
        spatial_context=None,
    )
    from app.schemas.narrative import EvidencePackage
    package = EvidencePackage(
        package_id="pkg_empty", evidence_package_hash="deadbeef",
        created_at="2024-01-01T00:00:00+00:00", region_id="IN-TN-CHE",
        temporal_scope={"start": "2021-01-01", "end": "2024-12-31"},
        location_summary={}, evidence_items={},
        mandatory_disclosures=[], prohibited_claims=[],
    )
    for d in route_all(profile, package, ALL_SCOPE):
        assert d.relevance == RelevanceLevel.INACTIVE, d.expert


def test_incompatible_temporal_blocks_cross_signal_combination():
    profile = _chennai_profile()
    profile = profile.model_copy(update={
        "cross_signal_patterns": [
            CrossSignalPattern(
                pattern_type="DIVERGENT_WINDOWS",
                description="Sentinel and VIIRS windows do not overlap.",
                supporting_signals=["ndvi", "viirs_radiance"],
                evidence_count=2,
                temporal_compatibility=TemporalCompatibilityType.INCOMPATIBLE,
                confidence="LIMITED",
            )
        ]
    })
    package, _ = _chennai_package(ChangeProfileService.build_change_profile(
        region_id="IN-TN-CHE", cell_code=None))
    decision = route_expert(ExpertId.CROSS_SIGNAL, profile, package, ALL_SCOPE)
    assert decision.relevance == RelevanceLevel.INACTIVE
    assert any("incompatible" in r.lower() or "blocked" in r.lower() for r in decision.reasons)


def test_no_region_conditionals_in_router():
    import inspect
    import app.services.moe.router as router_mod
    import app.services.moe.orchestrator as orch_mod
    for mod in (router_mod, orch_mod):
        src = inspect.getsource(mod)
        assert "IN-TN-CHE" not in src
        assert "CHE_G" not in src
        assert "Bengaluru" not in src and "bengaluru" not in src
