"""EarthPulse AI — MoE orchestrator.

Runs domain-routed expert reasoning over an existing Phase 6 profile and its
immutable EvidencePackage. Region-independent: no region conditionals; the
region id is carried as a label only. Experts run only when routed READY;
otherwise an explicit inactive record explains why. Nothing is recalculated
and no values are invented.
"""

from typing import Any, Dict, List, Optional, Set

from app.schemas.analysis import ResolvedLocation, SignalType
from app.schemas.intelligence import RegionalChangeProfile
from app.schemas.narrative import EvidencePackage
from app.services.moe.base_expert import ExpertContext, strongest_severity
from app.services.moe.climate_expert import ClimateExpert
from app.services.moe.cross_signal_expert import CrossSignalExpert
from app.services.moe.models import (
    CrossSignalReasoning,
    ExpertId,
    ExpertOutput,
    ExpertStatus,
    InactiveExpert,
    MoEReport,
    ObservedSignalStrength,
    RelevanceLevel,
)
from app.services.moe.router import ROUTING_ORDER, route_all
from app.services.moe.spatial_expert import SpatialExpert
from app.services.moe.urban_expert import UrbanExpert
from app.services.moe.vegetation_expert import VegetationExpert

_EXPERTS = {
    ExpertId.VEGETATION: VegetationExpert(),
    ExpertId.URBAN: UrbanExpert(),
    ExpertId.CLIMATE: ClimateExpert(),
    ExpertId.SPATIAL: SpatialExpert(),
    ExpertId.CROSS_SIGNAL: CrossSignalExpert(),
}

_EXPERT_LABELS = {
    ExpertId.VEGETATION: "Vegetation",
    ExpertId.URBAN: "Urban dynamics",
    ExpertId.CLIMATE: "Climate context",
    ExpertId.SPATIAL: "Spatial context",
    ExpertId.CROSS_SIGNAL: "Cross-signal reasoning",
}

_INACTIVE_SUMMARIES = {
    ExpertStatus.INSUFFICIENT_EVIDENCE: "Not enough evidence to assess.",
    ExpertStatus.NOT_APPLICABLE: "Not applicable to the current evidence.",
    ExpertStatus.NO_RELEVANT_SIGNAL: "No relevant signals in this investigation.",
}


def _plain_inactive_reason(expert: ExpertId, status: ExpertStatus, reasons: List[str]) -> str:
    detail = reasons[0] if reasons else ""
    base = _INACTIVE_SUMMARIES.get(status, "Inactive for this investigation.")
    return f"{base} {detail}".strip()


def _observed_signal_strength(profile: RegionalChangeProfile) -> ObservedSignalStrength:
    """How strong the detected deviations are — independent of expert coverage."""
    strongest = strongest_severity(profile.temporal_anomalies or [])
    if strongest in ("CRITICAL", "HIGH"):
        return ObservedSignalStrength(
            level="STRONG",
            strongest_severity=strongest,
            statement=f"Strong anomaly detected in the current pilot evidence (strongest deviation: {strongest}).",
        )
    if strongest == "MEDIUM":
        return ObservedSignalStrength(
            level="MODERATE",
            strongest_severity=strongest,
            statement="Moderate deviation detected in the current pilot evidence; no strong anomaly.",
        )
    return ObservedSignalStrength(
        level="NOMINAL",
        strongest_severity=strongest,
        statement="No strong anomaly detected in the current pilot evidence.",
    )


