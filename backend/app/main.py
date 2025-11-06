"""
FastAPI main application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base

# Create database tables (for development only, use Alembic in production)
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="KOL Management System for KCEX Exchange BD Team",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint - health check."""
    return {
        "message": "Welcome to KOL-BD-Tool API",
        "version": "0.1.0",
        "docs": "/docs",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


# TODO: Import and include routers
# from app.routers import users, kols, templates, contact_logs
# app.include_router(users.router, prefix="/api/users", tags=["users"])
# app.include_router(kols.router, prefix="/api/kols", tags=["kols"])
# app.include_router(templates.router, prefix="/api/templates", tags=["templates"])
# app.include_router(contact_logs.router, prefix="/api/contacts", tags=["contacts"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
