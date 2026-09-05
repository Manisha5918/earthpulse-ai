"""Historical Seasonal Baseline Engine.
Computes calendar-month baselines (e.g. all Mays 2021-2023) using median and MAD.
"""

from typing import Dict, Any, List
import numpy as np


def calculate_calendar_month_baseline(historical_values: List[float]) -> Dict[str, float]:
    """Calculate seasonal baseline statistics using median and Median Absolute Deviation (MAD).

    Returns a dict with mean, std, median, and mad.
    """
    arr = np.array([v for v in historical_values if v is not None and not np.isnan(v)], dtype=float)
    if len(arr) == 0:
        return {"mean": 0.0, "std": 1.0, "median": 0.0, "mad": 1.0, "count": 0}

    mean_val = float(np.mean(arr))
    std_val = float(np.std(arr)) if len(arr) > 1 else 1.0
    median_val = float(np.median(arr))
    mad_val = float(np.median(np.abs(arr - median_val)))

    # Prevent zero division in MAD
    if mad_val == 0:
        mad_val = std_val if std_val > 0 else 0.001

    return {
        "mean": mean_val,
        "std": std_val if std_val > 0 else 0.001,
        "median": median_val,
        "mad": mad_val,
        "count": len(arr)
    }


def compute_robust_zscore(observed_value: float, median: float, mad: float) -> float:
    """Robust Z-Score using Median Absolute Deviation (MAD):
    Z = (x - median) / (1.4826 * MAD)
    """
    scale = 1.4826 * mad
    if scale <= 0:
        scale = 0.001
    return float((observed_value - median) / scale)
