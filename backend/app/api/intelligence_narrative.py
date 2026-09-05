"""EarthPulse AI — Narrative Intelligence API Router.
"AI that reveals how India is changing."
Strict Provenance: Zero fabricated values.
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.narrative import NarrativeRequest, NarrativeResponse
from app.services.narrative_service import NarrativeService
from app.services.job_service import JobService
from app.schemas.analysis import AnalysisRequest, SignalType

router = APIRouter()


@router.post("", response_model=NarrativeResponse, status_code=status.HTTP_200_OK, summary="Generate Grounded Narrative Intelligence Briefing")
def generate_narrative(request: NarrativeRequest):
    """Generate multimodal narrative intelligence briefing grounded strictly in physical observations and statistical baselines.
    Returns HTTP 200 with complete narrative or HTTP 202 when async_mode=true.
    """
    if request.async_mode:
        target_signals = request.signals or [
            SignalType.SENTINEL2,
            SignalType.VIIRS,
            SignalType.NASA_POWER,
            SignalType.OSM
        ]
        # Convert to analysis request for async background worker
        analysis_req = AnalysisRequest(
            location=request.location,
            start_date=request.start_date,
            end_date=request.end_date,
            signals=target_signals
        )
        job = JobService.create_async_job(analysis_req)
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail={
                "message": "Narrative intelligence job queued for asynchronous execution",
                "job_id": job.job_id,
                "status": job.status.value,
                "check_status_url": f"/api/v1/analysis/{job.job_id}"
            }
        )

    response = NarrativeService.execute_narrative_analysis(request)
    return response
