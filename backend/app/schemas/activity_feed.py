from datetime import datetime

from pydantic import BaseModel


class ActivityFeedResponse(BaseModel):
    id: int
    task_id: int
    task_title: str
    user_id: int
    user_name: str
    action: str
    description: str | None = None
    created_at: datetime