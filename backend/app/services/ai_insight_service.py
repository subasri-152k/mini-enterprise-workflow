from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Task, User


class AIInsightService:

    @staticmethod
    def get_ai_summary(
        db: Session,
        current_user: User,
    ) -> dict:

        # -----------------------------------------------------
        # ROLE-BASED TASK FILTER
        # -----------------------------------------------------
        if current_user.role == "admin":
            task_filter = True

        elif current_user.role == "manager":
            task_filter = Task.created_by_id == current_user.id

        else:
            task_filter = Task.assigned_to_id == current_user.id

        # -----------------------------------------------------
        # PENDING TASKS
        # -----------------------------------------------------
        pending_tasks = db.scalar(
            select(func.count(Task.id)).where(
                task_filter,
                Task.status != "done",
            )
        ) or 0

        # -----------------------------------------------------
        # HIGH PRIORITY PENDING TASKS
        # -----------------------------------------------------
        high_priority_tasks = db.scalar(
            select(func.count(Task.id)).where(
                task_filter,
                Task.priority == "high",
                Task.status != "done",
            )
        ) or 0

        # -----------------------------------------------------
        # DELAYED / OVERDUE TASKS
        # -----------------------------------------------------
        overdue_tasks = db.scalar(
            select(func.count(Task.id)).where(
                task_filter,
                Task.status != "done",
                Task.due_date.is_not(None),
                Task.due_date < datetime.utcnow(),
            )
        ) or 0

        # -----------------------------------------------------
        # AI-STYLE SUMMARY
        # -----------------------------------------------------
        if pending_tasks == 0:
            summary = "No pending tasks. Your current workload is clear."

        elif overdue_tasks > 0:
            summary = (
                f"{overdue_tasks} task(s) are overdue and need attention. "
                f"There are {pending_tasks} pending task(s) in total."
            )

        elif high_priority_tasks > 0:
            summary = (
                f"{high_priority_tasks} high priority task(s) are pending. "
                f"There are {pending_tasks} pending task(s) in total."
            )

        else:
            summary = (
                f"{pending_tasks} task(s) are currently pending. "
                "No immediate high-priority or overdue issue was detected."
            )

        return {
            "summary": summary,
            "pending_tasks": pending_tasks,
            "high_priority_tasks": high_priority_tasks,
            "overdue_tasks": overdue_tasks,
        }