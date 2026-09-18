from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_roles
from app.db.database import get_db
from app.models import Task, User
from app.schemas import (
    TaskAssign,
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)
from app.services.task_service import TaskService


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


# ============================================================
# CREATE TASK
# ============================================================

@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(
        require_roles("admin", "manager"),
    ),
    db: Session = Depends(get_db),
):
    return TaskService.create_task(
        db=db,
        task_data=task_data,
        current_user=current_user,
    )


# ============================================================
# GET ALL TASKS
# ============================================================

@router.get(
    "/",
    response_model=list[TaskResponse],
)
def get_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "admin":
        query = select(Task)

    elif current_user.role == "manager":
        query = select(Task).where(
            Task.created_by_id == current_user.id
        )

    else:
        query = select(Task).where(
            Task.assigned_to_id == current_user.id
        )

    return list(
        db.scalars(
            query.order_by(Task.id.desc())
        ).all()
    )


# ============================================================
# KANBAN TASKS

# ============================================================

@router.get("/kanban")
def get_kanban_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "admin":
        query = select(Task)

    elif current_user.role == "manager":
        query = select(Task).where(
            Task.created_by_id == current_user.id
        )

    else:
        query = select(Task).where(
            Task.assigned_to_id == current_user.id
        )

    tasks = db.scalars(
        query.order_by(Task.updated_at.desc())
    ).all()

    return {
        "todo": [
            task for task in tasks
            if task.status == "todo"
        ],
        "in_progress": [
            task for task in tasks
            if task.status == "in_progress"
        ],
        "review": [
            task for task in tasks
            if task.status == "review"
        ],
        "done": [
            task for task in tasks
            if task.status == "done"
        ],
    }


# ============================================================
# GET SINGLE TASK
# ============================================================

@router.get(
    "/{task_id}",
    response_model=TaskResponse,
)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = TaskService.get_task(
        db,
        task_id,
    )

    if current_user.role == "admin":
        return task

    if current_user.role == "manager":
        if task.created_by_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot access this task",
            )

    if current_user.role == "employee":
        if task.assigned_to_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot access this task",
            )

    return task


# ============================================================
# UPDATE TASK
# ============================================================

@router.put(
    "/{task_id}",
    response_model=TaskResponse,
)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(
        require_roles("admin", "manager"),
    ),
    db: Session = Depends(get_db),
):
    task = TaskService.get_task(
        db,
        task_id,
    )

    if current_user.role == "manager":
        if task.created_by_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot update this task",
            )

    return TaskService.update_task(
    db=db,
    task=task,
    task_data=task_data,
    current_user=current_user,
)


# ============================================================
# DELETE TASK
# ============================================================

@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_task(
    task_id: int,
    current_user: User = Depends(
        require_roles("admin", "manager"),
    ),
    db: Session = Depends(get_db),
):
    task = TaskService.get_task(
        db,
        task_id,
    )

    if current_user.role == "manager":
        if task.created_by_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot delete this task",
            )

    TaskService.delete_task(
        db,
        task,
    )

    return None


# ============================================================
# ASSIGN TASK
# ============================================================

@router.patch(
    "/{task_id}/assign",
    response_model=TaskResponse,
)
def assign_task(
    task_id: int,
    assignment: TaskAssign,
    current_user: User = Depends(
        require_roles("admin", "manager"),
    ),
    db: Session = Depends(get_db),
):
    task = TaskService.get_task(
        db,
        task_id,
    )

    if current_user.role == "manager":
        if task.created_by_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot assign this task",
            )

    return TaskService.assign_task(
    db=db,
    task=task,
    assigned_to_id=assignment.assigned_to_id,
    current_user=current_user,
)


# ============================================================
# UPDATE TASK STATUS
# ============================================================

@router.patch(
    "/{task_id}/status",
    response_model=TaskResponse,
)
def update_task_status(
    task_id: int,
    status_value: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = TaskService.get_task(
        db,
        task_id,
    )

    if current_user.role == "employee":
        if task.assigned_to_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can update only your assigned tasks",
            )

    return TaskService.update_task_status(
    db=db,
    task=task,
    status_value=status_value,
    current_user=current_user,
)