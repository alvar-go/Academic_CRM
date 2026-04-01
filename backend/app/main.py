from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.app.api.router import api_router
from backend.app.core.config import get_settings
from backend.app.core.database import ensure_database


settings = get_settings()

FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"
STATIC_DIR = FRONTEND_DIR / "src"
PUBLIC_DIR = FRONTEND_DIR / "public"


@asynccontextmanager
async def lifespan(_: FastAPI):
    ensure_database()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)


app.include_router(api_router, prefix="/api")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/public", StaticFiles(directory=PUBLIC_DIR), name="public")


@app.get("/", include_in_schema=False)
@app.get("/configuration", include_in_schema=False)
@app.get("/applicants", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "index.html")
