"""EarthPulse AI — Shared expert context and helpers.

Experts consume Phase 6 outputs (profile), the immutable EvidencePackage and
the router decision. They never recalculate statistics and never invent
values: every cited number comes from package evidence or profile baselines.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set

from app.schemas.analysis import SignalType
from app.schemas.intelligence import RegionalChangeProfile
from app.schemas.narrative import EvidencePackage
from app.services.moe.models import ExpertId, RelevanceLevel, RoutingDecision
from app.services.moe.router import EXPERT_SIGNAL_MATCHERS, match_signal


@dataclass
class ExpertContext:
    expert: ExpertId
    display_name: str
    profile: RegionalChangeProfile
    package: EvidencePackage
    decision: RoutingDecision
    scope: Set[SignalType] = field(default_factory=set)

    @property
    def matchers(self) -> List[str]:
        return EXPERT_SIGNAL_MATCHERS.get(self.expert, [])

    def evidence_ids(self) -> List[str]:
        ids = []
        for eid, item in (self.package.evidence_items or {}).items():
            if match_signal(getattr(item, "metric_name", ""), self.matchers) or match_signal(
                getattr(item, "source_dataset", ""), self.matchers
            ):
                ids.append(eid)
        return sorted(ids)

    def evidence_by_id(self, eid: str):
        return (self.package.evidence_items or {}).get(eid)

    def temporal_anomalies(self):
        return [a for a in (self.profile.temporal_anomalies or []) if match_signal(a.signal, self.matchers)]

    def spatial_anomalies(self):
        return [a for a in (self.profile.spatial_anomalies or []) if match_signal(a.signal, self.matchers)]

    def baseline(self, key_substring: str):
        for key, b in (self.profile.baselines or {}).items():
            if key_substring in str(key).lower():
                return b
        return None


def fmt_value(value: Optional[float], digits: int = 4) -> str:
    if value is None:
        return "N/A"
    try:
        return f"{float(value):.{digits}f}"
    except (TypeError, ValueError):
        return "N/A"


def severity_of(anomaly) -> str:
    sev = getattr(anomaly.severity, "value", anomaly.severity)
    return str(sev)


_SEVERITY_RANK = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "NORMAL": 1}


def strongest_severity(anomalies) -> str:
    best, rank = "NOMINAL", 0
    for anom in anomalies or []:
        sev = severity_of(anom).upper()
        if _SEVERITY_RANK.get(sev, 0) > rank:
            rank, best = _SEVERITY_RANK[sev], sev
    return best


def direction_word(observed: Optional[float], baseline: Optional[float]) -> str:
    if observed is None or baseline is None:
        return "differs from"
    if observed > baseline:
        return "is above"
    if observed < baseline:
        return "is below"
    return "matches"


class BaseExpert:
    expert_id: ExpertId = ExpertId.VEGETATION
    display_name: str = "Expert"

    def run(self, ctx: ExpertContext):
        raise NotImplementedError
