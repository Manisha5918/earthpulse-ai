from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.provenance import ProvenanceType


class RegionalFeatureResponse(BaseModel):
    id: int
    grid_id: int
    year_month: str
    timestamp: datetime
    ndvi: Optional[float] = None
    ndwi: Optional[float] = None
    ndbi: Optional[float] = None
    night_light: Optional[float] = None
    temp_celsius: Optional[float] = None
    rainfall_mm: Optional[float] = None
    built_up_pct: Optional[float] = None
    provenance_type: ProvenanceType

    class Config:
        from_attributes = True


class GridFeatureSummary(BaseModel):
    cell_code: str
    center_lat: float
    center_lon: float
    year_month: str
    ndvi: Optional[float] = None
    ndwi: Optional[float] = None
    temp_celsius: Optional[float] = None
    rainfall_mm: Optional[float] = None
    night_light: Optional[float] = None
    built_up_pct: Optional[float] = None
    provenance_type: ProvenanceType
