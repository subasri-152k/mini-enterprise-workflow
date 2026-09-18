from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import TaskPriority, TaskStatus


class TaskCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    description: str | None = Field(
        default=None,
        max_length=5000,
    )

    status: TaskStatus = TaskStatus.TODO

    priority: TaskPriority = TaskPriority.MEDIUM

    due_date: datetime | None = None

    assigned_to_id: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    description: str | None = Field(
        default=None,
        max_length=5000,
    )

    status: TaskStatus | None = None

    priority: TaskPriority | None = None

    due_date: datetime | None = None

    assigned_to_id: int | None = None


class TaskAssign(BaseModel):
    assigned_to_id: int


class TaskResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    title: str
    description: str | None
    status: TaskStatus
    priority: TaskPriority
    due_date: datetime | None

    created_by_id: int
    assigned_to_id: int | None
    updated_by: int | None

    created_at: datetime
    updated_at: datetime