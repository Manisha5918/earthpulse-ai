"""Regions and Spatial Grid Endpoints.
Connects directly to verified real datasets to return regional profiles.
Strict Provenance: Zero fabricated values.
"""

from typing import List, Dict, Any, Optional, Union
from datetime import date
from fastapi import APIRouter, HTTPException

from app.services.region_service import RegionService
from app.services.availability_engine import resolve_location
from app.services.orchestrator import MultiSignalOrchestrator
from app.schemas.analysis import LocationSpec, LocationType, SignalType

router = APIRouter()


@router.get("", response_model=List[Dict[str, Any]])
def list_regions():
    """List available administrative monitoring regions."""
    return RegionService.get_pilot_regions()


@router.get("/{region_id}")
def get_region_detail(region_id: Union[int, str]):
    """Retrieve metadata, spatial boundaries, and unified real-data profile for a specific region or cell."""
    reg_str = str(region_id).upper()

    # Case 1: Chennai Pilot Region
    if reg_str in ["1", "IN-TN-CHE", "CHENNAI"]:
        pilot_meta = RegionService.get_pilot_regions()[0]
        loc_spec = LocationSpec(type=LocationType.REGION, region_code="IN-TN-CHE")
        resolved = resolve_location(loc_spec)
        profile, provenance = MultiSignalOrchestrator.build_profile(
            resolved,
            date(2021, 1, 1),
            date(2024, 12, 31),
            [SignalType.SENTINEL2, SignalType.VIIRS, SignalType.NASA_POWER, SignalType.OSM]
        )
        return {
            **pilot_meta,
            "profile": profile.model_dump(),
            "provenance_chain": provenance
        }

    # Case 2: Individual Chennai Grid Cell
    if reg_str.startswith("CHE_G"):
        loc_spec = LocationSpec(type=LocationType.GRID_CELL, cell_code=reg_str)
        resolved = resolve_location(loc_spec)
        if not resolved.is_verified_pilot_extent:
            raise HTTPException(status_code=404, detail=f"Grid cell '{reg_str}' not found in Chennai pilot grid.")
        profile, provenance = MultiSignalOrchestrator.build_profile(
            resolved,
            date(2021, 1, 1),
            date(2024, 12, 31),
            [SignalType.SENTINEL2, SignalType.VIIRS, SignalType.NASA_POWER, SignalType.OSM]
        )
        return {
            "cell_code": reg_str,
            "region_code": "IN-TN-CHE",
            "bounding_box": resolved.bounding_box,
            "centroid": resolved.centroid,
            "profile": profile.model_dump(),
            "provenance_chain": provenance
        }

    raise HTTPException(status_code=404, detail=f"Region or grid cell '{region_id}' not found.")


@router.get("/{region_id}/grid")
def get_region_grid(region_id: Union[int, str]):
    """Get 0.05° analytical regular grid GeoJSON FeatureCollection."""
    reg_str = str(region_id).upper()
    if reg_str not in ["1", "IN-TN-CHE", "CHENNAI"]:
        raise HTTPException(status_code=404, detail="Grid only configured for Chennai Pilot (id=1, code=IN-TN-CHE)")
    return RegionService.get_region_grid("IN-TN-CHE")
