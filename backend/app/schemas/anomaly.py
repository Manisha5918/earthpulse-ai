from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AnomalyResponse(BaseModel):
    id: int
    grid_id: int
    year_month: str
    signal_name: str
    observed_value: float
    baseline_mean: float
    baseline_std: float
    z_score: float
    severity: str
    anomaly_type: str
    detected_at: datetime

    class Config:
        from_attributes = True


class SignalRelationshipResponse(BaseModel):
    id: int
    grid_id: int
    primary_signal: str
    secondary_signal: str
    correlation_coefficient: float
    lag_months: int
    p_value: Optional[float] = None
    relationship_type: Optional[str] = None
    sample_size: int

    class Config:
        from_attributes = True
