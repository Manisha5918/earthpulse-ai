"""EarthPulse AI — Cross-Signal Reasoning Expert.

Combines the outputs of the other experts using existing Phase 6 patterns,
relationships and temporal compatibility. Never recalculates statistics,
never invents values, and always states association — never causation.
Combination is refused when temporal compatibility forbids it (the router
only activates this expert in that case, and this expert re-verifies).
"""

from typing import List, Set

from app.services.moe.base_expert import BaseExpert, ExpertContext, fmt_value
from app.services.moe.models import CrossSignalReasoning, ExpertFinding, ExpertId, ExpertOutput, ExpertStatus
from app.services.moe.router import match_signal


def _compat_value(pattern) -> str:
    raw = getattr(pattern, "temporal_compatibility", None)
    return str(getattr(raw, "value", raw) or "UNKNOWN").upper()


class CrossSignalExpert(BaseExpert):
    expert_id = ExpertId.CROSS_SIGNAL
    display_name = "Cross-signal reasoning"

    def _evidence_for_signals(self, ctx: ExpertContext, signals: List[str]) -> List[str]:
        out: List[str] = []
        for eid in ctx.evidence_ids():
            item = ctx.evidence_by_id(eid)
            text = f"{getattr(item, 'metric_name', '')} {getattr(item, 'source_dataset', '')}"
            if any(match_signal(text, [s]) or match_signal(s, [text]) for s in signals):
                out.append(eid)
        return sorted(set(out))

    def run(self, ctx: ExpertContext, ready_experts: List[ExpertId]) -> ExpertOutput:
        findings: List[ExpertFinding] = []
        supporting: List[str] = []
        conflicting: List[str] = []

        patterns = list(ctx.profile.cross_signal_patterns or [])
        if any(_compat_value(p) == "INCOMPATIBLE" for p in patterns):
            return ExpertOutput(
                expert=self.expert_id,
                display_name=self.display_name,
                status=ExpertStatus.NOT_APPLICABLE,
                relevance=ctx.decision.relevance,
                plain_summary="Signals observed at incompatible times; they are reported separately, not combined.",
                findings=[],
                evidence_ids=[],
                confidence="LIMITED",
                limitations=["Temporal incompatibility prevents cross-signal combination."],
                provenance="CALCULATED",
            )

        for pat in patterns:
            supporting_signals = [str(s) for s in (getattr(pat, "supporting_signals", []) or [])]
            opposing = [str(s) for s in (getattr(pat, "opposing_signals", []) or [])]
            eids = self._evidence_for_signals(ctx, supporting_signals)
            opp_ids = self._evidence_for_signals(ctx, opposing)
            supporting.extend(eids)
            conflicting.extend(opp_ids)
            compat = _compat_value(pat)
            stmt = (
                f"{getattr(pat, 'pattern_type', 'Pattern')}: "
                f"{', '.join(supporting_signals) or 'no signals listed'} show concurrent deviation "
                f"(compatibility {compat}, confidence {getattr(pat, 'confidence', 'LIMITED')}). "
                f"Association only."
            )
            findings.append(
                ExpertFinding(
                    statement=stmt,
                    evidence_ids=eids,
                    confidence=str(getattr(pat, "confidence", "LIMITED")),
                    temporal_semantics="CALCULATED",
                )
            )

        for rel in list(ctx.profile.relationships or [])[:6]:
            primary = str(getattr(rel, "primary_signal", "?"))
            secondary = str(getattr(rel, "secondary_signal", "?"))
            r = getattr(rel, "correlation_coefficient", None)
            n = getattr(rel, "sample_size", None)
            eids = self._evidence_for_signals(ctx, [primary, secondary])
            supporting.extend(eids)
            r_txt = fmt_value(r, 3) if r is not None else "N/A"
            n_txt = str(n) if n is not None else "N/A"
            findings.append(
                ExpertFinding(
                    statement=(
                        f"Exploratory correlation {primary} with {secondary}: "
                        f"r = {r_txt}, N = {n_txt}. Correlation is not causation."
                    ),
                    evidence_ids=eids,
                    confidence=str(getattr(rel, "confidence", "LIMITED")),
                    temporal_semantics="CALCULATED",
                )
            )

        participants: Set[ExpertId] = {e for e in ready_experts if e != ExpertId.CROSS_SIGNAL}
        summary = (
            f"{len(patterns)} concurrence patterns across {len(participants)} expert domains."
            if (patterns or findings) else "Independent signals reviewed; no combined pattern asserted."
        )
        return ExpertOutput(
            expert=self.expert_id,
            display_name=self.display_name,
            status=ExpertStatus.READY,
            relevance=ctx.decision.relevance,
            plain_summary=summary,
            findings=findings,
            evidence_ids=sorted(set(supporting)),
            conflicting_evidence_ids=sorted(set(conflicting)),
            confidence="LIMITED",
            limitations=[
                "All combined statements are statistical associations, never causal claims.",
                "Combination requires Phase 6 temporal compatibility; otherwise signals stay separate.",
            ],
            provenance="CALCULATED",
        )
