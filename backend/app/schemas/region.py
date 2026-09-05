from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class GridCellResponse(BaseModel):
    id: int
    cell_code: str
    region_id: int
    center_lat: float
    center_lon: float
    area_sqkm: float
    resolution_deg: float
    geometry: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class RegionResponse(BaseModel):
    id: int
    code: str
    name: str
    state: str
    country: str
    admin_level: str
    area_sqkm: Optional[float] = None
    centroid: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class RegionDetailResponse(RegionResponse):
    grid_cells_count: int = 0
    available_time_range: List[str] = []
    metadata_json: Dict[str, Any] = {}
