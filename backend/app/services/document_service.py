from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.task import Task
from app.repositories.document_repository import DocumentRepository
from app.services.audit_log_service import AuditLogService
from app.services.notification_service import NotificationService
from app.utils.file_handler import save_file


class DocumentService:

    @staticmethod
    async def upload_document(
        db: Session,
        file,
        uploaded_by: int,
        task_id: int,
    ) -> Document:

        task = db.get(Task, task_id)

        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )

        if uploaded_by <= 0:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid uploader",
            )

        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File name is required",
            )

        latest_document = DocumentRepository.get_latest_version(
            db=db,
            task_id=task_id,
            file_name=file.filename,
        )

        next_version = (
            latest_document.version + 1
            if latest_document
            else 1
        )

        try:
            file_path = await save_file(file)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            )

        document = Document(
            file_name=file.filename,
            file_path=file_path,
            version=next_version,
            uploaded_by=uploaded_by,
            task_id=task_id,
        )

        document = DocumentRepository.create(
            db=db,
            document=document,
        )

        AuditLogService.create_log(
            db=db,
            user_id=uploaded_by,
            action="DOCUMENT_UPLOADED",
            entity="Document",
            entity_id=document.id,
        )

        notification_message = (
            f"New document '{document.file_name}' "
            f"(v{document.version}) was uploaded "
            f"to task '{task.title}'"
        )

        if (
            task.created_by_id
            and task.created_by_id != uploaded_by
        ):
            NotificationService.create_notification(
                db=db,
                user_id=task.created_by_id,
                message=notification_message,
            )

        if (
            task.assigned_to_id
            and task.assigned_to_id != uploaded_by
            and task.assigned_to_id != task.created_by_id
        ):
            NotificationService.create_notification(
                db=db,
                user_id=task.assigned_to_id,
                message=notification_message,
            )

        return document

    @staticmethod
    def get_document(
        db: Session,
        document_id: int,
    ) -> Document | None:

        return DocumentRepository.get_by_id(
            db=db,
            document_id=document_id,
        )

    @staticmethod
    def get_task_documents(
        db: Session,
        task_id: int,
    ) -> list[Document]:

        task = db.get(Task, task_id)

        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )

        return DocumentRepository.get_by_task(
            db=db,
            task_id=task_id,
        )