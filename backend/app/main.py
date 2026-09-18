from fastapi import FastAPI
from app.api.approvals import router as approvals_router
from fastapi.middleware.cors import CORSMiddleware
from app.api.activities import router as activities_router
from app.api.users import router as users_router
from app.api.auth import router as auth_router
from app.api.tasks import router as tasks_router
from app.api.comments import router as comments_router
from app.api.dashboard import router as dashboard_router
from app.api.documents import router as documents_router

from app.api.audit_logs import router as audit_logs_router
from app.api.notifications import router as notifications_router
from app.api.activity_feed import router as activity_feed_router
from app.middleware.logging_middleware import logging_middleware
app = FastAPI(
    title="Mini Enterprise Collaboration & Workflow API",
    description="Role-based task management system",
    version="1.0.0",
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(logging_middleware)


# ==========================================
# API ROUTES
# ==========================================

app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(
    users_router,
    prefix="/api/v1",
)

app.include_router(
    tasks_router,
    prefix="/api/v1",
)

app.include_router(
    comments_router,
    prefix="/api/v1",
)

app.include_router(
    activities_router,
    prefix="/api/v1",
)
app.include_router(
    dashboard_router,
    prefix="/api/v1",
)
app.include_router(
    approvals_router,
    prefix="/api/v1",
)

app.include_router(
    documents_router,
    prefix="/api/v1",
)
app.include_router(
    audit_logs_router,
    prefix="/api/v1",
)
app.include_router(
    notifications_router,
    prefix="/api/v1",
)
app.include_router(activity_feed_router, prefix="/api/v1")
# ==========================================
# ROOT
# ==========================================

@app.get("/")
def root():
    return {
        "message": "Mini Enterprise Workflow API is running",
        "version": "1.0.0",
    }


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }