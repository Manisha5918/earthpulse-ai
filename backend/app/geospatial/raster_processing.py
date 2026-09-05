"""Raster Zonal Statistics & Extraction Utility."""

from typing import Dict, Any, Optional
import numpy as np


def compute_zonal_statistics(
    array: np.ndarray,
    nodata: Optional[float] = None
) -> Dict[str, float]:
    """Compute summary zonal metrics across a numpy 2D raster array."""
    if nodata is not None:
        valid_mask = (array != nodata) & (~np.isnan(array))
    else:
        valid_mask = ~np.isnan(array)

    valid_vals = array[valid_mask]
    if len(valid_vals) == 0:
        return {
            "mean": 0.0,
            "median": 0.0,
            "min": 0.0,
            "max": 0.0,
            "std": 0.0,
            "count": 0
        }

    return {
        "mean": float(np.mean(valid_vals)),
        "median": float(np.median(valid_vals)),
        "min": float(np.min(valid_vals)),
        "max": float(np.max(valid_vals)),
        "std": float(np.std(valid_vals)),
        "count": int(len(valid_vals))
    }
