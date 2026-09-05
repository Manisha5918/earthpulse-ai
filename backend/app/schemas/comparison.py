from typing import Optional, Dict, Any
from pydantic import BaseModel


class ComparisonRequest(BaseModel):
    grid_id_a: int
    grid_id_b: Optional[int] = None
    time_window_a: str  # 'YYYY-MM'
    time_window_b: str  # 'YYYY-MM'


class MetricDelta(BaseModel):
    signal: str
    value_a: Optional[float] = None
    value_b: Optional[float] = None
    delta_absolute: Optional[float] = None
    delta_percent: Optional[float] = None


class ComparisonResponse(BaseModel):
    entity_a: str
    entity_b: str
    time_a: str
    time_b: str
    metrics: Dict[str, MetricDelta]
    provenance_type: str
