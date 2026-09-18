
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Approval, ApprovalHistory, User
from app.services.audit_log_service import AuditLogService
from app.services.notification_service import NotificationService


class ApprovalService:

    # ---------------------------------------------------------
    # CREATE APPROVAL
    # ---------------------------------------------------------
    @staticmethod
    def create_approval(
        db: Session,
        title: str,
        description: str | None,
        current_user: User,
    ):
        # Only employees can submit approval requests
        if current_user.role != "employee":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only employees can submit approval requests",
            )

        approval = Approval(
            title=title,
            description=description,
            requested_by=current_user.id,
            status="pending",
            current_level="manager",
        )

        db.add(approval)
        db.flush()

        # -----------------------------------------------------
        # AUDIT LOG - APPROVAL CREATED
        # -----------------------------------------------------

        AuditLogService.create_log(
            db=db,
            user_id=current_user.id,
            action="APPROVAL_CREATED",
            entity="Approval",
            entity_id=approval.id,
        )

        db.commit()
        db.refresh(approval)

        # -----------------------------------------------------
        # NOTIFY ACTIVE MANAGERS
        # -----------------------------------------------------

        managers = list(
            db.scalars(
                select(User).where(
                    User.role == "manager",
                    User.is_active.is_(True),
                )
            ).all()
        )

        for manager in managers:
            NotificationService.create_notification(
                db=db,
                user_id=manager.id,
                message=(
                    f"New approval request '{approval.title}' "
                    f"submitted by {current_user.name}"
                ),
            )

        return approval

    # ---------------------------------------------------------
    # GET APPROVALS
    # ---------------------------------------------------------
    @staticmethod
    def get_approvals(
        db: Session,
        current_user: User,
    ):
        if current_user.role == "admin":

            # Admin can view all approval requests
            query = select(Approval)

        elif current_user.role == "manager":

            # Manager can see requests waiting for manager approval
            query = select(Approval).where(
                Approval.current_level == "manager",
                Approval.status == "pending",
            )

        else:

            # Employee can see only their own requests
            query = select(Approval).where(
                Approval.requested_by == current_user.id
            )

        return list(
            db.scalars(
                query.order_by(Approval.id.desc())
            ).all()
        )

    # ---------------------------------------------------------
    # GET SINGLE APPROVAL
    # ---------------------------------------------------------
    @staticmethod
    def get_approval(
        db: Session,
        approval_id: int,
    ):
        approval = db.get(Approval, approval_id)

        if approval is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Approval not found",
            )

        return approval

    # ---------------------------------------------------------
    # APPROVE / REJECT / HOLD
    # ---------------------------------------------------------
    @staticmethod
    def take_action(
        db: Session,
        approval: Approval,
        current_user: User,
        action: str,
        comment: str | None,
    ):
        action = action.lower().strip()

        allowed_actions = {
            "approve",
            "reject",
            "hold",
        }

        # -----------------------------------------------------
        # VALIDATE ACTION
        # -----------------------------------------------------

        if action not in allowed_actions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Action must be approve, reject, or hold",
            )

        # -----------------------------------------------------
        # ROLE VALIDATION
        # -----------------------------------------------------

        if current_user.role not in {"manager", "admin"}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only managers and admins can "
                    "take approval actions"
                ),
            )

        # -----------------------------------------------------
        # APPROVAL STATUS VALIDATION
        # -----------------------------------------------------

        if approval.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This approval is no longer pending",
            )

        # -----------------------------------------------------
        # MANAGER LEVEL VALIDATION
        # -----------------------------------------------------

        if (
            current_user.role == "manager"
            and approval.current_level != "manager"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "This approval is not waiting "
                    "for manager action"
                ),
            )

        # -----------------------------------------------------
        # ADMIN LEVEL VALIDATION
        # -----------------------------------------------------

        if (
            current_user.role == "admin"
            and approval.current_level != "admin"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "This approval is not waiting "
                    "for admin action"
                ),
            )

        # -----------------------------------------------------
        # REJECTION COMMENT VALIDATION
        # -----------------------------------------------------

        if action == "reject":
            if not comment or not comment.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Comment is mandatory when "
                        "rejecting an approval"
                    ),
                )

        # -----------------------------------------------------
        # CREATE APPROVAL HISTORY
        # -----------------------------------------------------

        history = ApprovalHistory(
            approval_id=approval.id,
            action_by=current_user.id,
            action=action,
            comment=comment,
        )

        db.add(history)

        # -----------------------------------------------------
        # REJECT
        # -----------------------------------------------------

        if action == "reject":

            approval.status = "rejected"

            NotificationService.create_notification(
                db=db,
                user_id=approval.requested_by,
                message=(
                    f"Your approval request "
                    f"'{approval.title}' was rejected by "
                    f"{current_user.name}"
                ),
            )

        # -----------------------------------------------------
        # HOLD
        # -----------------------------------------------------

        elif action == "hold":

            approval.status = "on_hold"

            NotificationService.create_notification(
                db=db,
                user_id=approval.requested_by,
                message=(
                    f"Your approval request "
                    f"'{approval.title}' was put on hold by "
                    f"{current_user.name}"
                ),
            )

        # -----------------------------------------------------
        # APPROVE
        # -----------------------------------------------------

        elif action == "approve":

            # -------------------------------------------------
            # MANAGER APPROVAL → ADMIN
            # -------------------------------------------------

            if current_user.role == "manager":

                approval.current_level = "admin"
                approval.status = "pending"

                admins = list(
                    db.scalars(
                        select(User).where(
                            User.role == "admin",
                            User.is_active.is_(True),
                        )
                    ).all()
                )

                for admin in admins:
                    NotificationService.create_notification(
                        db=db,
                        user_id=admin.id,
                        message=(
                            f"Approval '{approval.title}' "
                            f"was approved by manager "
                            f"{current_user.name} and is waiting "
                            f"for admin approval"
                        ),
                    )

                NotificationService.create_notification(
                    db=db,
                    user_id=approval.requested_by,
                    message=(
                        f"Your approval request "
                        f"'{approval.title}' was approved by "
                        f"manager {current_user.name} and moved "
                        f"to admin review"
                    ),
                )

            # -------------------------------------------------
            # ADMIN APPROVAL → COMPLETED
            # -------------------------------------------------

            elif current_user.role == "admin":

                approval.status = "approved"
                approval.current_level = "completed"

                NotificationService.create_notification(
                    db=db,
                    user_id=approval.requested_by,
                    message=(
                        f"Your approval request "
                        f"'{approval.title}' was finally "
                        f"approved by admin "
                        f"{current_user.name}"
                    ),
                )

        # -----------------------------------------------------
        # AUDIT LOG - APPROVAL ACTION
        # -----------------------------------------------------

        AuditLogService.create_log(
            db=db,
            user_id=current_user.id,
            action=f"APPROVAL_{action.upper()}",
            entity="Approval",
            entity_id=approval.id,
        )

        # -----------------------------------------------------
        # SAVE APPROVAL + HISTORY
        # -----------------------------------------------------

        db.commit()
        db.refresh(approval)

        return approval

    # ---------------------------------------------------------
    # GET APPROVAL HISTORY
    # ---------------------------------------------------------
    @staticmethod
    def get_history(
        db: Session,
        approval: Approval,
    ):
        query = (
            select(ApprovalHistory)
            .where(
                ApprovalHistory.approval_id == approval.id
            )
            .order_by(ApprovalHistory.id.asc())
        )

        return list(
            db.scalars(query).all()
        )

