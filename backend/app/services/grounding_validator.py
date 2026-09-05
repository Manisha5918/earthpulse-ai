"""EarthPulse AI — Claim-Level Grounding Validator.
Verifies that generated narrative claims strictly adhere to the EvidencePackage.
Enforces non-causal language, numerical exactness, and temporal semantics.
Strict Provenance: Zero fabricated values.
"""

import re
import math
from typing import List, Dict, Any, Tuple, Optional
from app.schemas.narrative import EvidencePackage, GroundedNarrative, KeyFinding


# Prohibited Causal / Mechanistic phrases
PROHIBITED_CAUSAL_PHRASES = [
    r"\bcaused\b",
    r"\bcausing\b",
    r"\bled to\b",
    r"\bdrove\b",
    r"\bdriving\b",
    r"\btriggered\b",
    r"\btriggering\b",
    r"\bresulted in\b",
    r"\bresulting in\b",
    r"\bdue to\b",
    r"\bbecause of\b",
    r"\bresponsible for\b",
    r"\bconsequence of\b",
    r"\bdirect effect of\b"
]

# Prohibited OSM trend words
PROHIBITED_OSM_TREND_PHRASES = [
    r"\bgrowth\b",
    r"\bgrew\b",
    r"\bincreased\b",
    r"\bincrease\b",
    r"\bincreasing\b",
    r"\bdecreased\b",
    r"\bdecrease\b",
    r"\bdeclined\b",
    r"\bdecline\b",
    r"\bdeclining\b",
    r"\btrended\b",
    r"\btrend\b",
    r"\bover time\b",
    r"\bfrom 2021 to 2024\b",
    r"\bacross 2021-2024\b"
]


