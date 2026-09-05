"""EarthPulse AI — Statistical Baseline Service.
Calculates historical temporal baselines from real observations with strict sample-size rules.
Small samples (N=3,4) are marked LIMITED / EXPLORATORY.
Strict Provenance: Zero fabricated values.
"""

import os
import csv
import math
from typing import List, Dict, Any, Optional
from datetime import date

from app.config.intelligence import (
    MIN_OBS_ZSCORE,
    SENTINEL2_DEFAULT_CONFIDENCE,
    VIIRS_DEFAULT_CONFIDENCE,
    NASA_POWER_DEFAULT_CONFIDENCE
)
from app.schemas.intelligence import BaselineSummary

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
S2_CSV = os.path.join(BASE_DIR, "datasets", "sentinel2", "processed", "sentinel2_chennai_grid_observations.csv")
VIIRS_CSV = os.path.join(BASE_DIR, "datasets", "viirs", "processed", "viirs_chennai_grid_observations.csv")
NASA_CSV = os.path.join(BASE_DIR, "datasets", "nasa_power", "processed", "nasa_power_chennai_daily_2021_2024.csv")


def compute_series_stats(values: List[float]) -> Dict[str, Optional[float]]:
    """Compute mean, median, stddev, min, max for a clean numeric series."""
    clean = [v for v in values if v is not None and not math.isnan(v)]
    if not clean:
        return {"mean": None, "median": None, "stddev": None, "min": None, "max": None, "count": 0}

    n = len(clean)
    mean_v = sum(clean) / n
    sorted_v = sorted(clean)
    median_v = sorted_v[n // 2] if n % 2 != 0 else (sorted_v[n // 2 - 1] + sorted_v[n // 2]) / 2.0
    var = sum((x - mean_v) ** 2 for x in clean) / n
    std_v = math.sqrt(var)

    return {
        "mean": round(mean_v, 4),
        "median": round(median_v, 4),
        "stddev": round(std_v, 4),
        "min": round(min(clean), 4),
        "max": round(max(clean), 4),
        "count": n
    }


class BaselineService:

    @classmethod
    def compute_sentinel2_baselines(
        cls,
        cell_code: Optional[str] = None
    ) -> Dict[str, BaselineSummary]:
        """Compute NDVI, NDWI, NDBI baselines from verified Sentinel-2 scenes."""
        if not os.path.exists(S2_CSV):
            return {}

        with open(S2_CSV, "r", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))

        if cell_code:
            rows = [r for r in rows if r["cell_code"] == cell_code]

        if not rows:
            return {}

        dates = sorted(set(r["observation_date"] for r in rows))
        res = {}
        for sig in ["NDVI", "NDWI", "NDBI"]:
            vals = [float(r[sig]) for r in rows if r.get(sig) and r[sig] != ""]
            stats = compute_series_stats(vals)
            cnt = stats["count"]
            is_sufficient = cnt >= MIN_OBS_ZSCORE
            status = "EXPLORATORY" if is_sufficient else "INSUFFICIENT_OBSERVATIONS"
            conf = SENTINEL2_DEFAULT_CONFIDENCE if is_sufficient else "INSUFFICIENT"

            res[sig.lower()] = BaselineSummary(
                signal=sig.lower(),
                observation_count=cnt,
                earliest_observation=dates[0] if dates else None,
                latest_observation=dates[-1] if dates else None,
                mean=stats["mean"] if is_sufficient else None,
                median=stats["median"] if is_sufficient else None,
                stddev=stats["stddev"] if is_sufficient else None,
                min=stats["min"] if is_sufficient else None,
                max=stats["max"] if is_sufficient else None,
                baseline_period=f"{dates[0]} to {dates[-1]}" if dates else "N/A",
                temporal_semantics="MULTI_TEMPORAL_SCENES",
                data_completeness=round(cnt / 4.0, 2) if cnt <= 4 else 1.0,
                confidence=conf,
                status=status,
                provenance="CALCULATED"
            )
        return res

    @classmethod
    def compute_viirs_baseline(
        cls,
        cell_code: Optional[str] = None
    ) -> Dict[str, BaselineSummary]:
        """Compute VIIRS nighttime radiance baseline from 4 April annual composites."""
        if not os.path.exists(VIIRS_CSV):
            return {}

        with open(VIIRS_CSV, "r", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))

        if cell_code:
            rows = [r for r in rows if r["cell_code"] == cell_code]

        if not rows:
            return {}

        periods = sorted(set(r["observation_period"][:7] for r in rows))
        vals = [float(r["nighttime_radiance_mean"]) for r in rows if r.get("nighttime_radiance_mean")]
        stats = compute_series_stats(vals)
        cnt = stats["count"]
        is_sufficient = cnt >= MIN_OBS_ZSCORE
        status = "EXPLORATORY" if is_sufficient else "INSUFFICIENT_OBSERVATIONS"
        conf = VIIRS_DEFAULT_CONFIDENCE if is_sufficient else "INSUFFICIENT"

        return {
            "viirs_radiance": BaselineSummary(
                signal="viirs_radiance",
                observation_count=cnt,
                earliest_observation=periods[0] if periods else None,
                latest_observation=periods[-1] if periods else None,
                mean=stats["mean"] if is_sufficient else None,
                median=stats["median"] if is_sufficient else None,
                stddev=stats["stddev"] if is_sufficient else None,
                min=stats["min"] if is_sufficient else None,
                max=stats["max"] if is_sufficient else None,
                baseline_period=f"{periods[0]} to {periods[-1]}" if periods else "N/A",
                temporal_semantics="ANNUAL_BASELINE",
                data_completeness=round(cnt / 4.0, 2) if cnt <= 4 else 1.0,
                confidence=conf,
                status=status,
                provenance="CALCULATED"
            )
        }

    @classmethod
    def compute_nasa_power_baselines(cls) -> Dict[str, BaselineSummary]:
        """Compute NASA POWER weather baselines from daily observations."""
        if not os.path.exists(NASA_CSV):
            return {}

        with open(NASA_CSV, "r", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))

        if not rows:
            return {}

        dates = [r["date"] for r in rows]
        t_vals = [float(r["temperature_2m_c"]) for r in rows]
        p_vals = [float(r["precipitation_mm_day"]) for r in rows]

        t_stats = compute_series_stats(t_vals)
        p_stats = compute_series_stats(p_vals)

        return {
            "temperature_2m": BaselineSummary(
                signal="temperature_2m",
                observation_count=t_stats["count"],
                earliest_observation=dates[0],
                latest_observation=dates[-1],
                mean=t_stats["mean"],
                median=t_stats["median"],
                stddev=t_stats["stddev"],
                min=t_stats["min"],
                max=t_stats["max"],
                baseline_period=f"{dates[0]} to {dates[-1]}",
                temporal_semantics="CONTINUOUS_OBSERVATIONS",
                data_completeness=1.0,
                confidence=NASA_POWER_DEFAULT_CONFIDENCE,
                status="CALCULATED",
                provenance="CALCULATED"
            ),
            "precipitation": BaselineSummary(
                signal="precipitation",
                observation_count=p_stats["count"],
                earliest_observation=dates[0],
                latest_observation=dates[-1],
                mean=p_stats["mean"],
                median=p_stats["median"],
                stddev=p_stats["stddev"],
                min=p_stats["min"],
                max=p_stats["max"],
                baseline_period=f"{dates[0]} to {dates[-1]}",
                temporal_semantics="CONTINUOUS_OBSERVATIONS",
                data_completeness=1.0,
                confidence=NASA_POWER_DEFAULT_CONFIDENCE,
                status="CALCULATED",
                provenance="CALCULATED"
            )
        }

    @classmethod
    def get_all_baselines(cls, cell_code: Optional[str] = None) -> Dict[str, BaselineSummary]:
        """Combine baselines for all supported observation signals."""
        baselines = {}
        baselines.update(cls.compute_sentinel2_baselines(cell_code))
        baselines.update(cls.compute_viirs_baseline(cell_code))
        baselines.update(cls.compute_nasa_power_baselines())
        return baselines
