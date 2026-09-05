"""EarthPulse AI — Spatial Intelligence Expert.

Reads spatial anomaly results: determines whether change is isolated to a
single cell or coherent across neighboring cells, using existing Phase 6
spatial outputs only.
"""

from collections import defaultdict
from typing import List

from app.services.moe.base_expert import BaseExpert, ExpertContext, fmt_value
from app.services.moe.models import ExpertFinding, ExpertId, ExpertOutput, ExpertStatus


class SpatialExpert(BaseExpert):
    expert_id = ExpertId.SPATIAL
    display_name = "Spatial context"

    def run(self, ctx: ExpertContext) -> ExpertOutput:
        findings: List[ExpertFinding] = []
        cited: List[str] = []

        by_signal: dict = defaultdict(list)
        for anom in ctx.profile.spatial_anomalies or []:
            by_signal[str(anom.signal)].append(anom)

        for sig, records in sorted(by_signal.items()):
            outliers = [r for r in records if getattr(r, "is_spatial_outlier", False)]
            flagged = outliers or records
            cells = sorted({getattr(r, "cell_code", "?") for r in flagged})
            # Cite temporal evidence items of the same signal where available.
            eids = [
                eid for eid in ctx.evidence_ids()
                if sig.lower() in str(getattr(ctx.evidence_by_id(eid), "metric_name", "")).lower()
            ]
            cited.extend(eids)
            if len(cells) >= 2:
                verdict = f"spatially coherent across {len(cells)} cells ({', '.join(cells[:8])})"
            elif len(cells) == 1:
                verdict = f"isolated to a single cell ({cells[0]})"
            else:
                verdict = "no cells flagged"
            z_vals = [getattr(r, "spatial_z_score", None) for r in flagged if getattr(r, "spatial_z_score", None) is not None]
            z_txt = f" max spatial z = {fmt_value(max(z_vals, key=abs), 3)}" if z_vals else ""
            cited_items = [ctx.evidence_by_id(e) for e in eids]
            cited_items = [i for i in cited_items if i is not None]
            cited_txt = ""
            if cited_items:
                cited_txt = " Cited observations: " + "; ".join(
                    f"{str(getattr(i, 'metric_name', '')).upper()} {fmt_value(i.canonical_value)}"
                    for i in cited_items
                ) + "."
            findings.append(
                ExpertFinding(
                    statement=f"{sig.upper()} deviation is {verdict}.{z_txt}{cited_txt}",
                    evidence_ids=sorted(set(eids)),
                    confidence="LIMITED",
                    temporal_semantics="MULTI_TEMPORAL_SCENES",
                )
            )

        n_cells = len({getattr(r, "cell_code", "?") for r in (ctx.profile.spatial_anomalies or [])})
        summary = (
            f"Spatial deviation assessed across {n_cells} flagged cell(s)."
            if n_cells else "No spatial deviation records in the current evidence."
        )
        return ExpertOutput(
            expert=self.expert_id,
            display_name=self.display_name,
            status=ExpertStatus.READY,
            relevance=ctx.decision.relevance,
            plain_summary=summary,
            findings=findings,
            evidence_ids=sorted(set(cited)),
            confidence="LIMITED",
            limitations=[
                "Coherence is assessed from the 0.05° analytical grid only.",
                "Spatial deviation describes distribution, not causation.",
            ],
            provenance="CALCULATED",
        )
