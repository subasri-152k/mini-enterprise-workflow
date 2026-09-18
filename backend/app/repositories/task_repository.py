from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Task


class TaskRepository:

    @staticmethod
    def create(
        db: Session,
        task: Task,
    ) -> Task:
        db.add(task)
        db.commit()
        db.refresh(task)

        return task

    @staticmethod
    def get_by_id(
        db: Session,
        task_id: int,
    ) -> Task | None:
        return db.get(Task, task_id)

    @staticmethod
    def get_all(
        db: Session,
    ) -> list[Task]:
        return list(
            db.scalars(
                select(Task).order_by(Task.id.desc())
            ).all()
        )

    @staticmethod
    def update(
        db: Session,
        task: Task,
    ) -> Task:
        db.commit()
        db.refresh(task)

        return task

    @staticmethod
    def delete(
        db: Session,
        task: Task,
    ) -> None:
        db.delete(task)
        db.commit()