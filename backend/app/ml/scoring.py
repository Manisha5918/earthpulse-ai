"""Cross-Signal Correlation and Dynamic Relationship Analysis.
Calculates pairwise Pearson correlation to connect multi-sensor signals.
"""

from typing import List, Dict, Any
import numpy as np
from scipy.stats import pearsonr


def compute_cross_signal_correlations(
    signal_a_series: List[float],
    signal_b_series: List[float],
    primary_name: str,
    secondary_name: str,
    grid_id: int
) -> Dict[str, Any]:
    """Compute Pearson correlation coefficient and p-value between two co-occurring signal series."""
    valid_pairs = [
        (a, b) for a, b in zip(signal_a_series, signal_b_series)
        if a is not None and b is not None and not np.isnan(a) and not np.isnan(b)
    ]

    if len(valid_pairs) < 4:
        return {
            "grid_id": grid_id,
            "primary_signal": primary_name,
            "secondary_signal": secondary_name,
            "correlation_coefficient": 0.0,
            "p_value": None,
            "relationship_type": "INSUFFICIENT_DATA",
            "sample_size": len(valid_pairs)
        }

    x = [p[0] for p in valid_pairs]
    y = [p[1] for p in valid_pairs]

    # Check for constant arrays
    if np.std(x) == 0 or np.std(y) == 0:
        return {
            "grid_id": grid_id,
            "primary_signal": primary_name,
            "secondary_signal": secondary_name,
            "correlation_coefficient": 0.0,
            "p_value": 1.0,
            "relationship_type": "INVARIANT_SIGNAL",
            "sample_size": len(valid_pairs)
        }

    corr, p_val = pearsonr(x, y)

    rel_type = "UNCOUPLED"
    if abs(corr) >= 0.6 and p_val < 0.05:
        rel_type = "STRONG_POSITIVE_COUPLING" if corr > 0 else "STRONG_INVERSE_COUPLING"
    elif abs(corr) >= 0.35 and p_val < 0.10:
        rel_type = "MODERATE_COUPLING"

    return {
        "grid_id": grid_id,
        "primary_signal": primary_name,
        "secondary_signal": secondary_name,
        "correlation_coefficient": round(float(corr), 4),
        "p_value": round(float(p_val), 6) if p_val is not None else None,
        "relationship_type": rel_type,
        "sample_size": len(valid_pairs)
    }
