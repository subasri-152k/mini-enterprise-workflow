from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    id: int
    file_name: str
    file_path: str
    version: int
    uploaded_by: int
    task_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)