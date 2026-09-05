"""EarthPulse AI — Cross-Signal Intelligence & Relationship Service.
Evaluates multi-sensor concurrence patterns and exploratory correlations.
Strict Rule: Correlation is NOT causation. causal_claim is ALWAYS False.
Strict Provenance: Zero fabricated values.
"""

import math
from typing import List, Dict, Any, Optional

from app.config.intelligence import MIN_OBS_CORRELATION, CONFIDENCE_LIMITED, CONFIDENCE_HIGH
from app.schemas.intelligence import (
    CrossSignalPattern,
    SignalRelationship,
    CorrelationMethod,
    TemporalCompatibilityType
)
from app.services.temporal_alignment_service import TemporalAlignmentService


def rank_data(values: List[float]) -> List[float]:
    """Assign fractional ranks to data for Spearman correlation."""
    n = len(values)
    indexed = sorted([(val, i) for i, val in enumerate(values)], key=lambda x: x[0])
    ranks = [0.0] * n
    i = 0
    while i < n:
        j = i
        while j < n - 1 and math.isclose(indexed[j][0], indexed[j + 1][0], rel_tol=1e-9, abs_tol=1e-9):
            j += 1
        rank = (i + j + 2) / 2.0  # 1-based average rank
        for k in range(i, j + 1):
            ranks[indexed[k][1]] = rank
        i = j + 1
    return ranks


def calculate_pearson(x: List[float], y: List[float]) -> tuple[float, Optional[float]]:
    """Compute Pearson correlation and exact 2-tailed p-value."""
    n = len(x)
    mean_x = sum(x) / n
    mean_y = sum(y) / n

    cov = sum((xi - mean_x) * (yi - mean_y) for xi, yi in zip(x, y))
    var_x = sum((xi - mean_x) ** 2 for xi in x)
    var_y = sum((yi - mean_y) ** 2 for yi in y)

    if var_x <= 1e-12 or var_y <= 1e-12:
        return 0.0, None

    r = cov / math.sqrt(var_x * var_y)
    r = max(-1.0, min(1.0, r))

    if n > 2 and abs(r) < 1.0:
        t_stat = r * math.sqrt((n - 2) / (1.0 - r ** 2))
        # Exact 2-tailed student-t p-value for df = n - 2
        df = n - 2
        if df == 2:
            p_val = round(1.0 - abs(t_stat) / math.sqrt(2.0 + t_stat ** 2), 6)
        else:
            p_val = round(2.0 * (1.0 - 0.5 * (1.0 + math.erf(abs(t_stat) / math.sqrt(2.0)))), 6)
    else:
        p_val = 0.0 if abs(r) >= 0.999 else 1.0

    return round(r, 4), p_val


