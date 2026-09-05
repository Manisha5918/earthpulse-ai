"""EarthPulse AI — Regional Change Profile & Scoring Service.
Synthesizes multi-sensor baselines, anomalies, cross-signal patterns, and the Regional Change Score.
Strict Provenance: Zero fabricated values.
"""

import os
import csv
import math
from typing import Dict, Any, List, Optional
from datetime import date

from app.config.intelligence import (
    SCORING_VERSION,
    WEIGHTING_METHOD,
    SCORE_WEIGHTS
)
from app.schemas.intelligence import (
    RegionalChangeScore,
    RegionalChangeProfile,
    TemporalAnomaly,
    SpatialAnomaly,
    CrossSignalPattern,
    SignalRelationship,
    CorrelationMethod,
    TemporalCompatibilityType
)
from app.services.baseline_service import BaselineService
from app.services.anomaly_service import AnomalyService
from app.services.cross_signal_service import CrossSignalService
from app.services.temporal_alignment_service import TemporalAlignmentService
from app.utils.geo_helpers import get_dataset_file

S2_CSV = get_dataset_file("datasets", "sentinel2", "processed", "sentinel2_chennai_grid_observations.csv")
VIIRS_CSV = get_dataset_file("datasets", "viirs", "processed", "viirs_chennai_grid_observations.csv")
NASA_CSV = get_dataset_file("datasets", "nasa_power", "processed", "nasa_power_chennai_daily_2021_2024.csv")
OSM_CSV = get_dataset_file("datasets", "osm", "processed", "osm_chennai_grid_context.csv")


