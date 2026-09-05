"""EarthPulse AI — Statistical Intelligence & Change Detection Router.
"AI that reveals how India is changing."
Strict Provenance: Zero fabricated values.
"""

from typing import Dict, Any, List, Optional, Union
from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.intelligence import (
    BaselineSummary,
    TemporalAnomaly,
    SpatialAnomaly,
    SignalRelationship,
    RegionalChangeProfile
)
from app.services.baseline_service import BaselineService
from app.services.anomaly_service import AnomalyService
from app.services.cross_signal_service import CrossSignalService
from app.services.change_profile_service import ChangeProfileService

router = APIRouter()


@router.get("/{region_id}/baselines", summary="Get Historical Temporal Baselines")
def get_region_baselines(region_id: Union[int, str]):
    """Retrieve statistical baselines across all observation signals for a region or grid cell."""
    reg_str = str(region_id).upper()
    cell_code = reg_str if reg_str.startswith("CHE_G") else None

    if reg_str not in ["1", "IN-TN-CHE", "CHENNAI"] and not reg_str.startswith("CHE_G"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Region or grid cell '{region_id}' not found."
        )

    baselines = BaselineService.get_all_baselines(cell_code=cell_code)
    return {
        "region_id": "IN-TN-CHE",
        "cell_code": cell_code,
        "baselines": baselines,
        "provenance": "CALCULATED"
    }


@router.get("/{region_id}/anomalies", summary="Get Temporal and Spatial Anomalies")
def get_region_anomalies(region_id: Union[int, str]):
    """Retrieve temporal and spatial anomaly scores for a region or grid cell."""
    reg_str = str(region_id).upper()
    cell_code = reg_str if reg_str.startswith("CHE_G") else None

    if reg_str not in ["1", "IN-TN-CHE", "CHENNAI"] and not reg_str.startswith("CHE_G"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Region or grid cell '{region_id}' not found."
        )

    profile = ChangeProfileService.build_change_profile(
        region_id="IN-TN-CHE",
        cell_code=cell_code
    )
    return {
        "region_id": "IN-TN-CHE",
        "cell_code": cell_code,
        "temporal_anomalies": profile.temporal_anomalies,
        "spatial_anomalies": profile.spatial_anomalies,
        "provenance": "CALCULATED"
    }


@router.get("/{region_id}/relationships", summary="Get Cross-Signal Relationships")
def get_region_relationships(region_id: Union[int, str]):
    """Retrieve exploratory correlation relationships between co-occurring signals."""
    reg_str = str(region_id).upper()
    cell_code = reg_str if reg_str.startswith("CHE_G") else None

    if reg_str not in ["1", "IN-TN-CHE", "CHENNAI"] and not reg_str.startswith("CHE_G"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Region or grid cell '{region_id}' not found."
        )

    profile = ChangeProfileService.build_change_profile(
        region_id="IN-TN-CHE",
        cell_code=cell_code
    )
    return {
        "region_id": "IN-TN-CHE",
        "cell_code": cell_code,
        "relationships": profile.relationships,
        "provenance": "CALCULATED"
    }


@router.get("/{region_id}/change-profile", response_model=RegionalChangeProfile, summary="Get Full Regional Change Profile")
def get_region_change_profile(region_id: Union[int, str]):
    """Retrieve unified statistical change profile including baselines, anomalies, cross-signal patterns, and Regional Change Score."""
    reg_str = str(region_id).upper()
    cell_code = reg_str if reg_str.startswith("CHE_G") else None

    if reg_str not in ["1", "IN-TN-CHE", "CHENNAI"] and not reg_str.startswith("CHE_G"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Region or grid cell '{region_id}' not found."
        )

    return ChangeProfileService.build_change_profile(
        region_id="IN-TN-CHE",
        cell_code=cell_code
    )
