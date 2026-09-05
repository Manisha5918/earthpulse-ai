"""EarthPulse AI — Evidence-aware MoE router.

Routes each investigation to domain experts using a composite routing score:

    score = 0.25 * signal_relevance
          + 0.25 * evidence_availability
          + 0.25 * anomaly_strength
          + 0.15 * temporal_compatibility
          + 0.10 * data_completeness

Mapping: score >= 0.70 -> HIGH, >= 0.45 -> MODERATE, >= 0.25 -> LOW,
otherwise INACTIVE. Hard gates (never overridden by the score):

- no evidence for the expert's signals -> INACTIVE
- anomalies absent -> capped at MODERATE (monitoring, nothing unusual)

Region-independent: routing reads only evidence (profile + package +
requested signals). No region conditionals anywhere.
Strict Provenance: Zero fabricated values.
"""

from typing import Dict, List, Optional, Set, Tuple

from app.schemas.analysis import SignalType
from app.schemas.intelligence import RegionalChangeProfile, TemporalCompatibilityType
from app.services.moe.models import (
    ExpertId,
    ExpertStatus,
    RelevanceLevel,
    RoutingComponentScores,
    RoutingDecision,
)

W_RELEVANCE = 0.25
W_AVAILABILITY = 0.25
W_ANOMALY = 0.25
W_TEMPORAL = 0.15
W_COMPLETENESS = 0.10

THRESHOLD_HIGH = 0.70
THRESHOLD_MODERATE = 0.45
THRESHOLD_LOW = 0.25

SEVERITY_STRENGTH = {
    "CRITICAL": 1.0,
    "HIGH": 0.75,
    "MEDIUM": 0.5,
    "NORMAL": 0.2,
    "LOW": 0.2,
    "INSUFFICIENT_OBSERVATIONS": 0.0,
    "INSUFFICIENT": 0.0,
}

COMPATIBLE_TYPES = {
    TemporalCompatibilityType.EXACT_MATCH,
    TemporalCompatibilityType.SAME_DAY,
    TemporalCompatibilityType.SAME_MONTH,
    TemporalCompatibilityType.SAME_SEASON,
    TemporalCompatibilityType.AGGREGATED_WINDOW,
}

# Expert -> signal-name matchers (matched case-insensitively against
# anomaly signal names, baseline keys and package metric/source strings).
EXPERT_SIGNAL_MATCHERS: Dict[ExpertId, List[str]] = {
    ExpertId.VEGETATION: ["ndvi", "ndwi"],
    ExpertId.URBAN: ["ndbi", "viirs", "night_light", "nightlight", "radiance"],
    ExpertId.CLIMATE: ["temperature", "t2m", "precip"],
    ExpertId.SPATIAL: ["ndvi", "ndwi", "ndbi", "viirs", "night_light", "temperature", "precip"],
    ExpertId.CROSS_SIGNAL: [],
}

# Expert -> requested SignalType scope that makes it relevant.
EXPERT_SCOPE: Dict[ExpertId, Set[SignalType]] = {
    ExpertId.VEGETATION: {SignalType.SENTINEL2},
    ExpertId.URBAN: {SignalType.SENTINEL2, SignalType.VIIRS, SignalType.OSM},
    ExpertId.CLIMATE: {SignalType.NASA_POWER},
    ExpertId.SPATIAL: {SignalType.SENTINEL2, SignalType.VIIRS, SignalType.NASA_POWER},
    ExpertId.CROSS_SIGNAL: {SignalType.SENTINEL2, SignalType.VIIRS, SignalType.NASA_POWER, SignalType.OSM},
}


def match_signal(name: Optional[str], matchers: List[str]) -> bool:
    if not name:
        return False
    lowered = str(name).lower()
    return any(m in lowered for m in matchers)


def severity_strength(severity: object) -> float:
    key = getattr(severity, "value", severity)
    return SEVERITY_STRENGTH.get(str(key).upper(), 0.0)


def _anomaly_signals(profile: RegionalChangeProfile) -> List[str]:
    return [a.signal for a in (profile.temporal_anomalies or [])]


