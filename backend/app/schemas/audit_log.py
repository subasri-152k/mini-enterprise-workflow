from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    entity: str
    entity_id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)