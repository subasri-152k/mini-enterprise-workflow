from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models import Activity, User
from app.services.task_service import TaskService


router = APIRouter(
    prefix="/tasks",
    tags=["Activities"],
)


@router.get("/{task_id}/activities")
def get_task_activities(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = TaskService.get_task(db, task_id)

    if current_user.role == "admin":
        pass

    elif current_user.role == "manager":
        if task.created_by_id != current_user.id:
            from fastapi import HTTPException, status

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot access this task activity",
            )

    elif current_user.role == "employee":
        if task.assigned_to_id != current_user.id:
            from fastapi import HTTPException, status

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot access this task activity",
            )

    activities = db.scalars(
        select(Activity)
        .where(Activity.task_id == task_id)
        .order_by(Activity.created_at.desc())
    ).all()

    return activities