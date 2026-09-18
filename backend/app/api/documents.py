
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models import Document, Task, User
from app.schemas.document import DocumentResponse
from app.services.document_service import DocumentService


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


# ============================================================
# DOCUMENT ACCESS HELPER
# ============================================================

def can_access_document(
    document: Document,
    current_user: User,
    db: Session,
) -> bool:

    # --------------------------------------------------------
    # ADMIN
    # --------------------------------------------------------
    if current_user.role == "admin":
        return True

    # --------------------------------------------------------
    # DOCUMENT OWNER
    # --------------------------------------------------------
    if document.uploaded_by == current_user.id:
        return True

    # --------------------------------------------------------
    # GET RELATED TASK
    # --------------------------------------------------------
    task = db.get(Task, document.task_id)

    if task is None:
        return False

    # --------------------------------------------------------
    # MANAGER
    # Manager can access documents belonging to tasks
    # created by that manager.
    # --------------------------------------------------------
    if current_user.role == "manager":
        return task.created_by_id == current_user.id

    # --------------------------------------------------------
    # EMPLOYEE
    # Employee can access documents belonging to tasks
    # assigned to that employee.
    # --------------------------------------------------------
    if current_user.role == "employee":
        return task.assigned_to_id == current_user.id

    return False


# ============================================================
# UPLOAD DOCUMENT
# ============================================================

@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    task_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Validate task
    # --------------------------------------------------------
    task = db.get(Task, task_id)

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # --------------------------------------------------------
    # Upload authorization
    # --------------------------------------------------------
    if current_user.role == "admin":
        authorized = True

    elif current_user.role == "manager":
        authorized = task.created_by_id == current_user.id

    elif current_user.role == "employee":
        authorized = task.assigned_to_id == current_user.id

    else:
        authorized = False

    if not authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to upload documents to this task",
        )

    # --------------------------------------------------------
    # Upload document
    # --------------------------------------------------------
    try:
        document = await DocumentService.upload_document(
            db=db,
            file=file,
            uploaded_by=current_user.id,
            task_id=task_id,
        )

        return document

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# ============================================================
# DOWNLOAD DOCUMENT
# ============================================================

@router.get(
    "/{document_id}/download",
)
def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = DocumentService.get_document(
        db=db,
        document_id=document_id,
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    # --------------------------------------------------------
    # Authorization
    # --------------------------------------------------------
    if not can_access_document(
        document=document,
        current_user=current_user,
        db=db,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to download this document",
        )

    # --------------------------------------------------------
    # Validate physical file
    # --------------------------------------------------------
    file_path = Path(document.file_path)

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found on server",
        )

    return FileResponse(
        path=file_path,
        filename=document.file_name,
        media_type="application/octet-stream",
    )


# ============================================================
# GET TASK DOCUMENTS
# ============================================================

@router.get(
    "/task/{task_id}",
    response_model=list[DocumentResponse],
)
def get_task_documents(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Validate task
    # --------------------------------------------------------
    task = db.get(Task, task_id)

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # --------------------------------------------------------
    # Validate task access
    # --------------------------------------------------------
    if current_user.role == "admin":
        authorized = True

    elif current_user.role == "manager":
        authorized = task.created_by_id == current_user.id

    elif current_user.role == "employee":
        authorized = task.assigned_to_id == current_user.id

    else:
        authorized = False

    if not authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this task's documents",
        )

    return DocumentService.get_task_documents(
        db=db,
        task_id=task_id,
    )


# ============================================================
# GET SINGLE DOCUMENT
# ============================================================

@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = DocumentService.get_document(
        db=db,
        document_id=document_id,
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    # --------------------------------------------------------
    # Authorization
    # --------------------------------------------------------
    if not can_access_document(
        document=document,
        current_user=current_user,
        db=db,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this document",
        )

    return document

