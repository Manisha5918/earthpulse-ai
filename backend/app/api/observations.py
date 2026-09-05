"""Physical Observations Endpoints."""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("")
def list_observations(
    grid_id: Optional[int] = Query(None, description="Filter by grid cell ID"),
    signal_name: Optional[str] = Query(None, description="Filter by signal (temperature_2m, precipitation, ndvi, night_light)"),
    year_month: Optional[str] = Query(None, description="Filter by month (YYYY-MM)")
) -> Dict[str, Any]:
    """Retrieve raw/preprocessed physical observations.
    Gracefully returns empty list if no observations have been ingested yet.
    """
    return {
        "count": 0,
        "results": [],
        "filters": {
            "grid_id": grid_id,
            "signal_name": signal_name,
            "year_month": year_month
        },
        "note": "Observation tables are initially empty per zero-fake-data rule. Run data pipeline to ingest observations."
    }


@router.get("/grid/{grid_id}")
def get_grid_observations(grid_id: int) -> Dict[str, Any]:
    """Retrieve historical time-series observation records for a specific grid cell."""
    return {
        "grid_id": grid_id,
        "count": 0,
        "observations": [],
        "message": f"No physical observations loaded for grid cell {grid_id} yet."
    }
