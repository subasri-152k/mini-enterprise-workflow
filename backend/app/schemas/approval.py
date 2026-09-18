from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ApprovalCreate(BaseModel):
    title: str
    description: str | None = None


class ApprovalResponse(BaseModel):
    id: int
    title: str
    description: str | None
    requested_by: int
    status: str
    current_level: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApprovalAction(BaseModel):
    action: str
    comment: str | None = None


class ApprovalHistoryResponse(BaseModel):
    id: int
    approval_id: int
    action_by: int
    action: str
    comment: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)