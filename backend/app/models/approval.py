from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    title = Column(
        String(255),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    requested_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    status = Column(
        String(50),
        nullable=False,
        default="pending",
        index=True,
    )

    current_level = Column(
        String(50),
        nullable=False,
        default="manager",
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    history = relationship(
        "ApprovalHistory",
        back_populates="approval",
        cascade="all, delete-orphan",
    )


class ApprovalHistory(Base):
    __tablename__ = "approval_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    approval_id = Column(
        Integer,
        ForeignKey("approvals.id"),
        nullable=False,
        index=True,
    )

    action_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    action = Column(
        String(50),
        nullable=False,
    )

    comment = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    approval = relationship(
        "Approval",
        back_populates="history",
    )