def extract_numbers_from_text(text: str) -> List[float]:
    """Extract numeric values from text while ignoring dates, ISO timestamps, sensor names, and formatting commas."""
    # 1. Strip ISO timestamps e.g. 2026-09-03T09:25:28.596075+00:00
    cleaned = re.sub(r"\b\d{4}-\d{2}-\d{2}T[\d:\.+]+Z?\b", "", text)
    # 2. Strip date ranges and dates e.g. 2021-05-30 or 2021-01-01 to 2024-12-31
    cleaned = re.sub(r"\b\d{4}-\d{2}-\d{2}\b", "", cleaned)
    # 3. Strip year-month e.g. 2024-04
    cleaned = re.sub(r"\b\d{4}-\d{2}\b", "", cleaned)
    # 4. Strip standalone 4-digit years 2020..2030
    cleaned = re.sub(r"\b20[2-3]\d\b", "", cleaned)
    # 5. Strip sensor identifiers and units with numbers e.g. Sentinel-2, Sentinel-2A, km/km^2, m^2, cm^2, FIND-001, EVID-001
    cleaned = re.sub(r"\bSentinel-\d+[A-Z]?\b", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\b[A-Z]+-\d+\b", "", cleaned)  # EVID-001, FIND-001
    cleaned = re.sub(r"/\s*km\^?2", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"/\s*cm\^?2", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"/\s*m\^?2", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"km\^?2", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"m\^?2", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"cm\^?2", "", cleaned, flags=re.IGNORECASE)
    # 6. Remove commas between digits (e.g. 24,022 -> 24022)
    cleaned = re.sub(r"(\d),(\d)", r"\1\2", cleaned)

    # Now extract measurement numbers
    matches = re.findall(r"[-+]?\d*\.?\d+", cleaned)
    nums = []
    for m in matches:
        if m in ["", ".", "-", "+"]:
            continue
        try:
            val = float(m)
            nums.append(val)
        except ValueError:
            pass
    return nums


def is_number_grounded(num: float, allowed_values: List[float], tolerance: float = 1e-3) -> bool:
    """Check if a number matches any allowed evidence value within tolerance."""
    for allowed in allowed_values:
        if math.isclose(num, allowed, abs_tol=tolerance, rel_tol=1e-3):
            return True
        # Also check percentage vs ratio equivalence (e.g. 0.25 vs 25.0)
        if math.isclose(num, allowed * 100.0, abs_tol=0.1, rel_tol=1e-2):
            return True
        if math.isclose(num * 100.0, allowed, abs_tol=0.1, rel_tol=1e-2):
            return True
    return False


class GroundingValidator:

    @classmethod
    def validate_narrative(
        cls,
        narrative: GroundedNarrative,
        evidence_package: EvidencePackage
    ) -> Tuple[bool, List[str]]:
        """Validate candidate narrative against the immutable EvidencePackage.
        Returns (is_valid, list_of_violations).
        """
        violations: List[str] = []

        # 1. Verify Package Hash Match
        if narrative.evidence_package_hash != evidence_package.evidence_package_hash:
            violations.append(
                f"Evidence package hash mismatch: expected {evidence_package.evidence_package_hash}, got {narrative.evidence_package_hash}"
            )

        # Build list of all valid numbers in evidence package
        allowed_numbers: List[float] = [0.0]
        for item in evidence_package.evidence_items.values():
            allowed_numbers.append(item.canonical_value)
            if item.baseline_value is not None:
                allowed_numbers.append(item.baseline_value)
            if item.z_score is not None:
                allowed_numbers.append(item.z_score)

        # 2. Validate Headline & Executive Summary for Causal & Trend Violations
        full_intro = f"{narrative.headline} {narrative.executive_summary}".lower()

        for pat in PROHIBITED_CAUSAL_PHRASES:
            if re.search(pat, full_intro):
                violations.append(f"Prohibited causal/mechanistic phrasing detected in summary: pattern '{pat}'")

        # 3. Validate Individual Key Findings
        if not narrative.key_findings:
            violations.append("Narrative contains zero key findings.")

        for finding in narrative.key_findings:
            stmt = finding.statement
            stmt_lower = stmt.lower()

            # A. Check Evidence IDs exist
            if not finding.evidence_ids:
                violations.append(f"Finding '{finding.finding_id}' has empty evidence_ids.")
                continue

            referenced_items = []
            for eid in finding.evidence_ids:
                if eid not in evidence_package.evidence_items:
                    violations.append(f"Finding '{finding.finding_id}' references unknown evidence ID '{eid}'.")
                else:
                    referenced_items.append(evidence_package.evidence_items[eid])

            if not referenced_items:
                continue

            # B. Check for Prohibited Causal Language
            for pat in PROHIBITED_CAUSAL_PHRASES:
                if re.search(pat, stmt_lower):
                    violations.append(
                        f"Prohibited causal language in finding '{finding.finding_id}': pattern '{pat}'"
                    )

            # C. Check OSM Temporal Safety
            is_osm_finding = any("openstreetmap" in item.source_dataset.lower() or item.temporal_semantics == "SNAPSHOT" for item in referenced_items)
            if is_osm_finding:
                for pat in PROHIBITED_OSM_TREND_PHRASES:
                    if re.search(pat, stmt_lower):
                        violations.append(
                            f"OSM snapshot metric in finding '{finding.finding_id}' improperly described with trend language: pattern '{pat}'"
                        )

            # D. Claim-Level Numerical Grounding
            numbers_in_stmt = extract_numbers_from_text(stmt)
            allowed_for_finding: List[float] = [0.0]
            for item in referenced_items:
                allowed_for_finding.append(item.canonical_value)
                if item.baseline_value is not None:
                    allowed_for_finding.append(item.baseline_value)
                if item.z_score is not None:
                    allowed_for_finding.append(item.z_score)

            for num in numbers_in_stmt:
                if not is_number_grounded(num, allowed_for_finding):
                    # Check if it exists in the broader package or is ungrounded
                    if is_number_grounded(num, allowed_numbers):
                        violations.append(
                            f"Number {num} in finding '{finding.finding_id}' is not supported by its referenced evidence IDs {finding.evidence_ids}."
                        )
                    else:
                        violations.append(
                            f"Ungrounded/hallucinated number {num} in finding '{finding.finding_id}' does not exist in EvidencePackage."
                        )

        # 4. Validate Mandatory Disclosures
        limitations_lower = narrative.uncertainty_and_limitations.lower()
        if "viirs" in limitations_lower and "annual baseline" not in limitations_lower:
            violations.append("Uncertainty disclosures must explicitly state VIIRS represents annual baseline observations.")
        if "openstreetmap" in limitations_lower and "snapshot" not in limitations_lower:
            violations.append("Uncertainty disclosures must explicitly state OpenStreetMap represents a static spatial snapshot.")

        is_valid = len(violations) == 0
        return is_valid, violations
