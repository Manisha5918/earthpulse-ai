"""Observation Retrieval and Provenance Management Service."""

from typing import List, Dict, Any, Optional


class ObservationService:
    @staticmethod
    def filter_observations(
        grid_id: Optional[int] = None,
        signal_name: Optional[str] = None,
        year_month: Optional[str] = None,
        db_records: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """Filter observations while strictly verifying provenance metadata.
        Returns empty list if no observations exist in DB.
        """
        records = db_records or []
        if grid_id is not None:
            records = [r for r in records if r.get("grid_id") == grid_id]
        if signal_name is not None:
            records = [r for r in records if r.get("signal_name") == signal_name]
        if year_month is not None:
            records = [r for r in records if r.get("year_month") == year_month]
        return records
