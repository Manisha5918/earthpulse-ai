"""EarthPulse AI — Unified Analysis & Orchestration Schemas.
Strict Provenance: Zero fabricated values.
"""

from enum import Enum
from typing import List, Dict, Any, Optional, Union
from datetime import date, datetime
from pydantic import BaseModel, Field, validator


class LocationType(str, Enum):
    REGION = "region"
    GRID_CELL = "grid_cell"
    BBOX = "bbox"
    POINT = "point"


class SignalType(str, Enum):
    SENTINEL2 = "sentinel2"
    VIIRS = "viirs"
    NASA_POWER = "nasa_power"
    OSM = "osm"


class AvailabilityStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    PARTIAL_DATA = "PARTIAL_DATA"
    PROCESSING_REQUIRED = "PROCESSING_REQUIRED"
    INSUFFICIENT_OBSERVATIONS = "INSUFFICIENT_OBSERVATIONS"
    DATA_UNAVAILABLE = "DATA_UNAVAILABLE"


class JobState(str, Enum):
    QUEUED = "QUEUED"
    RETRIEVING_DATA = "RETRIEVING_DATA"
    PROCESSING = "PROCESSING"
    CALCULATING = "CALCULATING"
    COMPLETED = "COMPLETED"
    PARTIAL = "PARTIAL"
    FAILED = "FAILED"


class LocationSpec(BaseModel):
    type: LocationType = Field(..., description="Location specification type: region, grid_cell, bbox, or point")
    region_code: Optional[str] = Field(None, description="Administrative region code, e.g. IN-TN-CHE")
    cell_code: Optional[str] = Field(None, description="Grid cell identifier, e.g. CHE_G001 to CHE_G016")
    coordinates: Optional[Union[List[float], Dict[str, float]]] = Field(
        None,
        description="Coordinates: [min_lat, min_lon, max_lat, max_lon] for bbox, or [lat, lon] / {'lat': x, 'lon': y} for point"
    )

    @validator("coordinates")
    def validate_coordinates(cls, v, values):
        ltype = values.get("type")
        if ltype == LocationType.BBOX:
            if not isinstance(v, list) or len(v) != 4:
                raise ValueError("BBOX coordinates must be a 4-element list: [min_lat, min_lon, max_lat, max_lon]")
            min_lat, min_lon, max_lat, max_lon = v
            if not (-90 <= min_lat <= max_lat <= 90 and -180 <= min_lon <= max_lon <= 180):
                raise ValueError("Invalid latitude or longitude values in BBOX")
        elif ltype == LocationType.POINT:
            if isinstance(v, list):
                if len(v) != 2:
                    raise ValueError("Point coordinates must be a 2-element list [lat, lon]")
                lat, lon = v
            elif isinstance(v, dict):
                if "lat" not in v or "lon" not in v:
                    raise ValueError("Point dictionary must have 'lat' and 'lon' keys")
                lat, lon = v["lat"], v["lon"]
            else:
                raise ValueError("Point coordinates must be a list [lat, lon] or dict {'lat': x, 'lon': y}")
            if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                raise ValueError("Point latitude or longitude out of physical bounds [-90, 90], [-180, 180]")
        return v


class AnalysisRequest(BaseModel):
    location: LocationSpec = Field(..., description="Target geographic entity or coordinates")
    start_date: date = Field(..., description="Start of analysis time range (YYYY-MM-DD)")
    end_date: date = Field(..., description="End of analysis time range (YYYY-MM-DD)")
    signals: List[SignalType] = Field(
        default=[SignalType.SENTINEL2, SignalType.VIIRS, SignalType.NASA_POWER, SignalType.OSM],
        description="List of requested real Earth Observation / spatial signals"
    )
    resolution: Optional[str] = Field(default="0.05deg", description="Spatial resolution (e.g. 0.05deg, auto)")

    @validator("end_date")
    def validate_date_order(cls, v, values):
        if "start_date" in values and v < values["start_date"]:
            raise ValueError("end_date must be greater than or equal to start_date")
        return v


class SignalAvailability(BaseModel):
    signal: SignalType
    status: AvailabilityStatus
    requested_period: Dict[str, str]
    actual_available_period: Optional[Union[Dict[str, str], List[str]]] = None
    spatial_coverage: str
    native_spatial_resolution: str
    temporal_resolution: str
    temporal_semantics: str = Field("CONTINUOUS_OBSERVATIONS", description="CONTINUOUS_OBSERVATIONS, ANNUAL_BASELINE, or SNAPSHOT")
    provenance_type: str
    source_name: str
    source_url: str
    notes: Optional[str] = None


class ResolvedLocation(BaseModel):
    location_type: LocationType
    matched_region: Optional[str] = None
    matched_cells: List[str] = []
    bounding_box: List[float]
    centroid: Dict[str, float]
    is_verified_pilot_extent: bool = False


class Sentinel2Observation(BaseModel):
    scene_id: str
    observation_date: str
    mean_ndvi: Optional[float] = None
    mean_ndwi: Optional[float] = None
    mean_ndbi: Optional[float] = None
    cloud_cover_percent: float
    valid_pixel_percentage: float
    provenance: str = "CALCULATED"


class VIIRSObservation(BaseModel):
    period: str
    composite_type: str = "MONTHLY_CLOUD_FREE_STRAY_LIGHT_CORRECTED"
    mean_radiance: Optional[float] = None
    median_radiance: Optional[float] = None
    max_radiance: Optional[float] = None
    std_radiance: Optional[float] = None
    unit: str = "nW/(cm^2*sr)"
    provenance: str = "CALCULATED"


class NASAPowerSummary(BaseModel):
    start_date: str
    end_date: str
    observation_count: int
    mean_temperature_c: float
    min_temperature_c: float
    max_temperature_c: float
    total_precipitation_mm: float
    mean_daily_precipitation_mm: float
    provenance: str = "OBSERVED"


class OSMContextSummary(BaseModel):
    observation_timestamp: str
    temporal_semantics: str = "SNAPSHOT"
    total_road_length_km: float
    road_density_km_per_km2: float
    road_classes_km: Dict[str, float]
    mapped_building_count: int
    estimated_building_area_km2: float
    estimated_building_coverage_percent: float
    calibration_footprint_m2: float
    poi_counts: Dict[str, int]
    provenance: str = "CALCULATED"


class UnifiedRegionProfile(BaseModel):
    sentinel2: Optional[List[Sentinel2Observation]] = None
    viirs: Optional[List[VIIRSObservation]] = None
    nasa_power: Optional[NASAPowerSummary] = None
    osm: Optional[OSMContextSummary] = None


class AnalysisResponse(BaseModel):
    request_id: str
    job_id: Optional[str] = None
    status: AvailabilityStatus
    created_at: datetime
    location: ResolvedLocation
    signal_availability: Dict[str, SignalAvailability]
    profile: Optional[UnifiedRegionProfile] = None
    temporal_alignment_disclosure: str = Field(
        ...,
        description="Explicit disclosure explaining native cadences and why measurements are not falsely synced."
    )
    cache_hit: bool = False
    provenance_chain: List[Dict[str, Any]] = []


class JobStatusResponse(BaseModel):
    job_id: str
    status: JobState
    progress_pct: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    current_step: str
    logs: List[str] = []
    error: Optional[str] = None
    result: Optional[AnalysisResponse] = None
