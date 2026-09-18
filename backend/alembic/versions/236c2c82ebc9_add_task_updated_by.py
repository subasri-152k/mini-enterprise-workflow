"""add task updated by

Revision ID: 236c2c82ebc9
Revises: 4139845d9bd5
Create Date: 2026-09-08 11:37:30.472575

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa



revision: str = '236c2c82ebc9'
down_revision: Union[str, Sequence[str], None] = '4139845d9bd5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
   
    op.add_column('tasks', sa.Column('updated_by_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'tasks', 'users', ['updated_by_id'], ['id'])
    


def downgrade() -> None:
    """Downgrade schema."""
   
    op.drop_constraint(None, 'tasks', type_='foreignkey')
    op.drop_column('tasks', 'updated_by_id')
    
