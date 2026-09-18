from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models import User
from app.schemas import CommentCreate, CommentResponse
from app.services.comment_service import CommentService
from app.services.task_service import TaskService


router = APIRouter(
    prefix="/tasks",
    tags=["Comments"],
)


@router.post(
    "/{task_id}/comments",
    response_model=CommentResponse,
)
def create_comment(
    task_id: int,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = TaskService.get_task(db, task_id)

    return CommentService.create_comment(
        db=db,
        task=task,
        current_user=current_user,
        comment_data=comment_data,
    )


@router.get(
    "/{task_id}/comments",
    response_model=list[CommentResponse],
)
def get_comments(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = TaskService.get_task(db, task_id)

    return CommentService.get_task_comments(
        db=db,
        task=task,
        current_user=current_user,
    )