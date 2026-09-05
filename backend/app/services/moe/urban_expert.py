"""EarthPulse AI — Urban Dynamics Expert.

Reads Sentinel-2 NDBI, VIIRS nighttime radiance and OSM snapshot context:
identifies built-environment and nighttime-light change patterns side by
side. Nighttime radiance is never equated with economic prosperity, and OSM
is always described as a static snapshot, never growth.
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


class UrbanExpert(BaseExpert):
    expert_id = ExpertId.URBAN
    display_name = "Urban dynamics"

    def _signal_items(self, ctx: ExpertContext, *needles: str) -> List[str]:
        out = []
        for eid in ctx.evidence_ids():
            item = ctx.evidence_by_id(eid)
            text = f"{getattr(item, 'metric_name', '')} {getattr(item, 'source_dataset', '')}".lower()
            if any(n in text for n in needles):
                out.append(eid)
        return out

    def run(self, ctx: ExpertContext) -> ExpertOutput:
        findings: List[ExpertFinding] = []
        cited: List[str] = []

        for anom in ctx.temporal_anomalies():
            sig = str(anom.signal).upper()
            eids = [
                eid for eid in ctx.evidence_ids()
                if sig.lower() in str(getattr(ctx.evidence_by_id(eid), "metric_name", "")).lower()
                or str(getattr(ctx.evidence_by_id(eid), "metric_name", "")).lower() in sig.lower()
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
                unit = "value"
            direction = direction_word(
                item.canonical_value if item is not None else anom.observed_value,
                item.baseline_value if item is not None else anom.baseline_mean,
            )
            sev = severity_of(anom)
            findings.append(
                ExpertFinding(
                    statement=(
                        f"{sig} observed {obs} {unit} on {period} {direction} "
                        f"the baseline mean {base} (z = {z}, severity {sev})."
                    ),
                    evidence_ids=eids,
                    confidence=conf,
                    temporal_semantics=item.temporal_semantics if item is not None else "CALCULATED",
                )
            )
            cited.extend(eids)

        # OSM snapshot context: recorded facts only, never trends.
        osm_ids = self._signal_items(ctx, "mapped_building_count", "road_density", "total_poi_count", "openstreetmap")
        for eid in osm_ids:
            item = ctx.evidence_by_id(eid)
            if item is None:
                continue
            metric = str(getattr(item, "metric_name", ""))
            if "building" in metric:
                text = f"OpenStreetMap snapshot records {int(item.canonical_value)} mapped building footprints as of {item.observation_period}."
            elif "road_density" in metric:
                text = f"OpenStreetMap snapshot records road density {fmt_value(item.canonical_value)} km/km^2 as of {item.observation_period}."
            elif "poi" in metric:
                text = f"OpenStreetMap snapshot records {int(item.canonical_value)} mapped points of interest as of {item.observation_period}."
            else:
                text = f"OpenStreetMap snapshot context recorded as of {item.observation_period}."
            findings.append(
                ExpertFinding(
                    statement=text,
                    evidence_ids=[eid],
                    confidence=getattr(item, "confidence", "HIGH_SNAPSHOT"),
                    temporal_semantics="SNAPSHOT",
                )
            )
            cited.append(eid)

        n_anom = len(ctx.temporal_anomalies())
        summary = (
            f"{n_anom} built-environment finding(s) (strongest: {strongest_severity(ctx.temporal_anomalies())}) plus mapped infrastructure context."
            if (n_anom or osm_ids) else "Built-environment signals present at baseline levels; no anomaly detected."
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
                "VIIRS evidence is an April annual baseline, not continuous monthly monitoring.",
                "OSM is a static snapshot; it cannot show growth, increase or decline over time.",
                "Nighttime radiance is reported as measured light only, never as economic activity.",
            ],
            provenance="CALCULATED",
        )
