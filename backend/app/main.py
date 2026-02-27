"""
FastAPI Application — 법인 계좌개설 서류 판정 시스템.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine
from app.models.base import Base
from app.api import determination, admin, audit


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작 시 테이블 생성 + 시드 데이터 로드."""
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Load seed data
    from app.database import SessionLocal
    from app.seed.seed_loader import load_seed_data
    db = SessionLocal()
    try:
        counts = load_seed_data(db)
        print(f"✅ Seed data loaded: {counts}")
    finally:
        db.close()

    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="법인 계좌개설 서류 판정 시스템 API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — Next.js 프론트엔드 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(determination.router, prefix=settings.API_V1_PREFIX, tags=["Determination"])
app.include_router(admin.router, prefix=settings.API_V1_PREFIX, tags=["Admin"])
app.include_router(audit.router, prefix=settings.API_V1_PREFIX, tags=["Audit"])


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
    }
