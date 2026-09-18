from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.repositories.audit_log_repository import AuditLogRepository


class AuditLogService:

    @staticmethod
    def create_log(
        db: Session,
        user_id: int,
        action: str,
        entity: str,
        entity_id: int,
    ) -> AuditLog:
        return AuditLogRepository.create(
            db=db,
            user_id=user_id,
            action=action,
            entity=entity,
            entity_id=entity_id,
        )

    @staticmethod
    def get_logs(
        db: Session,
    ) -> list[AuditLog]:
        return AuditLogRepository.get_all(db=db)