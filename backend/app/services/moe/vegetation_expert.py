"""EarthPulse AI — Vegetation Intelligence Expert.

Reads Sentinel-2 NDVI/NDWI evidence: identifies meaningful vegetation change
from existing anomalies and baselines, summarizes supporting evidence.
Observational language only; never makes causal claims.
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


class VegetationExpert(BaseExpert):
    expert_id = ExpertId.VEGETATION
    display_name = "Vegetation"

    def run(self, ctx: ExpertContext) -> ExpertOutput:
        findings: List[ExpertFinding] = []
        cited: List[str] = []

        for anom in ctx.temporal_anomalies():
            sig = str(anom.signal).upper()
            # Cite the package evidence items for this exact signal.
            eids = [
                eid for eid in ctx.evidence_ids()
                if (ctx.evidence_by_id(eid) and str(getattr(ctx.evidence_by_id(eid), "metric_name", "")).lower() in sig.lower())
                or sig.lower() in str(getattr(ctx.evidence_by_id(eid), "metric_name", "")).lower()
            ]
            item = ctx.evidence_by_id(eids[0]) if eids else None
            if item is not None:
                obs = fmt_value(item.canonical_value)
                base = fmt_value(item.baseline_value)
                z = fmt_value(item.z_score, 3)
                period = item.observation_period
                conf = item.confidence
                unit = item.unit
            else:
                obs = fmt_value(anom.observed_value)
                base = fmt_value(anom.baseline_mean)
                z = fmt_value(anom.z_score, 3)
                period = anom.observation_date
                conf = anom.confidence
                unit = "index"
            direction = direction_word(
                item.canonical_value if item is not None else anom.observed_value,
                item.baseline_value if item is not None else anom.baseline_mean,
            )
            sev = severity_of(anom)
            findings.append(
                ExpertFinding(
                    statement=(
                        f"{sig} observed {obs} on {period} {direction} "
                        f"the baseline mean {base} (z = {z}, severity {sev})."
                    ),
                    evidence_ids=eids,
                    confidence=conf,
                    temporal_semantics=item.temporal_semantics if item is not None else "MULTI_TEMPORAL_SCENES",
                )
            )
            cited.extend(eids)

        # Spatial note: cells flagged for vegetation signals (profile values only).
        # Cited values are restated verbatim from the referenced evidence.
        spatial_cells = sorted({
            a.cell_code for a in ctx.spatial_anomalies()
            if getattr(a, "cell_code", None)
        })
        if spatial_cells:
            cited_items = [ctx.evidence_by_id(e) for e in sorted(set(cited))]
            cited_items = [i for i in cited_items if i is not None]
            cited_txt = ""
            if cited_items:
                cited_txt = " Cited observations: " + "; ".join(
                    f"{str(getattr(i, 'metric_name', '')).upper()} {fmt_value(i.canonical_value)}"
                    for i in cited_items
                ) + "."
            findings.append(
                ExpertFinding(
                    statement=(
                        f"Vegetation signals deviate in {len(spatial_cells)} grid cell(s): "
                        f"{', '.join(spatial_cells[:8])}.{cited_txt}"
                        + (" Change is spatially coherent." if len(spatial_cells) >= 2 else " Change is isolated to a single cell.")
                    ),
                    evidence_ids=sorted({e for e in cited}),
                    confidence="LIMITED",
                    temporal_semantics="MULTI_TEMPORAL_SCENES",
                )
            )

        n_anom = len(ctx.temporal_anomalies())
        summary = (
            f"{n_anom} vegetation finding(s); strongest deviation: {strongest_severity(ctx.temporal_anomalies())}."
            if n_anom else "Vegetation signals present at baseline levels; no anomaly detected."
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
                "Sentinel-2 evidence covers 4 multi-temporal scenes (2021-2024); confidence is limited/exploratory.",
                "Statements describe observed deviation only, never causation.",
            ],
            provenance="CALCULATED",
        )
