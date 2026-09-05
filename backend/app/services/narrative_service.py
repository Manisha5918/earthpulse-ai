"""EarthPulse AI — Narrative Intelligence Service.
Orchestrates evidence package construction, grounded narrative generation,
and deterministic validation pipelines.
Strict Provenance: Zero fabricated values.
"""

import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from app.schemas.analysis import (
    LocationSpec,
    LocationType,
    SignalType,
    AvailabilityStatus,
    ResolvedLocation
)
from app.schemas.narrative import (
    NarrativeRequest,
    NarrativeResponse,
    GroundedNarrative,
    EvidencePackage
)
from app.services.availability_engine import AvailabilityEngine
from app.services.change_profile_service import ChangeProfileService
from app.services.evidence_builder import EvidenceBuilder
from app.services.grounding_validator import GroundingValidator
from app.services.moe.orchestrator import run_moe
from app.services.template_narrative_generator import TemplateNarrativeGenerator


class NarrativeService:

    @classmethod
    def execute_narrative_analysis(
        cls,
        request: NarrativeRequest
    ) -> NarrativeResponse:
        """Execute unified evidence synthesis and generate grounded narrative briefing."""
        req_id = f"intel_{uuid.uuid4().hex[:12]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        # 1. Location & Data Availability Evaluation
        target_signals = request.signals or [
            SignalType.SENTINEL2,
            SignalType.VIIRS,
            SignalType.NASA_POWER,
            SignalType.OSM
        ]
        resolved, availabilities, overall_status = AvailabilityEngine.evaluate_request(
            request.location,
            request.start_date,
            request.end_date,
            target_signals
        )

        # Handle unverified locations (Zero Chennai data leakage)
        if not resolved.is_verified_pilot_extent:
            return NarrativeResponse(
                request_id=req_id,
                status=overall_status,
                created_at=now_iso,
                location=resolved,
                evidence_package_hash=None,
                narrative=None,
                regional_change_score=None,
                provenance_chain=[{
                    "step": "AVAILABILITY_CHECK",
                    "status": overall_status.value,
                    "notes": "Location outside verified pilot extent; narrative generation halted."
                }]
            )

        # 2. Build Phase 6 Change Profile
        cell_target = resolved.matched_cells[0] if len(resolved.matched_cells) == 1 else None
        reg_target = resolved.matched_region or "IN-TN-CHE"
        profile = ChangeProfileService.build_change_profile(
            region_id=reg_target,
            cell_code=cell_target
        )

        # 3. Build Immutable Evidence Package (unchanged Phase 7 input)
        package: EvidencePackage = EvidenceBuilder.build_package(profile, resolved)

        # 3b. Domain-routed expert reasoning (MoE). Reads the immutable
        # package and Phase 6 profile only; never recalculates statistics,
        # never alters the package, narrative, or grounding validation.
        moe_report = run_moe(
            profile,
            resolved,
            package,
            set(target_signals),
            availabilities,
        )

        # 4. Generate Grounded Narrative (Template Generator fallback pipeline)
        candidate_narrative = TemplateNarrativeGenerator.generate_grounded_narrative(package)

        # 5. Grounding Validation
        is_valid, violations = GroundingValidator.validate_narrative(candidate_narrative, package)
        if not is_valid:
            # Fallback re-generation & assertion
            candidate_narrative = TemplateNarrativeGenerator.generate_grounded_narrative(package)
            is_valid, violations = GroundingValidator.validate_narrative(candidate_narrative, package)
            if not is_valid:
                raise RuntimeError(f"Critical Grounding Validation Failure: {violations}")

        # 6. Provenance Chain
        provenance_chain = [
            {
                "step": "PHYSICAL_OBSERVATION_INGESTION",
                "sources": ["NASA_POWER", "SENTINEL_2", "VIIRS_DNB", "OPENSTREETMAP"],
                "provenance_type": "OBSERVED"
            },
            {
                "step": "STATISTICAL_CHANGE_BASELINING",
                "scoring_version": profile.regional_change_score.scoring_version,
                "provenance_type": "CALCULATED"
            },
            {
                "step": "EVIDENCE_PACKAGE_CONSTRUCTION",
                "package_id": package.package_id,
                "evidence_package_hash": package.evidence_package_hash,
                "provenance_type": "CALCULATED"
            },
            {
                "step": "GROUNDED_NARRATIVE_GENERATION",
                "generator_type": candidate_narrative.generator_type,
                "grounding_validated": True,
                "provenance_type": "AI_INTERPRETED"
            }
        ]

        return NarrativeResponse(
            request_id=req_id,
            status=overall_status,
            created_at=now_iso,
            location=resolved,
            evidence_package_hash=package.evidence_package_hash,
            narrative=candidate_narrative,
            regional_change_score=profile.regional_change_score,
            provenance_chain=provenance_chain,
            moe=moe_report.model_dump(),
        )
