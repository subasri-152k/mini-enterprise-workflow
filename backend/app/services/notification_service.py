from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository


class NotificationService:

    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        message: str,
    ) -> Notification:
        return NotificationRepository.create(
            db=db,
            user_id=user_id,
            message=message,
        )

    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: int,
    ) -> list[Notification]:
        return NotificationRepository.get_user_notifications(
            db=db,
            user_id=user_id,
        )

    @staticmethod
    def mark_as_read(
        db: Session,
        notification_id: int,
        user_id: int,
    ) -> Notification | None:

        notification = NotificationRepository.get_by_id(
            db=db,
            notification_id=notification_id,
        )

        if notification is None:
            return None

        # User can only modify their own notification
        if notification.user_id != user_id:
            return None

        return NotificationRepository.mark_as_read(
            db=db,
            notification=notification,
        )