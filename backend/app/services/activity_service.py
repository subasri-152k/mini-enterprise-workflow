from sqlalchemy.orm import Session

from app.models import Activity


class ActivityService:

    @staticmethod
    def log(
        db: Session,
        task_id: int,
        user_id: int,
        action: str,
        description: str | None = None,
    ):
        activity = Activity(
            task_id=task_id,
            user_id=user_id,
            action=action,
            description=description,
        )

        db.add(activity)
        db.flush()

        return activity