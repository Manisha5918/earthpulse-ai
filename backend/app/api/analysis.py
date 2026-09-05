"""EarthPulse AI — Unified Regional Intelligence Analysis Router.
"AI that reveals how India is changing."
Strict Provenance: Zero fabricated values.
"""

from typing import Optional, List
from datetime import date
from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    JobStatusResponse,
    LocationSpec,
    LocationType,
    SignalType,
    AvailabilityStatus
)
from app.services.availability_engine import AvailabilityEngine
from app.services.job_service import JobService

router = APIRouter()


@router.get("/availability", summary="Query Real Data Availability")
def check_availability(
    lat: Optional[float] = Query(None, description="Latitude in degrees"),
    lon: Optional[float] = Query(None, description="Longitude in degrees"),
    region_code: Optional[str] = Query(None, description="Region code (e.g. IN-TN-CHE)"),
    cell_code: Optional[str] = Query(None, description="Cell code (e.g. CHE_G001)"),
    start_date: date = Query(date(2021, 1, 1), description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(date(2024, 12, 31), description="End date (YYYY-MM-DD)"),
    signals: Optional[List[SignalType]] = Query(None, description="List of signals")
):
    """Check real data availability without launching an analysis execution."""
    if region_code:
        loc = LocationSpec(type=LocationType.REGION, region_code=region_code)
    elif cell_code:
        loc = LocationSpec(type=LocationType.GRID_CELL, cell_code=cell_code)
    elif lat is not None and lon is not None:
        loc = LocationSpec(type=LocationType.POINT, coordinates=[lat, lon])
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide region_code, cell_code, or (lat, lon) coordinates."
        )

    target_signals = signals or [SignalType.SENTINEL2, SignalType.VIIRS, SignalType.NASA_POWER, SignalType.OSM]
    resolved, availabilities, overall = AvailabilityEngine.evaluate_request(
        loc, start_date, end_date, target_signals
    )

    return {
        "location": resolved,
        "overall_status": overall,
        "signal_availability": availabilities
    }


@router.post("", response_model=AnalysisResponse, status_code=status.HTTP_200_OK, summary="Execute Unified Multi-Signal Analysis")
def analyze_region(
    request: AnalysisRequest,
    async_mode: bool = Query(False, description="Set True to run asynchronously and return a job_id")
):
    """Execute unified multi-signal regional intelligence query.
    Fuses Sentinel-2, VIIRS, NASA POWER, and OpenStreetMap real data across user-specified
    geographic entities, date ranges, and signal selections.
    """
    if async_mode:
        job = JobService.create_async_job(request)
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail={
                "message": "Analysis job queued for asynchronous execution",
                "job_id": job.job_id,
                "status": job.status.value,
                "check_status_url": f"/api/v1/analysis/{job.job_id}"
            }
        )

    response = JobService.execute_analysis(request)
    return response


@router.get("/jobs/{job_id}", response_model=JobStatusResponse, summary="Get Analysis Job Status")
@router.get("/{job_id}", response_model=JobStatusResponse, summary="Get Analysis Job Status or Result")
def get_job_status(job_id: str):
    """Poll asynchronous analysis job execution status, step logs, and completed result."""
    job = JobService.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis job '{job_id}' not found."
        )
    return job