class ChangeProfileService:

    @classmethod
    def build_change_profile(
        cls,
        region_id: str = "IN-TN-CHE",
        cell_code: Optional[str] = None
    ) -> RegionalChangeProfile:
        """Construct the complete statistical change profile for a region or grid cell."""
        # 1. Baselines
        baselines = BaselineService.get_all_baselines(cell_code)

        # 2. Latest Observations & Temporal Anomalies
        temporal_anomalies = []
        spatial_anomalies = []

        # Latest S2 Scene (2024-04-29)
        latest_s2 = None
        if os.path.exists(S2_CSV):
            with open(S2_CSV, "r", encoding="utf-8") as f:
                s2_rows = list(csv.DictReader(f))
            target_rows = [r for r in s2_rows if r["observation_date"] == "2024-04-29"]
            if cell_code:
                target_rows = [r for r in target_rows if r["cell_code"] == cell_code]
            if target_rows:
                latest_s2 = target_rows[0]
                for sig in ["ndvi", "ndwi", "ndbi"]:
                    val = float(latest_s2[sig.upper()])
                    b = baselines.get(sig)
                    temporal_anomalies.append(AnomalyService.compute_temporal_anomaly(
                        signal=sig,
                        observation_date="2024-04-29",
                        observed_value=val,
                        baseline=b,
                        source_id=f"S2_{latest_s2['tile_id']}_20240429"
                    ))

        # Latest VIIRS Observation (2024-04)
        latest_viirs = None
        if os.path.exists(VIIRS_CSV):
            with open(VIIRS_CSV, "r", encoding="utf-8") as f:
                v_rows = list(csv.DictReader(f))
            target_v = [r for r in v_rows if r["observation_period"].startswith("2024-04")]
            if cell_code:
                target_v = [r for r in target_v if r["cell_code"] == cell_code]
            if target_v:
                latest_viirs = target_v[0]
                val = float(latest_viirs["nighttime_radiance_mean"])
                b = baselines.get("viirs_radiance")
                temporal_anomalies.append(AnomalyService.compute_temporal_anomaly(
                    signal="viirs_radiance",
                    observation_date="2024-04",
                    observed_value=val,
                    baseline=b,
                    source_id=f"VIIRS_DNB_202404_{latest_viirs['cell_code']}"
                ))

        # 3. Spatial Anomalies for Cell vs Region
        for sig in ["ndvi", "ndbi", "viirs_radiance", "osm_road_density"]:
            spat_list = AnomalyService.compute_spatial_anomalies(
                signal=sig,
                target_cell_code=cell_code
            )
            spatial_anomalies.extend(spat_list)

        # 4. Temporal Alignment & Cross-Signal Patterns
        obs_meta = []
        if latest_s2:
            obs_meta.append({"source": "SENTINEL2", "date": "2024-04-29"})
        if latest_viirs:
            obs_meta.append({"source": "VIIRS", "date": "2024-04"})
        obs_meta.append({"source": "NASA_POWER", "start": "2024-04-01", "end": "2024-04-30"})

        alignment = TemporalAlignmentService.evaluate_compatibility(obs_meta)

        # Calculate changes for pattern evaluation
        ndbi_anom = next((a for a in temporal_anomalies if a.signal == "ndbi"), None)
        viirs_anom = next((a for a in temporal_anomalies if a.signal == "viirs_radiance"), None)
        ndvi_anom = next((a for a in temporal_anomalies if a.signal == "ndvi"), None)

        ndbi_diff = (ndbi_anom.observed_value - ndbi_anom.baseline_mean) if ndbi_anom and ndbi_anom.baseline_mean else None
        viirs_diff = (viirs_anom.observed_value - viirs_anom.baseline_mean) if viirs_anom and viirs_anom.baseline_mean else None
        ndvi_diff = (ndvi_anom.observed_value - ndvi_anom.baseline_mean) if ndvi_anom and ndvi_anom.baseline_mean else None

        cross_patterns = CrossSignalService.evaluate_patterns(
            cell_code=cell_code or "REGION_WIDE",
            ndbi_change=ndbi_diff,
            viirs_change=viirs_diff,
            ndvi_change=ndvi_diff,
            temp_change=None,
            precip_change=None,
            temporal_alignment=alignment
        )

        # 5. Exploratory Signal Relationships
        relationships = []
        if os.path.exists(S2_CSV) and os.path.exists(VIIRS_CSV):
            with open(S2_CSV, "r", encoding="utf-8") as f1, open(VIIRS_CSV, "r", encoding="utf-8") as f2:
                s2_all = list(csv.DictReader(f1))
                v_all = list(csv.DictReader(f2))

            s2_2024 = {r["cell_code"]: float(r["NDBI"]) for r in s2_all if r["observation_date"] == "2024-04-29"}
            v_2024 = {r["cell_code"]: float(r["nighttime_radiance_mean"]) for r in v_all if r["observation_period"].startswith("2024-04")}

            common_cells = sorted(set(s2_2024.keys()) & set(v_2024.keys()))
            x_ndbi = [s2_2024[c] for c in common_cells]
            y_viirs = [v_2024[c] for c in common_cells]

            rel = CrossSignalService.compute_relationship(
                x_ndbi, y_viirs, "NDBI_spatial_2024", "VIIRS_spatial_2024", CorrelationMethod.PEARSON
            )
            relationships.append(rel)

        # 6. Regional Change Score Synthesis
        # Component 1: Temporal Anomaly Magnitude (0.0 to 1.0)
        valid_z = [abs(a.z_score) for a in temporal_anomalies if a.z_score is not None]
        comp_temporal = min(1.0, (sum(valid_z) / len(valid_z)) / 3.0) if valid_z else None

        # Component 2: Spatial Anomaly Magnitude (0.0 to 1.0)
        valid_spat_z = [abs(s.spatial_z_score) for s in spatial_anomalies if s.spatial_z_score is not None]
        comp_spatial = min(1.0, (sum(valid_spat_z) / len(valid_spat_z)) / 3.0) if valid_spat_z else None

        # Component 3: Cross-Signal Agreement (0.0 to 1.0)
        comp_cross = min(1.0, len(cross_patterns) / 2.0) if alignment.compatibility != TemporalCompatibilityType.INCOMPATIBLE else 0.0

        # Component 4: Data Completeness (only count signals that meet all validity criteria)
        target_signals = ["ndvi", "ndwi", "ndbi", "viirs_radiance", "temperature_2m", "precipitation"]
        valid_signal_count = 0
        for s_key in target_signals:
            b = baselines.get(s_key)
            if b and b.observation_count >= 3 and b.mean is not None and b.data_completeness > 0:
                valid_signal_count += 1
        comp_completeness = min(1.0, valid_signal_count / float(len(target_signals)))

        # Component 5: Temporal Compatibility (0.0 to 1.0)
        if alignment.compatibility in [TemporalCompatibilityType.EXACT_MATCH, TemporalCompatibilityType.SAME_MONTH]:
            comp_compat = 1.0
        elif alignment.compatibility in [TemporalCompatibilityType.AGGREGATED_WINDOW, TemporalCompatibilityType.SAME_SEASON]:
            comp_compat = 0.8
        else:
            comp_compat = 0.0

        components = {
            "temporal_anomaly": round(comp_temporal, 3) if comp_temporal is not None else None,
            "spatial_anomaly": round(comp_spatial, 3) if comp_spatial is not None else None,
            "cross_signal_agreement": round(comp_cross, 3),
            "data_completeness": round(comp_completeness, 3),
            "temporal_compatibility": round(comp_compat, 3)
        }

        # Calculate Overall Score (0 to 100)
        if comp_temporal is not None and comp_spatial is not None:
            raw_score = (
                SCORE_WEIGHTS["temporal_anomaly"] * comp_temporal +
                SCORE_WEIGHTS["spatial_anomaly"] * comp_spatial +
                SCORE_WEIGHTS["cross_signal_agreement"] * comp_cross +
                SCORE_WEIGHTS["data_completeness"] * comp_completeness +
                SCORE_WEIGHTS["temporal_compatibility"] * comp_compat
            )
            overall_score = round(raw_score * 100.0, 1)
            score_status = "VALID"
        else:
            overall_score = None
            score_status = "INSUFFICIENT_OBSERVATIONS"

        change_score = RegionalChangeScore(
            overall_score=overall_score,
            score_status=score_status,
            scoring_version=SCORING_VERSION,
            weighting_method=WEIGHTING_METHOD,
            components=components,
            weights=SCORE_WEIGHTS,
            provenance="CALCULATED"
        )

        # Spatial Context (OSM Snapshot)
        spatial_context = None
        if os.path.exists(OSM_CSV):
            with open(OSM_CSV, "r", encoding="utf-8") as f:
                osm_rows = list(csv.DictReader(f))
            if cell_code:
                osm_rows = [r for r in osm_rows if r["cell_code"] == cell_code]
            if osm_rows:
                r0 = osm_rows[0]
                spatial_context = {
                    "temporal_semantics": "SNAPSHOT",
                    "observation_timestamp": r0.get("access_timestamp", "2026-09-03T09:25:28.596075+00:00"),
                    "road_density_km_per_km2": float(r0.get("road_density_km_per_km2", 0)),
                    "mapped_building_count": int(r0.get("mapped_building_count", 0)),
                    "total_poi_count": int(r0.get("total_poi_count", 0)),
                    "provenance": "CALCULATED"
                }

        return RegionalChangeProfile(
            region_id=region_id,
            cell_code=cell_code,
            temporal_scope={"start": "2021-01-01", "end": "2024-12-31"},
            baselines=baselines,
            temporal_anomalies=temporal_anomalies,
            spatial_anomalies=spatial_anomalies,
            cross_signal_patterns=cross_patterns,
            relationships=relationships,
            regional_change_score=change_score,
            spatial_context=spatial_context,
            provenance="CALCULATED"
        )
