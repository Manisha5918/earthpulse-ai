"""EarthPulse AI — Climate Context Expert.

Reads NASA POWER temperature/precipitation evidence: identifies thermal and
precipitation context, including warmer-than-baseline periods coinciding
with rainfall deficit. Descriptive only; never claims climate causation.
"""

from typing import List

from app.services.moe.base_expert import (
    BaseExpert,
    ExpertContext,
    direction_word,
    fmt_value,
    severity_of,
    strongest_severity,
)
from app.services.moe.models import ExpertFinding, ExpertId, ExpertOutput, ExpertStatus


class ClimateExpert(BaseExpert):
    expert_id = ExpertId.CLIMATE
    display_name = "Climate context"

    def run(self, ctx: ExpertContext) -> ExpertOutput:
        findings: List[ExpertFinding] = []
        cited: List[str] = []
        warmer = False
        drier = False

        for anom in ctx.temporal_anomalies():
            sig = str(anom.signal).upper()
            eids = [
                eid for eid in ctx.evidence_ids()
                if sig.lower() in str(getattr(ctx.evidence_by_id(eid), "metric_name", "")).lower()
                or str(getattr(ctx.evidence_by_id(eid), "metric_name", "")).lower() in sig.lower()
            ]
            item = ctx.evidence_by_id(eids[0]) if eids else None
            if item is not None:
                obs = fmt_value(item.canonical_value, 2)
                base = fmt_value(item.baseline_value, 2)
                z = fmt_value(item.z_score, 3)
                period = item.observation_period
                conf = item.confidence
                unit = item.unit
                direction = direction_word(item.canonical_value, item.baseline_value)
                if "TEMP" in sig and (item.canonical_value or 0) > (item.baseline_value or 0):
                    warmer = True
                if "PRECIP" in sig and (item.canonical_value or 0) < (item.baseline_value or 0):
                    drier = True
            else:
                obs = fmt_value(anom.observed_value, 2)
                base = fmt_value(anom.baseline_mean, 2)
                z = fmt_value(anom.z_score, 3)
                period = anom.observation_date
                conf = anom.confidence
                unit = "value"
                direction = direction_word(anom.observed_value, anom.baseline_mean)
            sev = severity_of(anom)
            findings.append(
                ExpertFinding(
                    statement=(
                        f"{sig} observed {obs} {unit} on {period} {direction} "
                        f"the baseline mean {base} (z = {z}, severity {sev})."
                    ),
                    evidence_ids=eids,
                    confidence=conf,
                    temporal_semantics=item.temporal_semantics if item is not None else "CONTINUOUS_OBSERVATIONS",
                )
            )
            cited.extend(eids)

        if warmer and drier:
            findings.append(
                ExpertFinding(
                    statement=(
                        "Above-baseline temperature coincides with below-baseline precipitation "
                        "in the observation window. This describes co-occurrence only."
                    ),
                    evidence_ids=sorted(set(cited)),
                    confidence="LIMITED",
                    temporal_semantics="CONTINUOUS_OBSERVATIONS",
                )
            )

        n_anom = len(ctx.temporal_anomalies())
        summary = (
            f"{n_anom} meteorological finding(s) (strongest: {strongest_severity(ctx.temporal_anomalies())})."
            if n_anom else "Temperature and precipitation within baseline range; no anomaly detected."
        )
        return ExpertOutput(
            expert=self.expert_id,
            display_name=self.display_name,
            status=ExpertStatus.READY,
            relevance=ctx.decision.relevance,
            plain_summary=summary,
            findings=findings,
            evidence_ids=sorted(set(cited)),
            confidence="HIGH" if n_anom else "LIMITED",
            limitations=[
                "NASA POWER is meteorological context at reanalysis resolution, not fine-resolution local sensing.",
                "Co-occurrence of warm and dry signals is descriptive; no causal attribution is made.",
            ],
            provenance="CALCULATED",
        )
