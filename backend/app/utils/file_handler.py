
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile


# ============================================================
# UPLOAD CONFIGURATION
# ============================================================

UPLOAD_DIR = Path("uploads/documents")

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# ============================================================
# ALLOWED FILE TYPES
# ============================================================

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".png",
    ".jpg",
    ".jpeg",
    ".txt",
}


ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/png",
    "image/jpeg",
    "text/plain",
}


# ============================================================
# FILE VALIDATION
# ============================================================

def validate_file(file: UploadFile) -> None:
    # --------------------------------------------------------
    # Validate filename
    # --------------------------------------------------------
    if not file.filename:
        raise ValueError("File name is required")

    original_name = Path(file.filename)

    # --------------------------------------------------------
    # Validate extension
    # --------------------------------------------------------
    extension = original_name.suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file type: {extension}"
        )

    # --------------------------------------------------------
    # Validate MIME type
    # --------------------------------------------------------
    if (
        file.content_type
        and file.content_type not in ALLOWED_CONTENT_TYPES
    ):
        raise ValueError(
            f"Unsupported content type: {file.content_type}"
        )


# ============================================================
# SAVE FILE
# ============================================================

async def save_file(file: UploadFile) -> str:
    validate_file(file)

    # --------------------------------------------------------
    # Create upload directory
    # --------------------------------------------------------
    UPLOAD_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    # --------------------------------------------------------
    # Get safe extension
    # --------------------------------------------------------
    extension = Path(file.filename).suffix.lower()

    # --------------------------------------------------------
    # Generate server-side filename
    # --------------------------------------------------------
    stored_name = f"{uuid4().hex}{extension}"

    file_path = UPLOAD_DIR / stored_name

    # --------------------------------------------------------
    # Read file
    # --------------------------------------------------------
    content = await file.read()

    # --------------------------------------------------------
    # Validate file size
    # --------------------------------------------------------
    if len(content) > MAX_FILE_SIZE:
        raise ValueError(
            "File size must not exceed 10 MB"
        )

    # --------------------------------------------------------
    # Prevent unexpected path traversal
    # --------------------------------------------------------
    resolved_upload_dir = UPLOAD_DIR.resolve()
    resolved_file_path = file_path.resolve()

    if resolved_upload_dir not in resolved_file_path.parents:
        raise ValueError(
            "Invalid file path"
        )

    # --------------------------------------------------------
    # Write file
    # --------------------------------------------------------
    file_path.write_bytes(content)

    return str(file_path)

