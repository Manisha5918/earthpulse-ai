"""EarthPulse AI — Temporal Alignment Service.
Evaluates temporal compatibility across multi-sensor observations before cross-signal reasoning.
Strict Provenance: Zero fabricated values.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, date
from app.schemas.intelligence import TemporalCompatibilityType, TemporalAlignmentResult


def extract_year_month(date_str: str) -> Optional[str]:
    """Extract YYYY-MM from date string (e.g. 2024-04-29 or 2024-04-01/2024-04-30 or 2024-04)."""
    if not date_str:
        return None
    cleaned = date_str.split("/")[0].strip()
    parts = cleaned.split("-")
    if len(parts) >= 2:
        return f"{parts[0]}-{parts[1]}"
    return None


def get_season(month: int) -> str:
    """Classify month into standard Indian meteorological seasons."""
    if month in [3, 4, 5]:
        return "PRE_MONSOON_SUMMER"
    elif month in [6, 7, 8, 9]:
        return "SOUTHWEST_MONSOON"
    elif month in [10, 11, 12]:
        return "NORTHEAST_MONSOON"
    else:
        return "WINTER"


class TemporalAlignmentService:

    @classmethod
    def evaluate_compatibility(
        cls,
        observations: List[Dict[str, Any]]
    ) -> TemporalAlignmentResult:
        """Evaluate temporal compatibility across heterogeneous observation timestamps."""
        if not observations:
            return TemporalAlignmentResult(
                compatibility=TemporalCompatibilityType.INCOMPATIBLE,
                observations=[],
                window_description="No observations provided for alignment.",
                provenance="CALCULATED"
            )

        if len(observations) == 1:
            return TemporalAlignmentResult(
                compatibility=TemporalCompatibilityType.EXACT_MATCH,
                observations=observations,
                window_description="Single observation source.",
                provenance="CALCULATED"
            )

        # Extract dates and months
        exact_dates = set()
        year_months = set()
        seasons = set()

        for obs in observations:
            # Handle date or start/end
            d_str = obs.get("date") or obs.get("start") or obs.get("observation_date") or obs.get("observation_period")
            if d_str:
                exact_dates.add(str(d_str).split("/")[0])
                ym = extract_year_month(str(d_str))
                if ym:
                    year_months.add(ym)
                    try:
                        m = int(ym.split("-")[1])
                        seasons.add((ym.split("-")[0], get_season(m)))
                    except Exception:
                        pass

        # Check classifications
        if len(exact_dates) == 1:
            compat = TemporalCompatibilityType.EXACT_MATCH
            desc = f"All {len(observations)} sources observed on exact same date: {list(exact_dates)[0]}"
        elif len(year_months) == 1:
            compat = TemporalCompatibilityType.SAME_MONTH
            desc = f"All {len(observations)} sources observed in the same calendar month: {list(year_months)[0]}"
        elif len(seasons) == 1:
            compat = TemporalCompatibilityType.SAME_SEASON
            desc = f"All {len(observations)} sources observed in the same seasonal window: {list(seasons)[0][1]} ({list(seasons)[0][0]})"
        else:
            # Check if all are annual April baseline composites
            months = [ym.split("-")[1] for ym in year_months if ym and len(ym.split("-")) == 2]
            if months and all(m == "04" for m in months):
                compat = TemporalCompatibilityType.AGGREGATED_WINDOW
                desc = "Annual April baseline observations across multiple years."
            else:
                compat = TemporalCompatibilityType.INCOMPATIBLE
                desc = f"Temporal discrepancy across sources: months span {sorted(list(year_months))}"

        return TemporalAlignmentResult(
            compatibility=compat,
            observations=observations,
            window_description=desc,
            provenance="CALCULATED"
        )
