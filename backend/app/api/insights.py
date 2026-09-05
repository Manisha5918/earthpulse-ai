"""Evidence-Grounded AI Insights Endpoints."""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query
from app.services.insight_service import InsightService

router = APIRouter()


@router.get("")
def list_insights(
    region_id: Optional[int] = Query(1, description="Region ID"),
    year_month: Optional[str] = Query("2024-05", description="Target month")
) -> Dict[str, Any]:
    """Retrieve AI-synthesized regional intelligence briefings."""
    briefing = InsightService.generate_evidence_explanation(
        region_code="IN-TN-CHE",
        grid_code="CHE_ALL",
        year_month=year_month or "2024-05",
        observed_facts=[]
    )
    return {
        "region_id": region_id,
        "year_month": year_month,
        "insights": [briefing]
    }
