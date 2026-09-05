"""EarthPulse AI — Mixture-of-Experts intelligence models.

Domain-routed expert reasoning over existing Phase 6 evidence. Experts never
recalculate statistics and never invent values: every finding cites evidence
IDs from the (untouched) EvidencePackage.
Strict Provenance: Zero fabricated values.
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


MOE_VERSION = "moe-v1"


class ExpertId(str, Enum):
    VEGETATION = "vegetation_intelligence"
    URBAN = "urban_dynamics"
    CLIMATE = "climate_context"
    SPATIAL = "spatial_intelligence"
    CROSS_SIGNAL = "cross_signal_reasoning"


class ExpertStatus(str, Enum):
    READY = "READY"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    NOT_APPLICABLE = "NOT_APPLICABLE"
    NO_RELEVANT_SIGNAL = "NO_RELEVANT_SIGNAL"


class RelevanceLevel(str, Enum):
    HIGH = "HIGH"
    MODERATE = "MODERATE"
    LOW = "LOW"
    INACTIVE = "INACTIVE"


class RoutingComponentScores(BaseModel):
    """Transparent breakdown of the evidence-aware routing score (0.0-1.0 each)."""

    signal_relevance: float = 0.0
    evidence_availability: float = 0.0
    anomaly_strength: float = 0.0
    temporal_compatibility: float = 0.0
    data_completeness: float = 0.0
    composite_score: float = 0.0


class RoutingDecision(BaseModel):
    expert: ExpertId
    relevance: RelevanceLevel
    score: RoutingComponentScores
    reasons: List[str] = []
    suggested_status: ExpertStatus = ExpertStatus.READY


class ExpertFinding(BaseModel):
    """Single observational statement. Numbers must match cited evidence exactly."""

    statement: str
    evidence_ids: List[str] = []
    confidence: str = "LIMITED"
    temporal_semantics: str = "CALCULATED"


class ExpertOutput(BaseModel):
    expert: ExpertId
    display_name: str
    status: ExpertStatus
    relevance: RelevanceLevel = RelevanceLevel.INACTIVE
    plain_summary: str
    findings: List[ExpertFinding] = []
    evidence_ids: List[str] = []
    conflicting_evidence_ids: List[str] = []
    confidence: str = "LIMITED"
    limitations: List[str] = []
    provenance: str = "CALCULATED"


class CrossSignalReasoning(BaseModel):
    combined: bool
    supporting_evidence_ids: List[str] = []
    conflicting_evidence_ids: List[str] = []
    temporal_compatibility: str = "UNKNOWN"
    relationship_type: str = "CORRELATION"
    causal_claim: bool = False
    participating_experts: List[ExpertId] = []
    note: str = ""


class InactiveExpert(BaseModel):
    expert: ExpertId
    display_name: str
    status: ExpertStatus
    reason: str


class ObservedSignalStrength(BaseModel):
    """Separate from expert coverage: how strong the detected deviations are."""

    level: str = "NOMINAL"
    strongest_severity: str = "NOMINAL"
    statement: str = "No strong anomaly detected in the current pilot evidence."


class MoEReport(BaseModel):
    """Structured output of domain-routed expert reasoning for one investigation."""

    moe_version: str = MOE_VERSION
    region_id: str
    cell_code: Optional[str] = None
    status: str = "COMPLETE"
    evidence_package_hash: str
    routing_summary: List[RoutingDecision] = []
    active_experts: List[ExpertId] = []
    inactive_experts: List[InactiveExpert] = []
    expert_outputs: List[ExpertOutput] = []
    cross_signal_reasoning: Optional[CrossSignalReasoning] = None
    observed_signal_strength: ObservedSignalStrength = ObservedSignalStrength()
    provenance: str = "CALCULATED"
