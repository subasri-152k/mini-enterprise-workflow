from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.task import Task
from app.models.user import User


class ActivityFeedService:
    @staticmethod
    def get_activity_feed(
        db: Session,
        current_user: User,
        limit: int = 20,
    ) -> list[dict]:
        query = (
            select(Activity, Task.title, User.name)
            .join(Task, Activity.task_id == Task.id)
            .join(User, Activity.user_id == User.id)
        )

        if current_user.role == "manager":
            query = query.where(
                Task.created_by_id == current_user.id
            )

        elif current_user.role == "employee":
            query = query.where(
                Task.assigned_to_id == current_user.id
            )

        elif current_user.role != "admin":
            return []

        query = (
            query
            .order_by(Activity.created_at.desc())
            .limit(limit)
        )

        results = db.execute(query).all()

        return [
            {
                "id": activity.id,
                "task_id": activity.task_id,
                "task_title": task_title,
                "user_id": activity.user_id,
                "user_name": user_name,
                "action": activity.action,
                "description": activity.description,
                "created_at": activity.created_at,
            }
            for activity, task_title, user_name in results
        ]