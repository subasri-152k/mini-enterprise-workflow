from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models import User
from app.schemas.approval import (
    ApprovalAction,
    ApprovalCreate,
    ApprovalHistoryResponse,
    ApprovalResponse,
)
from app.services.approval_service import ApprovalService


router = APIRouter(
    prefix="/approvals",
    tags=["Approvals"],
)


# ============================================================
# CREATE APPROVAL
# ============================================================

@router.post(
    "/",
    response_model=ApprovalResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_approval(
    approval_data: ApprovalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ApprovalService.create_approval(
        db=db,
        title=approval_data.title,
        description=approval_data.description,
        current_user=current_user,
    )


# ============================================================
# GET APPROVALS
# ============================================================

@router.get(
    "/",
    response_model=list[ApprovalResponse],
)
def get_approvals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ApprovalService.get_approvals(
        db=db,
        current_user=current_user,
    )


# ============================================================
# APPROVAL ACTION
# APPROVE / REJECT / HOLD
# ============================================================

@router.patch(
    "/{approval_id}/action",
    response_model=ApprovalResponse,
)
def approval_action(
    approval_id: int,
    action_data: ApprovalAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    approval = ApprovalService.get_approval(
        db=db,
        approval_id=approval_id,
    )

    return ApprovalService.take_action(
        db=db,
        approval=approval,
        current_user=current_user,
        action=action_data.action,
        comment=action_data.comment,
    )


# ============================================================
# GET APPROVAL HISTORY
# ============================================================

@router.get(
    "/{approval_id}/history",
    response_model=list[ApprovalHistoryResponse],
)
def get_approval_history(
    approval_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    approval = ApprovalService.get_approval(
        db=db,
        approval_id=approval_id,
    )

    return ApprovalService.get_history(
        db=db,
        approval=approval,
    )