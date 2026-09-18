from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


class AuditLogRepository:

    @staticmethod
    def create(
        db: Session,
        user_id: int,
        action: str,
        entity: str,
        entity_id: int,
    ) -> AuditLog:
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            entity=entity,
            entity_id=entity_id,
        )

        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)

        return audit_log

    @staticmethod
    def get_all(
        db: Session,
    ) -> list[AuditLog]:
        return list(
            db.scalars(
                select(AuditLog)
                .order_by(AuditLog.timestamp.desc())
            ).all()
        )