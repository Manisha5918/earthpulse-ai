"""EarthPulse AI — Mathematical Change Calculation Service.
Calculates absolute and relative change with strict zero-division protection.
Strict Provenance: Zero fabricated values.
"""

from typing import Optional, Dict
from app.schemas.intelligence import ChangeMetric


class ChangeService:

    @staticmethod
    def calculate_change(
        signal: str,
        baseline_value: Optional[float],
        current_value: Optional[float],
        baseline_date: str,
        current_date: str
    ) -> ChangeMetric:
        """Calculate absolute and relative change between two observation points."""
        if baseline_value is None or current_value is None:
            return ChangeMetric(
                signal=signal,
                baseline_value=baseline_value,
                current_value=current_value,
                absolute_change=None,
                relative_change=None,
                observation_dates={"baseline": baseline_date, "current": current_date},
                data_sufficiency="INSUFFICIENT_OBSERVATIONS",
                provenance="CALCULATED"
            )

        abs_change = round(current_value - baseline_value, 4)

        # Zero baseline protection
        if abs(baseline_value) < 1e-6:
            rel_change = None
            sufficiency = "VALID_ABSOLUTE_ONLY_ZERO_BASELINE"
        else:
            rel_change = round((current_value - baseline_value) / abs(baseline_value), 4)
            sufficiency = "VALID"

        return ChangeMetric(
            signal=signal,
            baseline_value=baseline_value,
            current_value=current_value,
            absolute_change=abs_change,
            relative_change=rel_change,
            observation_dates={"baseline": baseline_date, "current": current_date},
            data_sufficiency=sufficiency,
            provenance="CALCULATED"
        )