def run_moe(
    profile: RegionalChangeProfile,
    resolved_location: ResolvedLocation,
    package: EvidencePackage,
    scope: Set[SignalType],
    availabilities: Optional[Any] = None,
) -> MoEReport:
    decisions = {d.expert: d for d in route_all(profile, package, scope)}

    outputs: List[ExpertOutput] = []
    active: List[ExpertId] = []
    inactive: List[InactiveExpert] = []
    ready: List[ExpertId] = []

    for expert in ROUTING_ORDER:
        if expert == ExpertId.CROSS_SIGNAL:
            continue
        decision = decisions[expert]
        if decision.relevance == RelevanceLevel.INACTIVE:
            status = decision.suggested_status
            inactive.append(
                InactiveExpert(
                    expert=expert,
                    display_name=_EXPERT_LABELS[expert],
                    status=status,
                    reason=_plain_inactive_reason(expert, status, decision.reasons),
                )
            )
            outputs.append(
                ExpertOutput(
                    expert=expert,
                    display_name=_EXPERT_LABELS[expert],
                    status=status,
                    relevance=RelevanceLevel.INACTIVE,
                    plain_summary=_plain_inactive_reason(expert, status, decision.reasons),
                    provenance="CALCULATED",
                )
            )
            continue
        ctx = ExpertContext(
            expert=expert,
            display_name=_EXPERT_LABELS[expert],
            profile=profile,
            package=package,
            decision=decision,
            scope=set(scope),
        )
        out = _EXPERTS[expert].run(ctx)
        outputs.append(out)
        active.append(expert)
        ready.append(expert)

    # Cross-signal reasoning runs last, aware of which experts are ready.
    cross_decision = decisions[ExpertId.CROSS_SIGNAL]
    cross_reasoning: Optional[CrossSignalReasoning] = None
    if cross_decision.relevance == RelevanceLevel.INACTIVE:
        status = cross_decision.suggested_status
        reason = _plain_inactive_reason(ExpertId.CROSS_SIGNAL, status, cross_decision.reasons)
        inactive.append(
            InactiveExpert(
                expert=ExpertId.CROSS_SIGNAL,
                display_name=_EXPERT_LABELS[ExpertId.CROSS_SIGNAL],
                status=status,
                reason=reason,
            )
        )
        outputs.append(
            ExpertOutput(
                expert=ExpertId.CROSS_SIGNAL,
                display_name=_EXPERT_LABELS[ExpertId.CROSS_SIGNAL],
                status=status,
                relevance=RelevanceLevel.INACTIVE,
                plain_summary=reason,
                provenance="CALCULATED",
            )
        )
        cross_reasoning = CrossSignalReasoning(
            combined=False,
            temporal_compatibility="INCOMPATIBLE"
            if "incompatible" in reason.lower()
            else "UNKNOWN",
            participating_experts=[],
            note=reason,
        )
    else:
        ctx = ExpertContext(
            expert=ExpertId.CROSS_SIGNAL,
            display_name=_EXPERT_LABELS[ExpertId.CROSS_SIGNAL],
            profile=profile,
            package=package,
            decision=cross_decision,
            scope=set(scope),
        )
        out = _EXPERTS[ExpertId.CROSS_SIGNAL].run(ctx, ready)
        outputs.append(out)
        if out.status == ExpertStatus.READY:
            active.append(ExpertId.CROSS_SIGNAL)
            ready.append(ExpertId.CROSS_SIGNAL)
        else:
            inactive.append(
                InactiveExpert(
                    expert=ExpertId.CROSS_SIGNAL,
                    display_name=_EXPERT_LABELS[ExpertId.CROSS_SIGNAL],
                    status=out.status,
                    reason=out.plain_summary,
                )
            )
        cross_reasoning = CrossSignalReasoning(
            combined=out.status == ExpertStatus.READY and bool(out.findings),
            supporting_evidence_ids=out.evidence_ids,
            conflicting_evidence_ids=out.conflicting_evidence_ids,
            temporal_compatibility="COMPATIBLE" if out.status == ExpertStatus.READY else "INCOMPATIBLE",
            participating_experts=[e for e in ready if e != ExpertId.CROSS_SIGNAL],
            note=out.plain_summary,
        )

    return MoEReport(
        region_id=profile.region_id,
        cell_code=profile.cell_code,
        evidence_package_hash=package.evidence_package_hash,
        routing_summary=[decisions[e] for e in ROUTING_ORDER],
        active_experts=active,
        inactive_experts=inactive,
        expert_outputs=outputs,
        cross_signal_reasoning=cross_reasoning,
        observed_signal_strength=_observed_signal_strength(profile),
    )
