"""MoE expert tests: grounded outputs, no fabrication, provenance preserved."""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.schemas.analysis import LocationSpec, LocationType, SignalType
from app.services.availability_engine import resolve_location
from app.services.change_profile_service import ChangeProfileService
from app.services.evidence_builder import EvidenceBuilder
from app.services.moe.models import ExpertId, ExpertStatus
from app.services.moe.orchestrator import run_moe

ALL_SCOPE = {SignalType.SENTINEL2, SignalType.VIIRS, SignalType.NASA_POWER, SignalType.OSM}

CAUSAL_VERBS = ["causes", "caused by", "caused ", "drives ", "driving ", "triggers ",
                "prosperity", "economic growth", "proves causation"]


def _chennai_report():
    profile = ChangeProfileService.build_change_profile(region_id="IN-TN-CHE", cell_code=None)
    resolved = resolve_location(LocationSpec(type=LocationType.REGION, region_code="IN-TN-CHE"))
    package = EvidenceBuilder.build_package(profile, resolved)
    return run_moe(profile, resolved, package, ALL_SCOPE), package


def test_expert_findings_cite_only_package_evidence():
    report, package = _chennai_report()
    valid = set(package.evidence_items.keys())
    for out in report.expert_outputs:
        for eid in out.evidence_ids:
            assert eid in valid, f"{out.expert} cites unknown {eid}"
        for f in out.findings:
            for eid in f.evidence_ids:
                assert eid in valid, f"{out.expert} finding cites unknown {eid}"
        for eid in out.conflicting_evidence_ids:
            assert eid in valid


def test_expert_language_is_non_causal():
    report, _ = _chennai_report()
    for out in report.expert_outputs:
        texts = [out.plain_summary] + [f.statement for f in out.findings]
        for text in texts:
            lowered = text.lower()
            for verb in CAUSAL_VERBS:
                assert verb not in lowered, f"{out.expert}: causal language '{verb}' in: {text[:120]}"


def test_expert_cited_numbers_match_package_values():
    # Domain experts restate cited canonical values verbatim. (Spatial and
    # cross-signal experts cite evidence for traceability while describing
    # distribution/association, so they are exempt from verbatim restatement.)
    from app.services.moe.models import ExpertId as _E
    report, package = _chennai_report()
    for out in report.expert_outputs:
        if out.expert not in (_E.VEGETATION, _E.URBAN, _E.CLIMATE):
            continue
        for f in out.findings:
            for eid in f.evidence_ids:
                item = package.evidence_items[eid]
                assert str(item.canonical_value)[:6] in f.statement or f"{item.canonical_value:.1f}" in f.statement, (
                    f"{out.expert}: statement does not carry cited value {item.canonical_value}: {f.statement[:140]}"
                )


def test_expert_outputs_preserve_provenance():
    report, package = _chennai_report()
    assert report.provenance == "CALCULATED"
    for out in report.expert_outputs:
        assert out.provenance == "CALCULATED"
    # Package hash untouched by MoE: rebuild and compare.
    profile = ChangeProfileService.build_change_profile(region_id="IN-TN-CHE", cell_code=None)
    resolved = resolve_location(LocationSpec(type=LocationType.REGION, region_code="IN-TN-CHE"))
    package2 = EvidenceBuilder.build_package(profile, resolved)
    assert package2.evidence_package_hash == report.evidence_package_hash


def test_inactive_experts_explain_themselves():
    report, _ = _chennai_report()
    for inactive in report.inactive_experts:
        assert inactive.reason and len(inactive.reason) > 0
        assert inactive.status in (ExpertStatus.INSUFFICIENT_EVIDENCE,
                                   ExpertStatus.NOT_APPLICABLE,
                                   ExpertStatus.NO_RELEVANT_SIGNAL)
    # Active + inactive partition covers every known expert.
    covered = {e for e in report.active_experts} | {i.expert for i in report.inactive_experts}
    assert covered == set(ExpertId)
