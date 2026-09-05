"""Multi-Signal Statistical Anomaly Detection.
Combines robust z-score thresholds with unsupervised multi-variate Isolation Forests.
"""

from typing import List, Dict, Any
import numpy as np
from sklearn.ensemble import IsolationForest
from app.ml.baseline import calculate_calendar_month_baseline, compute_robust_zscore


def detect_statistical_anomalies(
    time_series_records: List[Dict[str, Any]],
    z_threshold: float = 2.0
) -> List[Dict[str, Any]]:
    """Detect anomalies when robust Z-score exceeds the threshold (|Z| >= z_threshold)."""
    anomalies = []
    if not time_series_records:
        return anomalies

    # Group values by calendar month (1 to 12)
    month_groups = {m: [] for m in range(1, 13)}
    for r in time_series_records:
        month = r["month"]
        month_groups[month].append(r["value"])

    # Compute baseline per calendar month
    baselines = {m: calculate_calendar_month_baseline(vals) for m, vals in month_groups.items()}

    for r in time_series_records:
        m = r["month"]
        b = baselines[m]
        if b["count"] < 2:
            continue

        z = compute_robust_zscore(r["value"], b["median"], b["mad"])
        if abs(z) >= z_threshold:
            severity = "CRITICAL" if abs(z) >= 3.0 else ("HIGH" if abs(z) >= 2.5 else "MEDIUM")
            anomalies.append({
                "grid_id": r.get("grid_id"),
                "year_month": r.get("year_month"),
                "signal_name": r.get("signal_name"),
                "observed_value": r.get("value"),
                "baseline_mean": b["median"],
                "baseline_std": b["mad"],
                "z_score": round(z, 3),
                "severity": severity,
                "anomaly_type": f"{r.get('signal_name').upper()}_{'SURGE' if z > 0 else 'DEFICIT'}"
            })

    return anomalies


def fit_isolation_forest_anomalies(
    feature_matrix: np.ndarray,
    contamination: float = 0.05,
    random_state: int = 42
) -> np.ndarray:
    """Multi-variate anomaly scoring using Isolation Forest on standardized feature vectors.
    Returns array of anomaly predictions (-1 for anomaly, 1 for normal).
    """
    if len(feature_matrix) < 5:
        return np.ones(len(feature_matrix))

    clf = IsolationForest(contamination=contamination, random_state=random_state)
    return clf.fit_predict(feature_matrix)
