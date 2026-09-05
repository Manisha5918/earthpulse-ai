"""Comparative Regional Analysis Endpoints."""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("")
def compare_entities(
    cell_a: str = Query("CHE_G001", description="First grid cell code"),
    cell_b: str = Query("CHE_G016", description="Second grid cell code"),
    time_a: str = Query("2024-05", description="First time slice"),
    time_b: str = Query("2024-05", description="Second time slice")
) -> Dict[str, Any]:
    """Perform side-by-side comparison between two cells or time windows."""
    return {
        "comparison_type": "SPATIAL_AND_TEMPORAL",
        "entity_a": {"cell_code": cell_a, "time_slice": time_a, "signals": {}},
        "entity_b": {"cell_code": cell_b, "time_slice": time_b, "signals": {}},
        "deltas": {},
        "status": "AWAITING_INGESTION",
        "message": "Both cells require ingested observational features to compute delta percentages."
    }
