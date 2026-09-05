"""EarthPulse AI — Narrative Intelligence & Grounding Schemas.
Strict Provenance: Zero fabricated values.
Frozen immutable evidence package and claim-level grounding models.
"""

from enum import Enum
from typing import List, Dict, Any, Optional, Union
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.analysis import LocationSpec, ResolvedLocation, SignalType, AvailabilityStatus
from app.schemas.intelligence import RegionalChangeScore, TemporalCompatibilityType


class NarrativeMode(str, Enum):
    EXECUTIVE_BRIEFING = "EXECUTIVE_BRIEFING"
    DETAILED_SCIENTIFIC = "DETAILED_SCIENTIFIC"
    SECTORAL_IMPACT = "SECTORAL_IMPACT"


class EvidenceItem(BaseModel):
    """Immutable single atomic piece of evidence derived from Phase 6 profile."""
    model_config = ConfigDict(frozen=True)

    evidence_id: str
    source_dataset: str
    metric_name: str
    canonical_value: float
    unit: str
    observation_period: str
    temporal_semantics: str
    baseline_value: Optional[float] = None
    z_score: Optional[float] = None
    severity: Optional[str] = None
    confidence: str
    provenance_type: str = "CALCULATED"
    description: str


class EvidencePackage(BaseModel):
    """Immutable, deterministic package of verified evidence provided to the narrative generator."""
    model_config = ConfigDict(frozen=True)

    package_id: str
    evidence_package_hash: str
    created_at: str
    region_id: str
    cell_code: Optional[str] = None
    temporal_scope: Dict[str, str]
    location_summary: Dict[str, Any]
    evidence_items: Dict[str, EvidenceItem]
    cross_signal_findings: List[Dict[str, Any]] = []
    relationships: List[Dict[str, Any]] = []
    spatial_context: Optional[Dict[str, Any]] = None
    mandatory_disclosures: List[str]
    prohibited_claims: List[str]
    provenance_type: str = "CALCULATED"


class KeyFinding(BaseModel):
    """Individual grounded factual claim with explicit evidence citations."""
    finding_id: str
    statement: str
    evidence_ids: List[str]
    confidence: str
    temporal_semantics: str


class EvidenceCitation(BaseModel):
    """Detailed provenance citation backing a finding."""
    evidence_id: str
    source_dataset: str
    metric: str
    canonical_value: float
    unit: str
    observation_period: str
    temporal_semantics: str
    calculation: str
    confidence: str
    provenance_type: str = "CALCULATED"


class GroundedNarrative(BaseModel):
    """Structured narrative output grounded strictly in the EvidencePackage."""
    headline: str
    executive_summary: str
    key_findings: List[KeyFinding]
    evidence_citations: Dict[str, EvidenceCitation]
    uncertainty_and_limitations: str
    evidence_package_hash: str
    generator_type: str = "DETERMINISTIC_TEMPLATE_FALLBACK"
    provenance_type: str = "AI_INTERPRETED"


class NarrativeRequest(BaseModel):
    """Request payload for Phase 7 narrative intelligence."""
    location: LocationSpec
    start_date: date = Field(default_factory=lambda: date(2021, 1, 1))
    end_date: date = Field(default_factory=lambda: date(2024, 12, 31))
    signals: Optional[List[SignalType]] = None
    narrative_mode: NarrativeMode = NarrativeMode.EXECUTIVE_BRIEFING
    async_mode: bool = False


class NarrativeResponse(BaseModel):
    """Unified response payload for Phase 7 narrative intelligence."""
    request_id: str
    status: AvailabilityStatus
    created_at: str
    location: ResolvedLocation
    evidence_package_hash: Optional[str] = None
    narrative: Optional[GroundedNarrative] = None
    regional_change_score: Optional[RegionalChangeScore] = None
    provenance_chain: List[Dict[str, Any]] = []
    # Optional domain-routed expert reasoning (MoE). Absent (None) for
    # unverified locations; never affects narrative grounding or hashes.
    moe: Optional[Dict[str, Any]] = None
