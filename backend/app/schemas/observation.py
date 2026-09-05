from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.provenance import ProvenanceType


class ObservationCreate(BaseModel):
    grid_id: int
    dataset_id: str
    signal_name: str
    signal_value: float
    unit: str
    acquisition_timestamp: datetime
    cloud_cover_pct: Optional[float] = None
    quality_flag: str = "GOOD"
    provenance_type: ProvenanceType = ProvenanceType.OBSERVED
    metadata_json: Dict[str, Any] = {}


class ObservationResponse(BaseModel):
    id: int
    grid_id: int
    dataset_id: str
    signal_name: str
    signal_value: float
    unit: str
    acquisition_timestamp: datetime
    processing_timestamp: Optional[datetime] = None
    cloud_cover_pct: Optional[float] = None
    quality_flag: str
    provenance_type: ProvenanceType
    metadata_json: Dict[str, Any] = {}

    class Config:
        from_attributes = True
