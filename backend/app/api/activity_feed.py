from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.activity_feed import ActivityFeedResponse
from app.services.activity_feed_service import ActivityFeedService


router = APIRouter(
    prefix="/activity-feed",
    tags=["Activity Feed"],
)


@router.get(
    "/",
    response_model=list[ActivityFeedResponse],
)
def get_activity_feed(
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ActivityFeedService.get_activity_feed(
        db=db,
        current_user=current_user,
        limit=limit,
    )