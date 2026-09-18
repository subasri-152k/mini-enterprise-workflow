from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class CommentCreate(BaseModel):
    content: str = Field(
        ...,
        min_length=1,
        max_length=5000,
    )

    is_internal: bool = False


class CommentResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    content: str
    is_internal: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )