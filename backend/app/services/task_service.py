
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import Task
from app.schemas import TaskCreate, TaskUpdate
from app.services.activity_service import ActivityService
from app.services.audit_log_service import AuditLogService
from app.services.notification_service import NotificationService


class TaskService:

   

    ALLOWED_STATUSES = {
        "todo",
        "in_progress",
        "review",
        "done",
    }

    ALLOWED_TRANSITIONS = {
        "todo": ["in_progress"],
        "in_progress": ["review"],
        "review": ["done"],
        "done": [],
    }

    # ---------------------------------------------------------
    # Validate Status Transition
    # ---------------------------------------------------------

    @staticmethod
    def validate_status_transition(
        current_status: str,
        new_status: str,
    ):
        if new_status not in TaskService.ALLOWED_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid task status",
            )

        if current_status == new_status:
            return

        allowed_next_statuses = TaskService.ALLOWED_TRANSITIONS.get(
            current_status,
            [],
        )

        if new_status not in allowed_next_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid status transition: "
                    f"{current_status} -> {new_status}"
                ),
            )

    # ---------------------------------------------------------
    # Get Task
    # ---------------------------------------------------------

    @staticmethod
    def get_task(
        db: Session,
        task_id: int,
    ) -> Task:

        task = db.get(Task, task_id)

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )

        return task

    # ---------------------------------------------------------
    # Create Task
    # ---------------------------------------------------------

    @staticmethod
    def create_task(
        db: Session,
        task_data: TaskCreate,
        current_user,
    ):

        if task_data.status not in TaskService.ALLOWED_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid task status",
            )

        task = Task(
            title=task_data.title,
            description=task_data.description,
            status=task_data.status,
            priority=task_data.priority,
            due_date=task_data.due_date,
            created_by_id=current_user.id,
            assigned_to_id=task_data.assigned_to_id,
            updated_by=current_user.id,
        )

        db.add(task)
        db.flush()

        # -----------------------------------------------------
        # TASK ACTIVITY
        # -----------------------------------------------------

        ActivityService.log(
            db=db,
            task_id=task.id,
            user_id=current_user.id,
            action="task_created",
            description=f"Task '{task.title}' was created",
        )

        # -----------------------------------------------------
        # AUDIT LOG
        # -----------------------------------------------------

        AuditLogService.create_log(
            db=db,
            user_id=current_user.id,
            action="TASK_CREATED",
            entity="Task",
            entity_id=task.id,
        )

        # -----------------------------------------------------
        # ASSIGNMENT NOTIFICATION
        # -----------------------------------------------------

        if (
            task.assigned_to_id
            and task.assigned_to_id != current_user.id
        ):
            NotificationService.create_notification(
                db=db,
                user_id=task.assigned_to_id,
                message=(
                    f"Task '{task.title}' was assigned to you "
                    f"by {current_user.name}"
                ),
            )

        db.commit()
        db.refresh(task)

        return task

    # ---------------------------------------------------------
    # Update Task
    # ---------------------------------------------------------

    @staticmethod
    def update_task(
        db: Session,
        task: Task,
        task_data: TaskUpdate,
        current_user=None,
    ):

        old_title = task.title
        old_status = task.status
        old_priority = task.priority
        old_due_date = task.due_date

        new_status = task_data.status

        # -----------------------------------------------------
        # VALIDATE STATUS TRANSITION
        # -----------------------------------------------------

        TaskService.validate_status_transition(
            current_status=old_status,
            new_status=new_status,
        )

        # -----------------------------------------------------
        # UPDATE TASK
        # -----------------------------------------------------

        task.title = task_data.title
        task.description = task_data.description
        task.status = new_status
        task.priority = task_data.priority
        task.due_date = task_data.due_date

        # -----------------------------------------------------
        # TRACK USER
        # -----------------------------------------------------

        if current_user:
            task.updated_by = current_user.id

            # -------------------------------------------------
            # TASK ACTIVITY
            # -------------------------------------------------

            ActivityService.log(
                db=db,
                task_id=task.id,
                user_id=current_user.id,
                action="task_updated",
                description=(
                    f"Task '{old_title}' was updated"
                ),
            )

            # -------------------------------------------------
            # AUDIT - TASK UPDATED
            # -------------------------------------------------

            AuditLogService.create_log(
                db=db,
                user_id=current_user.id,
                action="TASK_UPDATED",
                entity="Task",
                entity_id=task.id,
            )

            # -------------------------------------------------
            # STATUS CHANGE
            # -------------------------------------------------

            if old_status != new_status:

                ActivityService.log(
                    db=db,
                    task_id=task.id,
                    user_id=current_user.id,
                    action="status_changed",
                    description=(
                        f"Task status changed "
                        f"from '{old_status}' to '{new_status}'"
                    ),
                )

                AuditLogService.create_log(
                    db=db,
                    user_id=current_user.id,
                    action="TASK_STATUS_CHANGED",
                    entity="Task",
                    entity_id=task.id,
                )

                # Notify assigned user
                if (
                    task.assigned_to_id
                    and task.assigned_to_id != current_user.id
                ):
                    NotificationService.create_notification(
                        db=db,
                        user_id=task.assigned_to_id,
                        message=(
                            f"Task '{task.title}' status changed "
                            f"from '{old_status}' to "
                            f"'{new_status}'"
                        ),
                    )

        db.commit()
        db.refresh(task)

        return task

    # ---------------------------------------------------------
    # Delete Task
    # ---------------------------------------------------------

    @staticmethod
    def delete_task(
        db: Session,
        task: Task,
        current_user=None,
    ):

        task_id = task.id
        task_title = task.title

        if current_user:

            # -------------------------------------------------
            # TASK ACTIVITY
            # -------------------------------------------------

            ActivityService.log(
                db=db,
                task_id=task_id,
                user_id=current_user.id,
                action="task_deleted",
                description=(
                    f"Task '{task_title}' was deleted"
                ),
            )

            # -------------------------------------------------
            # AUDIT LOG
            # -------------------------------------------------

            AuditLogService.create_log(
                db=db,
                user_id=current_user.id,
                action="TASK_DELETED",
                entity="Task",
                entity_id=task_id,
            )

        db.delete(task)
        db.commit()

    # ---------------------------------------------------------
    # Assign Task
    # ---------------------------------------------------------

    @staticmethod
    def assign_task(
        db: Session,
        task: Task,
        assigned_to_id: int,
        current_user=None,
    ):

        old_assigned_to_id = task.assigned_to_id

        task.assigned_to_id = assigned_to_id

        # -----------------------------------------------------
        # TRACK ASSIGNMENT
        # -----------------------------------------------------

        if current_user:

            task.updated_by = current_user.id

            # -------------------------------------------------
            # TASK ACTIVITY
            # -------------------------------------------------

            ActivityService.log(
                db=db,
                task_id=task.id,
                user_id=current_user.id,
                action="task_assigned",
                description=(
                    f"Task assigned to user {assigned_to_id}"
                ),
            )

            # -------------------------------------------------
            # AUDIT LOG
            # -------------------------------------------------

            AuditLogService.create_log(
                db=db,
                user_id=current_user.id,
                action="TASK_ASSIGNED",
                entity="Task",
                entity_id=task.id,
            )

            # -------------------------------------------------
            # NOTIFY NEW ASSIGNEE
            # -------------------------------------------------

            if assigned_to_id != current_user.id:

                NotificationService.create_notification(
                    db=db,
                    user_id=assigned_to_id,
                    message=(
                        f"Task '{task.title}' was assigned "
                        f"to you by {current_user.name}"
                    ),
                )

        db.commit()
        db.refresh(task)

        return task

    # ---------------------------------------------------------
    # Update Task Status
    # ---------------------------------------------------------

    @staticmethod
    def update_task_status(
        db: Session,
        task: Task,
        status_value: str,
        current_user=None,
    ):

        # -----------------------------------------------------
        # VALIDATE STATUS TRANSITION
        # -----------------------------------------------------

        TaskService.validate_status_transition(
            current_status=task.status,
            new_status=status_value,
        )

        old_status = task.status

        task.status = status_value

        # -----------------------------------------------------
        # TRACK STATUS CHANGE
        # -----------------------------------------------------

        if current_user:

            task.updated_by = current_user.id

            # -------------------------------------------------
            # TASK ACTIVITY
            # -------------------------------------------------

            ActivityService.log(
                db=db,
                task_id=task.id,
                user_id=current_user.id,
                action="status_changed",
                description=(
                    f"Task status changed "
                    f"from '{old_status}' to '{status_value}'"
                ),
            )

            # -------------------------------------------------
            # AUDIT LOG
            # -------------------------------------------------

            AuditLogService.create_log(
                db=db,
                user_id=current_user.id,
                action="TASK_STATUS_CHANGED",
                entity="Task",
                entity_id=task.id,
            )

            # -------------------------------------------------
            # NOTIFY ASSIGNED USER
            # -------------------------------------------------

            if (
                task.assigned_to_id
                and task.assigned_to_id != current_user.id
            ):
                NotificationService.create_notification(
                    db=db,
                    user_id=task.assigned_to_id,
                    message=(
                        f"Task '{task.title}' status changed "
                        f"from '{old_status}' to "
                        f"'{status_value}'"
                    ),
                )

        db.commit()
        db.refresh(task)

        return task

