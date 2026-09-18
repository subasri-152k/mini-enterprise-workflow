from pydantic import BaseModel


class AISummaryResponse(BaseModel):
    summary: str
    pending_tasks: int
    high_priority_tasks: int
    overdue_tasks: int