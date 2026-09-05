"""EarthPulse AI — Statistical Intelligence & Anomaly Detection Schemas.
Strict Provenance: Zero fabricated values.
"""

from enum import Enum
from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field


class TemporalCompatibilityType(str, Enum):
    EXACT_MATCH = "EXACT_MATCH"
    SAME_DAY = "SAME_DAY"
    SAME_MONTH = "SAME_MONTH"
    SAME_SEASON = "SAME_SEASON"
    AGGREGATED_WINDOW = "AGGREGATED_WINDOW"
    INCOMPATIBLE = "INCOMPATIBLE"


class AnomalySeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    NORMAL = "NORMAL"
    INSUFFICIENT_OBSERVATIONS = "INSUFFICIENT_OBSERVATIONS"


class CorrelationMethod(str, Enum):
    PEARSON = "PEARSON"
    SPEARMAN = "SPEARMAN"


class TemporalAlignmentResult(BaseModel):
    compatibility: TemporalCompatibilityType
    observations: List[Dict[str, Any]] = []
    window_description: str
    provenance: str = "CALCULATED"


class BaselineSummary(BaseModel):
    signal: str
    observation_count: int
    earliest_observation: Optional[str] = None
    latest_observation: Optional[str] = None
    mean: Optional[float] = None
    median: Optional[float] = None
    stddev: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    baseline_period: str
    temporal_semantics: str
    data_completeness: float
    confidence: str
    status: str = "CALCULATED"
    provenance: str = "CALCULATED"


class ChangeMetric(BaseModel):
    signal: str
    baseline_value: Optional[float] = None
    current_value: Optional[float] = None
    absolute_change: Optional[float] = None
    relative_change: Optional[float] = None
    observation_dates: Dict[str, str]
    data_sufficiency: str
    provenance: str = "CALCULATED"


class TemporalAnomaly(BaseModel):
    signal: str
    observation_date: str
    observed_value: float
    baseline_mean: Optional[float] = None
    baseline_median: Optional[float] = None
    z_score: Optional[float] = None
    robust_mad_score: Optional[float] = None
    severity: AnomalySeverity
    status: str
    confidence: str
    source_observation_ids: List[str] = []
    provenance: str = "CALCULATED"


class SpatialAnomaly(BaseModel):
    grid_id: int
    cell_code: str
    signal: str
    observation_period: str
    cell_value: float
    regional_mean: Optional[float] = None
    regional_median: Optional[float] = None
    regional_std: Optional[float] = None
    spatial_z_score: Optional[float] = None
    percentile_rank: Optional[float] = None
    is_spatial_outlier: bool = False
    eligible_cell_count: int = 0
    excluded_cell_count: int = 0
    provenance: str = "CALCULATED"


class CrossSignalPattern(BaseModel):
    pattern_type: str
    description: str
    supporting_signals: List[str]
    opposing_signals: List[str] = []
    evidence_count: int
    temporal_compatibility: TemporalCompatibilityType
    spatial_compatibility: str = "SAME_GRID_CELL"
    relationship_type: str = "CORRELATION"
    causal_claim: bool = False
    interpretation_status: str = "EVIDENCE_PATTERN_ONLY"
    confidence: str
    provenance: str = "CALCULATED"


class SignalRelationship(BaseModel):
    primary_signal: str
    secondary_signal: str
    method: CorrelationMethod
    correlation_coefficient: Optional[float] = None
    p_value: Optional[float] = None
    sample_size: int
    relationship_type: str = "CORRELATION"
    causal_claim: bool = False
    status: str
    confidence: str
    provenance: str = "CALCULATED"


class RegionalChangeScore(BaseModel):
    overall_score: Optional[float] = None
    score_status: str
    scoring_version: str = "phase6-v1"
    weighting_method: str = "EXPERT_CONFIGURED"
    components: Dict[str, Optional[float]] = {}
    weights: Dict[str, float] = {}
    provenance: str = "CALCULATED"


class RegionalChangeProfile(BaseModel):
    region_id: str
    cell_code: Optional[str] = None
    temporal_scope: Dict[str, str]
    baselines: Dict[str, BaselineSummary] = {}
    temporal_anomalies: List[TemporalAnomaly] = []
    spatial_anomalies: List[SpatialAnomaly] = []
    cross_signal_patterns: List[CrossSignalPattern] = []
    relationships: List[SignalRelationship] = []
    regional_change_score: RegionalChangeScore
    spatial_context: Optional[Dict[str, Any]] = None
    provenance: str = "CALCULATED"
