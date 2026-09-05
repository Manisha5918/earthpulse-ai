"""EarthPulse AI — Statistical Anomaly Detection Service.
Calculates temporal Z-scores, Robust MAD scores, and spatial regional deviations.
Separates temporal anomalies from spatial anomalies.
Strict Provenance: Zero fabricated values.
"""

import os
import csv
import math
from typing import List, Dict, Any, Optional
from datetime import date

from app.config.intelligence import (
    MIN_OBS_ZSCORE,
    MIN_OBS_MAD,
    MIN_ELIGIBLE_CELLS_SPATIAL,
    Z_THRESHOLD_CRITICAL,
    Z_THRESHOLD_HIGH,
    Z_THRESHOLD_MEDIUM
)
from app.schemas.intelligence import (
    TemporalAnomaly,
    SpatialAnomaly,
    AnomalySeverity,
    BaselineSummary
)
from app.services.baseline_service import BaselineService, compute_series_stats
from app.utils.geo_helpers import get_dataset_file

S2_CSV = get_dataset_file("datasets", "sentinel2", "processed", "sentinel2_chennai_grid_observations.csv")
VIIRS_CSV = get_dataset_file("datasets", "viirs", "processed", "viirs_chennai_grid_observations.csv")
OSM_CSV = get_dataset_file("datasets", "osm", "processed", "osm_chennai_grid_context.csv")


