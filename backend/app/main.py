"""EarthPulse AI — FastAPI Application Entry Point.
"AI that reveals how India is changing."
"""

from typing import Optional, List
from datetime import date
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import (
    regions,
    observations,
    anomalies,
    insights,
    comparisons,
    analysis,
    intelligence,
    intelligence_narrative
)
from app.schemas.analysis import SignalType

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
EarthPulse AI is an India-focused regional geospatial intelligence platform.
Fuses Sentinel-2 optical, VIIRS nocturnal lights, NASA POWER meteorological data,
and OpenStreetMap context onto a unified 0.05° analytical grid.

Analytical Paradigm:
Observe → Detect → Connect → Explain → Decide
""",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(intelligence_narrative.router, prefix="/api/v1/intelligence", tags=["Multimodal Narrative Intelligence"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["Unified Analysis & Orchestration"])
app.include_router(intelligence.router, prefix="/api/v1/regions", tags=["Statistical Intelligence & Anomalies"])
app.include_router(regions.router, prefix="/api/v1/regions", tags=["Regions & Spatial Grid"])
app.include_router(observations.router, prefix="/api/v1/observations", tags=["Physical Observations"])
app.include_router(anomalies.router, prefix="/api/v1/anomalies", tags=["Multi-Signal Anomalies"])
app.include_router(insights.router, prefix="/api/v1/insights", tags=["AI Intelligence Briefings"])
app.include_router(comparisons.router, prefix="/api/v1/comparisons", tags=["Comparative Analysis"])


# Compatibility alias for GET /api/v1/availability -> delegates to canonical /api/v1/analysis/availability
@app.get("/api/v1/availability", tags=["Unified Analysis & Orchestration"], summary="Query Real Data Availability (Alias)")
def check_availability_alias(
    lat: Optional[float] = Query(None, description="Latitude in degrees"),
    lon: Optional[float] = Query(None, description="Longitude in degrees"),
    region_code: Optional[str] = Query(None, description="Region code (e.g. IN-TN-CHE)"),
    cell_code: Optional[str] = Query(None, description="Cell code (e.g. CHE_G001)"),
    start_date: date = Query(date(2021, 1, 1), description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(date(2024, 12, 31), description="End date (YYYY-MM-DD)"),
    signals: Optional[List[SignalType]] = Query(None, description="List of signals")
):
    """Compatibility alias for GET /api/v1/analysis/availability."""
    return analysis.check_availability(
        lat=lat, lon=lon, region_code=region_code, cell_code=cell_code,
        start_date=start_date, end_date=end_date, signals=signals
    )


@app.get("/api/v1/health", tags=["System"])
def health_check():
    """Health check endpoint confirming service status and provenance settings."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "strict_provenance_enforced": settings.ENFORCE_PROVENANCE_TAGS,
        "pilot_region": "Chennai, Tamil Nadu (IN-TN-CHE)"
    }