def _anomaly_strength(profile: RegionalChangeProfile, matchers: List[str]) -> Tuple[float, List[str]]:
    """Max severity score across mapped temporal anomalies. Returns (score, signals)."""
    best = 0.0
    hits: List[str] = []
    for anom in profile.temporal_anomalies or []:
        if match_signal(anom.signal, matchers):
            s = severity_strength(anom.severity)
            if s > 0:
                hits.append(anom.signal)
            best = max(best, s)
    return best, sorted(set(hits))


def _baseline_keys(profile: RegionalChangeProfile) -> List[str]:
    return list((profile.baselines or {}).keys())


def _package_text(package) -> List[str]:
    """Searchable signal text from every evidence item (metric + source)."""
    texts = []
    for item in (package.evidence_items or {}).values():
        texts.append(f"{getattr(item, 'metric_name', '')} {getattr(item, 'source_dataset', '')}")
    return texts


def _evidence_for(package, matchers: List[str]) -> List[str]:
    """Evidence IDs whose metric/source matches the expert's signals."""
    ids = []
    for eid, item in (package.evidence_items or {}).items():
        if match_signal(getattr(item, "metric_name", ""), matchers) or match_signal(
            getattr(item, "source_dataset", ""), matchers
        ):
            ids.append(eid)
    return sorted(ids)


def _has_osm_context(profile: RegionalChangeProfile) -> bool:
    ctx = profile.spatial_context or {}
    return any(k in ctx for k in ("mapped_building_count", "road_density_km_per_km2", "total_poi_count"))


def _completeness(profile: RegionalChangeProfile, matchers: List[str]) -> float:
    vals = [
        float(b.data_completeness)
        for key, b in (profile.baselines or {}).items()
        if match_signal(key, matchers) and getattr(b, "data_completeness", None) is not None
    ]
    if not vals:
        return 0.0
    return round(sum(vals) / len(vals), 3)


def _sentinel_present(profile: RegionalChangeProfile) -> bool:
    return any(match_signal(k, ["ndvi", "ndwi", "ndbi"]) for k in _baseline_keys(profile))


def _temporal_score(expert: ExpertId, profile: RegionalChangeProfile, package) -> Tuple[float, str]:
    """Temporal compatibility of the expert's evidence (0.0-1.0, with reason)."""
    if expert == ExpertId.VEGETATION:
        keys = _baseline_keys(profile)
        ndvi = any(match_signal(k, ["ndvi", "ndwi"]) for k in keys)
        return (1.0, "NDVI/NDWI share the same multi-temporal scenes") if ndvi else (0.0, "no vegetation scenes")
    if expert == ExpertId.URBAN:
        keys = _baseline_keys(profile)
        ndbi = any(match_signal(k, ["ndbi"]) for k in keys)
        viirs = any(match_signal(k, ["viirs", "radiance"]) for k in keys)
        if ndbi and viirs:
            return (1.0, "NDBI scenes and VIIRS April baseline share the April window")
        if ndbi or viirs or _has_osm_context(profile):
            return (0.5, "single temporal source plus static OSM context")
        return (0.0, "no urban temporal evidence")
    if expert == ExpertId.CLIMATE:
        keys = _baseline_keys(profile)
        t = any(match_signal(k, ["temperature", "t2m"]) for k in keys)
        p = any(match_signal(k, ["precip"]) for k in keys)
        if t and p:
            return (1.0, "temperature and precipitation share the daily series")
        if t or p:
            return (0.5, "single meteorological series")
        return (0.0, "no meteorological evidence")
    if expert == ExpertId.SPATIAL:
        spatial = profile.spatial_anomalies or []
        if not spatial:
            return (0.0, "no spatial anomaly evidence")
        return (1.0, f"{len(spatial)} spatial anomaly records available")
    if expert == ExpertId.CROSS_SIGNAL:
        return _cross_signal_temporal(profile)
    return (0.0, "unknown expert")


