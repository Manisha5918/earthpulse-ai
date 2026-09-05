from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.schemas.provenance import ProvenanceType


class CitedEvidence(BaseModel):
    signal_name: str
    observed_value: float
    baseline_value: float
    z_score: float
    unit: str
    timestamp: str


class AIInsightResponse(BaseModel):
    id: int
    region_id: int
    grid_id: Optional[int] = None
    year_month: str
    title: str
    summary: str
    detailed_explanation: str
    evidence_json: List[Dict[str, Any]]
    confidence_score: float
    model_name: str
    provenance_type: ProvenanceType
    created_at: datetime

    class Config:
        from_attributes = True