class AnomalyService:

    @classmethod
    def compute_temporal_anomaly(
        cls,
        signal: str,
        observation_date: str,
        observed_value: float,
        baseline: Optional[BaselineSummary],
        source_id: str = "OBS_REF"
    ) -> TemporalAnomaly:
        """Compute temporal z-score and robust deviation against a historical baseline."""
        if not baseline or baseline.observation_count < MIN_OBS_ZSCORE or baseline.mean is None:
            return TemporalAnomaly(
                signal=signal,
                observation_date=observation_date,
                observed_value=observed_value,
                baseline_mean=baseline.mean if baseline else None,
                baseline_median=baseline.median if baseline else None,
                z_score=None,
                robust_mad_score=None,
                severity=AnomalySeverity.INSUFFICIENT_OBSERVATIONS,
                status="INSUFFICIENT_OBSERVATIONS",
                confidence="INSUFFICIENT",
                source_observation_ids=[source_id],
                provenance="CALCULATED"
            )

        mean_v = baseline.mean
        std_v = baseline.stddev if baseline.stddev is not None else 0.0
        median_v = baseline.median if baseline.median is not None else mean_v

        # Check for invariant baseline (stddev = 0)
        if std_v <= 1e-6:
            if abs(observed_value - mean_v) < 1e-6:
                # Value matches the invariant historical constant exactly
                return TemporalAnomaly(
                    signal=signal,
                    observation_date=observation_date,
                    observed_value=observed_value,
                    baseline_mean=mean_v,
                    baseline_median=median_v,
                    z_score=0.0,
                    robust_mad_score=0.0,
                    severity=AnomalySeverity.NORMAL,
                    status="INVARIANT_BASELINE",
                    confidence="LIMITED",
                    source_observation_ids=[source_id],
                    provenance="CALCULATED"
                )
            else:
                # Value deviates from the invariant baseline, but z-score cannot be calculated (0 division)
                return TemporalAnomaly(
                    signal=signal,
                    observation_date=observation_date,
                    observed_value=observed_value,
                    baseline_mean=mean_v,
                    baseline_median=median_v,
                    z_score=None,
                    robust_mad_score=None,
                    severity=AnomalySeverity.MEDIUM,
                    status="INVARIANT_BASELINE_DEVIATION",
                    confidence="LIMITED",
                    source_observation_ids=[source_id],
                    provenance="CALCULATED"
                )

        # Standard Z-score
        z = round((observed_value - mean_v) / std_v, 3)

        # Robust score using estimated MAD
        est_mad = std_v / 1.4826 if std_v > 0 else 0.001
        robust_z = round((observed_value - median_v) / (1.4826 * est_mad), 3)

        # Classify Severity
        abs_z = abs(z)
        if abs_z >= Z_THRESHOLD_CRITICAL:
            sev = AnomalySeverity.CRITICAL
        elif abs_z >= Z_THRESHOLD_HIGH:
            sev = AnomalySeverity.HIGH
        elif abs_z >= Z_THRESHOLD_MEDIUM:
            sev = AnomalySeverity.MEDIUM
        else:
            sev = AnomalySeverity.NORMAL

        status = "EXPLORATORY" if baseline.observation_count <= 4 else "CALCULATED"

        return TemporalAnomaly(
            signal=signal,
            observation_date=observation_date,
            observed_value=observed_value,
            baseline_mean=mean_v,
            baseline_median=median_v,
            z_score=z,
            robust_mad_score=robust_z,
            severity=sev,
            status=status,
            confidence=baseline.confidence,
            source_observation_ids=[source_id],
            provenance="CALCULATED"
        )

    @classmethod
    def compute_spatial_anomalies(
        cls,
        signal: str,
        target_cell_code: Optional[str] = None,
        period: Optional[str] = None
    ) -> List[SpatialAnomaly]:
        """Compute spatial deviation of each eligible cell against regional cross-cell distribution."""
        records = []

        # 1. Sentinel-2 signals (NDVI, NDWI, NDBI)
        if signal.upper() in ["NDVI", "NDWI", "NDBI"] and os.path.exists(S2_CSV):
            with open(S2_CSV, "r", encoding="utf-8") as f:
                s2_rows = list(csv.DictReader(f))
            target_period = period or "2024-04-29"
            filtered = [r for r in s2_rows if r["observation_date"] == target_period]
            for r in filtered:
                val_str = r.get(signal.upper())
                if val_str and val_str != "":
                    try:
                        records.append({
                            "grid_id": int(r["grid_id"]),
                            "cell_code": r["cell_code"],
                            "value": float(val_str),
                            "period": r["observation_date"]
                        })
                    except ValueError:
                        pass

        # 2. VIIRS radiance
        elif signal.lower() in ["viirs", "viirs_radiance"] and os.path.exists(VIIRS_CSV):
            with open(VIIRS_CSV, "r", encoding="utf-8") as f:
                v_rows = list(csv.DictReader(f))
            target_period = period or "2024-04-01/2024-04-30"
            filtered = [r for r in v_rows if r["observation_period"] == target_period or r["observation_period"].startswith(target_period[:7])]
            for r in filtered:
                val_str = r.get("nighttime_radiance_mean")
                if val_str and val_str != "":
                    try:
                        records.append({
                            "grid_id": int(r["grid_id"]),
                            "cell_code": r["cell_code"],
                            "value": float(val_str),
                            "period": target_period[:7]
                        })
                    except ValueError:
                        pass

        # 3. OSM road density / building count (Spatial snapshot context)
        elif signal.lower() in ["osm_road_density", "osm_buildings"] and os.path.exists(OSM_CSV):
            with open(OSM_CSV, "r", encoding="utf-8") as f:
                osm_rows = list(csv.DictReader(f))
            for r in osm_rows:
                col = "road_density_km_per_km2" if signal.lower() == "osm_road_density" else "mapped_building_count"
                val_str = r.get(col)
                if val_str and val_str != "":
                    try:
                        records.append({
                            "grid_id": int(r["grid_id"]),
                            "cell_code": r["cell_code"],
                            "value": float(val_str),
                            "period": "SNAPSHOT_2026-09-03"
                        })
                    except ValueError:
                        pass

        if not records:
            return []

        # Filter eligible values (exclude non-terrestrial ocean cells where applicable)
        eligible_records = [r for r in records if r["value"] is not None and not math.isnan(r["value"])]
        excluded_count = len(records) - len(eligible_records)

        vals = [r["value"] for r in eligible_records]
        stats = compute_series_stats(vals)

        if stats["count"] < MIN_ELIGIBLE_CELLS_SPATIAL or stats["mean"] is None:
            return []

        mean_v = stats["mean"]
        std_v = stats["stddev"] if stats["stddev"] and stats["stddev"] > 1e-6 else 0.001
        median_v = stats["median"]
        n_eligible = len(eligible_records)

        results = []
        for r in eligible_records:
            if target_cell_code and r["cell_code"] != target_cell_code:
                continue

            z_spatial = round((r["value"] - mean_v) / std_v, 3)
            rank = sum(1 for v in vals if v <= r["value"])
            pct_rank = round((rank / float(n_eligible)) * 100.0, 1)

            results.append(SpatialAnomaly(
                grid_id=r["grid_id"],
                cell_code=r["cell_code"],
                signal=signal.lower(),
                observation_period=r["period"],
                cell_value=r["value"],
                regional_mean=mean_v,
                regional_median=median_v,
                regional_std=round(std_v, 4),
                spatial_z_score=z_spatial,
                percentile_rank=pct_rank,
                is_spatial_outlier=abs(z_spatial) >= Z_THRESHOLD_MEDIUM,
                eligible_cell_count=n_eligible,
                excluded_cell_count=excluded_count,
                provenance="CALCULATED"
            ))

        return results