def _cross_signal_temporal(profile: RegionalChangeProfile) -> Tuple[float, str]:
    """Cross-signal combination is allowed only when Phase 6 temporal
    compatibility permits it. Any INCOMPATIBLE pattern blocks combination."""
    patterns = list(profile.cross_signal_patterns or [])
    compat_values = set()
    for pat in patterns:
        raw = getattr(pat, "temporal_compatibility", None)
        val = getattr(raw, "value", raw)
        if val is not None:
            compat_values.add(str(val).upper())
    if "INCOMPATIBLE" in compat_values:
        return (0.0, "Phase 6 reports temporally incompatible signals; combination blocked")
    if compat_values & {c.value for c in COMPATIBLE_TYPES}:
        return (1.0, "Phase 6 temporal compatibility permits combination")
    rels = list(profile.relationships or [])
    if rels:
        return (0.5, "exploratory correlations exist without explicit compatibility classification")
    return (0.0, "no cross-signal temporal evidence")


def _relevance(expert: ExpertId, profile: RegionalChangeProfile, scope: Set[SignalType]) -> Tuple[float, str]:
    """Fraction of the expert's scope signals that carry baseline data."""
    if expert == ExpertId.CROSS_SIGNAL:
        return (1.0, "cross-signal reasoning spans all requested signals") if scope else (0.0, "no signals requested")
    wanted = EXPERT_SCOPE.get(expert, set())
    in_scope = wanted & set(scope)
    if not in_scope:
        return (0.0, "expert signals outside the requested scope")
    keys = _baseline_keys(profile)
    if expert == ExpertId.VEGETATION:
        covered = any(match_signal(k, ["ndvi", "ndwi"]) for k in keys)
        return (1.0, "vegetation signals in scope with baseline data") if covered else (0.0, "no vegetation baselines")
    if expert == ExpertId.URBAN:
        have = [m for m in ("ndbi", "viirs", "osm") if (
            any(match_signal(k, [m]) for k in keys) or (m == "osm" and _has_osm_context(profile))
        )]
        frac = len(have) / 3.0
        return (round(frac, 3), f"urban coverage {len(have)}/3 sources")
    if expert == ExpertId.CLIMATE:
        covered = any(match_signal(k, ["temperature", "t2m", "precip"]) for k in keys)
        return (1.0, "meteorological signals in scope with baseline data") if covered else (0.0, "no meteorological baselines")
    if expert == ExpertId.SPATIAL:
        covered = bool(profile.spatial_anomalies) or bool(keys)
        return (1.0, "spatial grid evidence available") if covered else (0.0, "no spatial evidence")
    return (0.0, "unknown expert")


