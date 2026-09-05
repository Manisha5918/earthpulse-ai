from app.api.regions import router as regions_router
from app.api.observations import router as observations_router
from app.api.anomalies import router as anomalies_router
from app.api.insights import router as insights_router
from app.api.comparisons import router as comparisons_router

__all__ = ["regions_router", "observations_router", "anomalies_router", "insights_router", "comparisons_router"]
