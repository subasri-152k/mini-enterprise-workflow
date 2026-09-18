from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationRepository:

    @staticmethod
    def create(
        db: Session,
        user_id: int,
        message: str,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            message=message,
            is_read=False,
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        return notification

    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: int,
    ) -> list[Notification]:
        return list(
            db.scalars(
                select(Notification)
                .where(Notification.user_id == user_id)
                .order_by(Notification.created_at.desc())
            ).all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        notification_id: int,
    ) -> Notification | None:
        return db.scalar(
            select(Notification).where(
                Notification.id == notification_id
            )
        )

    @staticmethod
    def mark_as_read(
        db: Session,
        notification: Notification,
    ) -> Notification:
        notification.is_read = True

        db.commit()
        db.refresh(notification)

        return notification