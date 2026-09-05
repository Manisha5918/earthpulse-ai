from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ProvenanceType(str, Enum):
    OBSERVED = "OBSERVED"
    CALCULATED = "CALCULATED"
    AI_INTERPRETED = "AI_INTERPRETED"
    SYNTHETIC_DEMO = "SYNTHETIC_DEMO"


class ProvenanceMetadata(BaseModel):
    provenance_type: ProvenanceType = Field(..., description="Data tier: OBSERVED, CALCULATED, AI_INTERPRETED, or SYNTHETIC_DEMO")
    source_name: Optional[str] = Field(None, description="Data provider name, e.g. NASA POWER, ESA Sentinel-2")
    source_url: Optional[str] = Field(None, description="Direct URL or endpoint where observation was fetched")
    dataset_id: Optional[str] = Field(None, description="Catalog dataset identifier")
    acquisition_timestamp: Optional[datetime] = Field(None, description="Sensor recording timestamp")
    processing_timestamp: Optional[datetime] = Field(None, description="Timestamp when record was preprocessed")
    spatial_resolution: Optional[str] = Field(None, description="Resolution, e.g. 0.05 deg, 10m")
    temporal_resolution: Optional[str] = Field(None, description="Cadence, e.g. monthly, daily")
