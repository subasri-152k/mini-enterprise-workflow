from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.schemas.ai_insight import AISummaryResponse
from app.services.ai_insight_service import AIInsightService
from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models import Approval, Task, User


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


# =========================================================
# ROLE-BASED TASK FILTER
# =========================================================

def get_task_filter(current_user: User):
    if current_user.role == "admin":
        return True

    if current_user.role == "manager":
        return Task.created_by_id == current_user.id

    return Task.assigned_to_id == current_user.id


# =========================================================
# DASHBOARD SUMMARY
# =========================================================

@router.get("/summary")
def dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task_filter = get_task_filter(current_user)

    total_tasks = db.scalar(
        select(func.count(Task.id)).where(task_filter)
    ) or 0

    todo_tasks = db.scalar(
        select(func.count(Task.id)).where(
            task_filter,
            Task.status == "todo",
        )
    ) or 0

    in_progress_tasks = db.scalar(
        select(func.count(Task.id)).where(
            task_filter,
            Task.status == "in_progress",
        )
    ) or 0

    review_tasks = db.scalar(
        select(func.count(Task.id)).where(
            task_filter,
            Task.status == "review",
        )
    ) or 0

    completed_tasks = db.scalar(
        select(func.count(Task.id)).where(
            task_filter,
            Task.status == "done",
        )
    ) or 0

    # Pending approvals visible according to role
    if current_user.role == "admin":
        pending_approvals = db.scalar(
            select(func.count(Approval.id)).where(
                Approval.status == "pending"
            )
        ) or 0

    elif current_user.role == "manager":
        pending_approvals = db.scalar(
            select(func.count(Approval.id)).where(
                Approval.status == "pending",
                Approval.current_level == "manager",
            )
        ) or 0

    else:
        pending_approvals = db.scalar(
            select(func.count(Approval.id)).where(
                Approval.requested_by == current_user.id,
                Approval.status == "pending",
            )
        ) or 0

    return {
        "total_tasks": total_tasks,
        "todo_tasks": todo_tasks,
        "in_progress_tasks": in_progress_tasks,
        "review_tasks": review_tasks,
        "completed_tasks": completed_tasks,
        "pending_approvals": pending_approvals,
    }


# =========================================================
# TASK DISTRIBUTION
# =========================================================

@router.get("/task-distribution")
def task_distribution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task_filter = get_task_filter(current_user)

    rows = db.execute(
        select(
            Task.status,
            func.count(Task.id),
        )
        .where(task_filter)
        .group_by(Task.status)
    ).all()

    distribution = {
        "todo": 0,
        "in_progress": 0,
        "review": 0,
        "done": 0,
    }

    for task_status, count in rows:
        if task_status in distribution:
            distribution[task_status] = count

    return distribution


# =========================================================
# AI INSIGHTS SUMMARY
# =========================================================

@router.get(
    "/ai-summary",
    response_model=AISummaryResponse,
)
def ai_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AIInsightService.get_ai_summary(
        db=db,
        current_user=current_user,
    )