"""Multi-Signal Anomalies Endpoints."""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("")
def list_anomalies(
    grid_id: Optional[int] = Query(None, description="Filter by grid cell ID"),
    severity: Optional[str] = Query(None, description="Filter by severity: LOW, MEDIUM, HIGH, CRITICAL"),
    year_month: Optional[str] = Query(None, description="Filter by month (YYYY-MM)")
) -> Dict[str, Any]:
    """Retrieve detected regional anomalies.
    Returns empty list gracefully when no anomalies are registered.
    """
    return {
        "count": 0,
        "results": [],
        "filters": {"grid_id": grid_id, "severity": severity, "year_month": year_month}
    }


@router.get("/grid/{grid_id}")
def get_grid_anomalies(grid_id: int) -> Dict[str, Any]:
    """List anomalies specific to a single 0.05° grid cell."""
    return {
        "grid_id": grid_id,
        "count": 0,
        "anomalies": []
    }