def route_expert(
    expert: ExpertId,
    profile: RegionalChangeProfile,
    package,
    scope: Set[SignalType],
) -> RoutingDecision:
    matchers = EXPERT_SIGNAL_MATCHERS.get(expert, [])
    reasons: List[str] = []

    if expert == ExpertId.CROSS_SIGNAL:
        return _route_cross_signal(profile, scope)

    relevance, rel_reason = _relevance(expert, profile, scope)
    reasons.append(rel_reason)

    evid_ids = _evidence_for(package, matchers)
    if expert == ExpertId.URBAN and _has_osm_context(profile):
        # OSM snapshot counts as urban evidence even without anomaly items.
        availability = 1.0 if evid_ids else 0.5
        reasons.append("OSM snapshot context available" if evid_ids else "only OSM snapshot context, no anomaly items")
    elif evid_ids:
        availability = 1.0
        reasons.append(f"{len(evid_ids)} evidence items reference mapped signals")
    elif any(match_signal(k, matchers if matchers else ["__none__"]) for k in _baseline_keys(profile)):
        availability = 0.5
        reasons.append("baselines present but no dedicated evidence items")
    else:
        availability = 0.0
        reasons.append("no evidence items or baselines for mapped signals")

    anomaly, hits = _anomaly_strength(profile, matchers)
    if hits:
        reasons.append(f"anomalies in {', '.join(hits)} (strength {anomaly})")
    else:
        reasons.append("no anomalies in mapped signals")

    temporal, temp_reason = _temporal_score(expert, profile, package)
    reasons.append(temp_reason)

    completeness = _completeness(profile, matchers + (["osm"] if expert == ExpertId.URBAN else []))
    if expert == ExpertId.URBAN and _has_osm_context(profile) and completeness == 0:
        completeness = 0.5

    composite = round(
        W_RELEVANCE * relevance
        + W_AVAILABILITY * availability
        + W_ANOMALY * anomaly
        + W_TEMPORAL * temporal
        + W_COMPLETENESS * completeness,
        3,
    )

    # Hard gates (never overridden by the composite score).
    status = ExpertStatus.READY
    if availability == 0.0:
        level = RelevanceLevel.INACTIVE
        status = ExpertStatus.NO_RELEVANT_SIGNAL if relevance == 0.0 else ExpertStatus.INSUFFICIENT_EVIDENCE
        reasons.append("gate: no evidence available")
    elif anomaly == 0.0:
        level = RelevanceLevel.MODERATE if composite >= THRESHOLD_MODERATE else (
            RelevanceLevel.LOW if composite >= THRESHOLD_LOW else RelevanceLevel.INACTIVE
        )
        reasons.append("gate: no anomaly detected, capped at MODERATE (monitoring)")
    elif composite >= THRESHOLD_HIGH:
        level = RelevanceLevel.HIGH
    elif composite >= THRESHOLD_MODERATE:
        level = RelevanceLevel.MODERATE
    elif composite >= THRESHOLD_LOW:
        level = RelevanceLevel.LOW
    else:
        level = RelevanceLevel.INACTIVE

    return RoutingDecision(
        expert=expert,
        relevance=level,
        score=RoutingComponentScores(
            signal_relevance=relevance,
            evidence_availability=availability,
            anomaly_strength=anomaly,
            temporal_compatibility=temporal,
            data_completeness=completeness,
            composite_score=composite,
        ),
        reasons=reasons,
        suggested_status=status,
    )


def _route_cross_signal(profile: RegionalChangeProfile, scope: Set[SignalType]) -> RoutingDecision:
    temporal, temp_reason = _cross_signal_temporal(profile)
    patterns = len(list(profile.cross_signal_patterns or []))
    rels = len(list(profile.relationships or []))
    if temporal == 0.0:
        return RoutingDecision(
            expert=ExpertId.CROSS_SIGNAL,
            relevance=RelevanceLevel.INACTIVE,
            score=RoutingComponentScores(temporal_compatibility=0.0, composite_score=0.0),
            reasons=[temp_reason, "gate: cross-signal combination blocked"],
            suggested_status=ExpertStatus.NOT_APPLICABLE,
        )
    availability = 1.0 if patterns else (0.5 if rels else 0.0)
    if availability == 0.0:
        return RoutingDecision(
            expert=ExpertId.CROSS_SIGNAL,
            relevance=RelevanceLevel.INACTIVE,
            score=RoutingComponentScores(temporal_compatibility=temporal, composite_score=0.0),
            reasons=["no cross-signal patterns or relationships", "gate: no evidence available"],
            suggested_status=ExpertStatus.INSUFFICIENT_EVIDENCE,
        )
    composite = round(W_AVAILABILITY * availability + W_TEMPORAL * temporal + W_COMPLETENESS * 0.5, 3)
    level = RelevanceLevel.HIGH if composite >= 0.55 and patterns else RelevanceLevel.MODERATE
    return RoutingDecision(
        expert=ExpertId.CROSS_SIGNAL,
        relevance=level,
        score=RoutingComponentScores(
            signal_relevance=1.0 if scope else 0.0,
            evidence_availability=availability,
            anomaly_strength=0.0,
            temporal_compatibility=temporal,
            data_completeness=0.5,
            composite_score=composite,
        ),
        reasons=[temp_reason, f"{patterns} patterns, {rels} relationships"],
    )


ROUTING_ORDER = [
    ExpertId.VEGETATION,
    ExpertId.URBAN,
    ExpertId.CLIMATE,
    ExpertId.SPATIAL,
    ExpertId.CROSS_SIGNAL,
]


def route_all(
    profile: RegionalChangeProfile,
    package,
    scope: Set[SignalType],
) -> List[RoutingDecision]:
    return [route_expert(e, profile, package, scope) for e in ROUTING_ORDER]
