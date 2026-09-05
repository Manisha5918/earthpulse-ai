"""MoE orchestrator tests: region independence, isolation, determinism."""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.schemas.analysis import LocationSpec, LocationType, SignalType
from app.schemas.narrative import NarrativeRequest
from app.services.availability_engine import resolve_location
from app.services.change_profile_service import ChangeProfileService
from app.services.evidence_builder import EvidenceBuilder
from app.services.moe.models import MOE_VERSION, ExpertId
from app.services.moe.orchestrator import run_moe
from app.services.narrative_service import NarrativeService

ALL_SCOPE = {SignalType.SENTINEL2, SignalType.VIIRS, SignalType.NASA_POWER, SignalType.OSM}


def _run(region_id="IN-TN-CHE", cell_code=None):
    profile = ChangeProfileService.build_change_profile(region_id=region_id, cell_code=cell_code)
    loc = LocationSpec(type=LocationType.GRID_CELL, cell_code=cell_code) if cell_code else \
        LocationSpec(type=LocationType.REGION, region_code=region_id)
    resolved = resolve_location(loc)
    package = EvidenceBuilder.build_package(profile, resolved)
    return run_moe(profile, resolved, package, ALL_SCOPE), package


def test_chennai_region_report_structure():
    report, _ = _run()
    assert report.moe_version == MOE_VERSION
    assert report.region_id == "IN-TN-CHE"
    assert report.cell_code is None
    assert len(report.routing_summary) == 5
    assert len(report.expert_outputs) == 5
    assert report.cross_signal_reasoning is not None
    assert report.cross_signal_reasoning.causal_claim is False
    assert report.cross_signal_reasoning.relationship_type == "CORRELATION"


def test_cell_profile_runs_identical_pipeline():
    # Region independence: a grid cell flows through the exact same
    # orchestrator with no region-specific branching; only labels change.
    region_report, _ = _run()
    cell_report, _ = _run(cell_code="CHE_G001")
    assert cell_report.region_id == "IN-TN-CHE"
    assert cell_report.cell_code == "CHE_G001"
    assert [d.expert for d in cell_report.routing_summary] == [d.expert for d in region_report.routing_summary]
    assert len(cell_report.expert_outputs) == 5


def test_orchestrator_is_deterministic():
    r1, _ = _run()
    r2, _ = _run()
    assert r1.model_dump() == r2.model_dump()


def test_observed_signal_strength_reported_separately_from_coverage():
    report, _ = _run()
    strength = report.observed_signal_strength
    assert strength.level in ("STRONG", "MODERATE", "NOMINAL")
    assert strength.statement
    # Live pilot data has no strong anomaly: coverage may be HIGH while
    # signal strength stays honest about deviation magnitude.
    assert "No strong anomaly detected" in strength.statement
    assert strength.strongest_severity == "NORMAL"


def test_narrative_response_carries_moe_without_changing_grounding():
    req = NarrativeRequest(
        location=LocationSpec(type=LocationType.REGION, region_code="IN-TN-CHE"),
        async_mode=False,
    )
    resp = NarrativeService.execute_narrative_analysis(req)
    assert resp.moe is not None
    assert resp.moe["moe_version"] == MOE_VERSION
    assert resp.moe["evidence_package_hash"] == resp.evidence_package_hash
    # Existing behavior intact: narrative, hash, score all present.
    assert resp.narrative is not None
    assert len(resp.narrative.key_findings) > 0
    assert resp.regional_change_score is not None


def test_unverified_locations_skip_moe_entirely():
    blr = NarrativeService.execute_narrative_analysis(NarrativeRequest(
        location=LocationSpec(type=LocationType.POINT, coordinates=[12.9716, 77.5946]),
        async_mode=False,
    ))
    assert blr.status == "PROCESSING_REQUIRED"
    assert blr.moe is None
    assert blr.narrative is None

    lon = NarrativeService.execute_narrative_analysis(NarrativeRequest(
        location=LocationSpec(type=LocationType.POINT, coordinates=[51.5074, -0.1278]),
        async_mode=False,
    ))
    assert lon.status == "DATA_UNAVAILABLE"
    assert lon.moe is None
    assert lon.narrative is None
