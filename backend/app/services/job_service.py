"""EarthPulse AI — Analysis Job Manager.
Manages asynchronous and synchronous execution of multi-signal analysis jobs.
Job lifecycle: QUEUED -> RETRIEVING_DATA -> PROCESSING -> CALCULATING -> COMPLETED / PARTIAL / FAILED.
Strict Provenance: Zero fabricated values.
"""

import uuid
import time
import threading
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    JobState,
    JobStatusResponse,
    AvailabilityStatus,
    UnifiedRegionProfile
)
from app.services.availability_engine import AvailabilityEngine
from app.services.cache_service import CacheService
from app.services.orchestrator import MultiSignalOrchestrator


TEMPORAL_ALIGNMENT_DISCLOSURE = (
    "EarthPulse AI fuses heterogeneous satellite, climate, and spatial signals while strictly preserving their native "
    "observation cadences: Sentinel-2 optical imagery is provided per cloud-free acquisition scene; VIIRS nighttime "
    "radiance is sampled as annual April cloud-free monthly baseline composites; NASA POWER meteorological data is provided "
    "as daily continuous point observations; OpenStreetMap context is provided as a static spatial snapshot timestamped "
    "at the time of extraction. Measurements are grouped spatially across the 0.05° analytical grid without artificial "
    "temporal interpolation."
)


class JobService:
    _jobs: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def execute_analysis(cls, req: AnalysisRequest, job_id: Optional[str] = None) -> AnalysisResponse:
        """Synchronously execute analysis and return harmonized response."""
        now = datetime.now(timezone.utc)
        resolved_loc, signal_avail, overall_status = AvailabilityEngine.evaluate_request(
            req.location, req.start_date, req.end_date, req.signals
        )

        req_id = f"req_{uuid.uuid4().hex[:12]}"
        cache_key = CacheService.generate_cache_key(
            source="multi_signal",
            product="unified_regional_profile",
            location_repr=f"{resolved_loc.location_type.value}:{resolved_loc.matched_region or resolved_loc.bounding_box}",
            start_date=req.start_date.isoformat(),
            end_date=req.end_date.isoformat(),
            resolution=req.resolution or "0.05deg"
        )

        # Check Cache
        cached_profile = CacheService.get(cache_key)
        if cached_profile:
            return AnalysisResponse(
                request_id=req_id,
                job_id=job_id,
                status=overall_status,
                created_at=now,
                location=resolved_loc,
                signal_availability=signal_avail,
                profile=UnifiedRegionProfile(**cached_profile["profile"]),
                temporal_alignment_disclosure=TEMPORAL_ALIGNMENT_DISCLOSURE,
                cache_hit=True,
                provenance_chain=cached_profile.get("provenance_chain", [])
            )

        # Build Profile from Real Datasets
        profile, provenance_chain = MultiSignalOrchestrator.build_profile(
            resolved_loc, req.start_date, req.end_date, req.signals
        )

        resp = AnalysisResponse(
            request_id=req_id,
            job_id=job_id,
            status=overall_status,
            created_at=now,
            location=resolved_loc,
            signal_availability=signal_avail,
            profile=profile,
            temporal_alignment_disclosure=TEMPORAL_ALIGNMENT_DISCLOSURE,
            cache_hit=False,
            provenance_chain=provenance_chain
        )

        # Cache only if location is verified real pilot
        if resolved_loc.is_verified_pilot_extent:
            CacheService.set(cache_key, {
                "profile": profile.model_dump(),
                "provenance_chain": provenance_chain
            })

        return resp

    @classmethod
    def create_async_job(cls, req: AnalysisRequest) -> JobStatusResponse:
        """Create and launch an asynchronous analysis job."""
        job_id = f"job_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)

        job_record = {
            "job_id": job_id,
            "status": JobState.QUEUED,
            "progress_pct": 0,
            "created_at": now,
            "completed_at": None,
            "current_step": "Job queued for execution",
            "logs": [f"[{now.isoformat()}] Job initialized with {len(req.signals)} signals"],
            "error": None,
            "result": None,
            "request": req
        }
        cls._jobs[job_id] = job_record

        # Launch background worker
        thread = threading.Thread(target=cls._run_worker, args=(job_id, req))
        thread.daemon = True
        thread.start()

        return JobStatusResponse(
            job_id=job_id,
            status=JobState.QUEUED,
            progress_pct=0,
            created_at=now,
            current_step="Job queued for execution",
            logs=job_record["logs"]
        )

    @classmethod
    def _run_worker(cls, job_id: str, req: AnalysisRequest) -> None:
        """Background worker thread simulating job state transitions on real data."""
        job = cls._jobs.get(job_id)
        if not job:
            return

        try:
            # Step 1: Retrieving Data
            job["status"] = JobState.RETRIEVING_DATA
            job["progress_pct"] = 25
            job["current_step"] = "Retrieving spatial boundaries and source availability"
            job["logs"].append(f"[{datetime.now(timezone.utc).isoformat()}] Resolving spatial bounds...")
            time.sleep(0.05)

            # Step 2: Processing
            job["status"] = JobState.PROCESSING
            job["progress_pct"] = 60
            job["current_step"] = "Processing heterogeneous raster and vector observations"
            job["logs"].append(f"[{datetime.now(timezone.utc).isoformat()}] Filtering satellite and meteorological records...")
            time.sleep(0.05)

            # Step 3: Calculating
            job["status"] = JobState.CALCULATING
            job["progress_pct"] = 90
            job["current_step"] = "Calculating regional aggregations and spatial statistics in UTM Zone 44N"
            job["logs"].append(f"[{datetime.now(timezone.utc).isoformat()}] Harmonizing multi-signal metrics...")

            # Execute
            result = cls.execute_analysis(req, job_id=job_id)

            # Step 4: Completed
            job["status"] = JobState.COMPLETED if result.status in [AvailabilityStatus.AVAILABLE, AvailabilityStatus.PARTIAL_DATA] else JobState.PARTIAL
            job["progress_pct"] = 100
            job["completed_at"] = datetime.now(timezone.utc)
            job["current_step"] = "Analysis completed successfully"
            job["logs"].append(f"[{datetime.now(timezone.utc).isoformat()}] Analysis finished with status {result.status.value}")
            job["result"] = result

        except Exception as e:
            job["status"] = JobState.FAILED
            job["progress_pct"] = 100
            job["completed_at"] = datetime.now(timezone.utc)
            job["current_step"] = "Execution failed"
            job["error"] = str(e)
            job["logs"].append(f"[{datetime.now(timezone.utc).isoformat()}] ERROR: {str(e)}")

    @classmethod
    def get_job(cls, job_id: str) -> Optional[JobStatusResponse]:
        """Fetch job status and result."""
        job = cls._jobs.get(job_id)
        if not job:
            return None

        return JobStatusResponse(
            job_id=job["job_id"],
            status=job["status"],
            progress_pct=job["progress_pct"],
            created_at=job["created_at"],
            completed_at=job.get("completed_at"),
            current_step=job["current_step"],
            logs=job.get("logs", []),
            error=job.get("error"),
            result=job.get("result")
        )
