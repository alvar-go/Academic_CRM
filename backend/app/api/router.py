from fastapi import APIRouter

from backend.app.api.routes.applicants import router as applicants_router
from backend.app.api.routes.dashboard import router as dashboard_router
from backend.app.api.routes.health import router as health_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(applicants_router, prefix="/applicants", tags=["applicants"])
