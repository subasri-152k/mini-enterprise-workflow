from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document


class DocumentRepository:

    @staticmethod
    def create(
        db: Session,
        document: Document,
    ) -> Document:
        db.add(document)
        db.commit()
        db.refresh(document)

        return document

    @staticmethod
    def get_by_id(
        db: Session,
        document_id: int,
    ) -> Document | None:
        return db.scalar(
            select(Document).where(
                Document.id == document_id
            )
        )

    @staticmethod
    def get_by_task(
        db: Session,
        task_id: int,
    ) -> list[Document]:
        return list(
            db.scalars(
                select(Document)
                .where(Document.task_id == task_id)
                .order_by(
                    Document.version.desc(),
                    Document.created_at.desc(),
                )
            ).all()
        )

    @staticmethod
    def get_latest_version(
        db: Session,
        task_id: int,
        file_name: str,
    ) -> Document | None:
        return db.scalar(
            select(Document)
            .where(
                Document.task_id == task_id,
                Document.file_name == file_name,
            )
            .order_by(Document.version.desc())
            .limit(1)
        )