class CrossSignalService:

    @classmethod
    def evaluate_patterns(
        cls,
        cell_code: str,
        ndbi_change: Optional[float],
        viirs_change: Optional[float],
        ndvi_change: Optional[float],
        temp_change: Optional[float],
        precip_change: Optional[float],
        temporal_alignment: Any
    ) -> List[CrossSignalPattern]:
        """Detect multi-sensor evidence patterns when temporal compatibility is established."""
        patterns = []

        # Strict check: Incompatible timestamps cannot form a cross-signal pattern
        compat = temporal_alignment.compatibility
        if compat == TemporalCompatibilityType.INCOMPATIBLE:
            return patterns

        # Pattern 1: Built-environment expansion with vegetation decline
        if ndbi_change is not None and viirs_change is not None and ndvi_change is not None:
            if ndbi_change > 0 and viirs_change > 0 and ndvi_change < 0:
                patterns.append(CrossSignalPattern(
                    pattern_type="BUILT_ENVIRONMENT_CHANGE_WITH_VEGETATION_DECLINE",
                    description="Concurrence of increased built-up index (NDBI), increased nighttime radiance (VIIRS), and reduced vegetation index (NDVI).",
                    supporting_signals=["NDBI", "VIIRS", "NDVI"],
                    opposing_signals=[],
                    evidence_count=3,
                    temporal_compatibility=compat,
                    spatial_compatibility="SAME_GRID_CELL",
                    relationship_type="CORRELATION",
                    causal_claim=False,
                    interpretation_status="EVIDENCE_PATTERN_ONLY",
                    confidence="LIMITED",
                    provenance="CALCULATED"
                ))

        # Pattern 2: Vegetation greening with moisture increase
        if ndvi_change is not None and ndbi_change is not None:
            if ndvi_change > 0 and ndbi_change < 0:
                patterns.append(CrossSignalPattern(
                    pattern_type="VEGETATION_GREENING_WITH_BUILT_INDEX_REDUCTION",
                    description="Concurrence of increased vegetation index (NDVI) and reduced built-up index (NDBI).",
                    supporting_signals=["NDVI", "NDBI"],
                    opposing_signals=[],
                    evidence_count=2,
                    temporal_compatibility=compat,
                    spatial_compatibility="SAME_GRID_CELL",
                    relationship_type="CORRELATION",
                    causal_claim=False,
                    interpretation_status="EVIDENCE_PATTERN_ONLY",
                    confidence="LIMITED",
                    provenance="CALCULATED"
                ))

        # Pattern 3: Thermal surge with precipitation deficit
        if temp_change is not None and precip_change is not None:
            if temp_change > 0 and precip_change < 0:
                patterns.append(CrossSignalPattern(
                    pattern_type="THERMAL_SURGE_WITH_PRECIPITATION_DEFICIT",
                    description="Concurrence of elevated surface temperature and reduced meteorological precipitation.",
                    supporting_signals=["temperature_2m", "precipitation"],
                    opposing_signals=[],
                    evidence_count=2,
                    temporal_compatibility=compat,
                    spatial_compatibility="REGIONAL_GRID",
                    relationship_type="CORRELATION",
                    causal_claim=False,
                    interpretation_status="EVIDENCE_PATTERN_ONLY",
                    confidence="LIMITED",
                    provenance="CALCULATED"
                ))

        return patterns

    @classmethod
    def compute_relationship(
        cls,
        series_x: List[float],
        series_y: List[float],
        signal_x_name: str,
        signal_y_name: str,
        method: CorrelationMethod = CorrelationMethod.PEARSON
    ) -> SignalRelationship:
        """Compute exploratory correlation with non-causal disclosures."""
        valid_pairs = [
            (x, y) for x, y in zip(series_x, series_y)
            if x is not None and y is not None and not math.isnan(x) and not math.isnan(y)
        ]

        n = len(valid_pairs)
        if n < MIN_OBS_CORRELATION:
            return SignalRelationship(
                primary_signal=signal_x_name,
                secondary_signal=signal_y_name,
                method=method,
                correlation_coefficient=None,
                p_value=None,
                sample_size=n,
                relationship_type="CORRELATION",
                causal_claim=False,
                status="INSUFFICIENT_OBSERVATIONS",
                confidence="INSUFFICIENT",
                provenance="CALCULATED"
            )

        x_vals = [p[0] for p in valid_pairs]
        y_vals = [p[1] for p in valid_pairs]

        # Check for invariant signals
        if len(set(x_vals)) <= 1 or len(set(y_vals)) <= 1:
            return SignalRelationship(
                primary_signal=signal_x_name,
                secondary_signal=signal_y_name,
                method=method,
                correlation_coefficient=0.0,
                p_value=None,  # Null when invariant
                sample_size=n,
                relationship_type="CORRELATION",
                causal_claim=False,
                status="INVARIANT_SIGNAL",
                confidence="LIMITED",
                provenance="CALCULATED"
            )

        if method == CorrelationMethod.PEARSON:
            corr, p_val = calculate_pearson(x_vals, y_vals)
        else:
            rx = rank_data(x_vals)
            ry = rank_data(y_vals)
            corr, p_val = calculate_pearson(rx, ry)

        conf = CONFIDENCE_LIMITED if n <= 6 else CONFIDENCE_HIGH

        return SignalRelationship(
            primary_signal=signal_x_name,
            secondary_signal=signal_y_name,
            method=method,
            correlation_coefficient=corr,
            p_value=p_val,
            sample_size=n,
            relationship_type="CORRELATION",
            causal_claim=False,
            status="EXPLORATORY" if n <= 6 else "CALCULATED",
            confidence=conf,
            provenance="CALCULATED"
        )
