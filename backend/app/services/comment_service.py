
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import Comment, Task
from app.schemas import CommentCreate
from app.services.audit_log_service import AuditLogService
from app.services.notification_service import NotificationService


class CommentService:

    # =========================================================
    # CREATE COMMENT
    # =========================================================

    @staticmethod
    def create_comment(
        db: Session,
        task: Task,
        current_user,
        comment_data: CommentCreate,
    ):
        # -----------------------------------------------------
        # EMPLOYEE INTERNAL COMMENT RESTRICTION
        # -----------------------------------------------------

        if (
            current_user.role == "employee"
            and comment_data.is_internal
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Employees are not allowed to create "
                    "internal comments"
                ),
            )

        # -----------------------------------------------------
        # CREATE COMMENT
        # -----------------------------------------------------

        comment = Comment(
            task_id=task.id,
            user_id=current_user.id,
            content=comment_data.content,
            is_internal=comment_data.is_internal,
        )

        db.add(comment)

        # Flush so comment.id is available
        db.flush()

        # -----------------------------------------------------
        # AUDIT LOG
        # -----------------------------------------------------

        AuditLogService.create_log(
            db=db,
            user_id=current_user.id,
            action="COMMENT_ADDED",
            entity="Comment",
            entity_id=comment.id,
        )

        # -----------------------------------------------------
        # NOTIFY TASK CREATOR
        # -----------------------------------------------------

        if task.created_by_id != current_user.id:
            NotificationService.create_notification(
                db=db,
                user_id=task.created_by_id,
                message=(
                    f"{current_user.name} commented on "
                    f"your task '{task.title}'"
                ),
            )

        # -----------------------------------------------------
        # NOTIFY ASSIGNED USER
        # -----------------------------------------------------

        if (
            task.assigned_to_id
            and task.assigned_to_id != current_user.id
            and task.assigned_to_id != task.created_by_id
        ):
            NotificationService.create_notification(
                db=db,
                user_id=task.assigned_to_id,
                message=(
                    f"{current_user.name} commented on "
                    f"the task '{task.title}'"
                ),
            )

        # -----------------------------------------------------
        # COMMIT
        # -----------------------------------------------------

        db.commit()
        db.refresh(comment)

        return comment

    # =========================================================
    # GET TASK COMMENTS
    # =========================================================

    @staticmethod
    def get_task_comments(
        db: Session,
        task: Task,
        current_user,
    ):
        query = db.query(Comment).filter(
            Comment.task_id == task.id
        )

        # -----------------------------------------------------
        # EMPLOYEE ACCESS
        # -----------------------------------------------------

        # Employees can only see public comments.
        if current_user.role == "employee":
            query = query.filter(
                Comment.is_internal.is_(False)
            )

        # -----------------------------------------------------
        # RETURN COMMENTS
        # -----------------------------------------------------

        return query.order_by(
            Comment.created_at.desc()
        ).all()

