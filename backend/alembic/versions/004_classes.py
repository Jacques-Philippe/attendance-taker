"""Create classes and students tables.

Revision ID: 004_classes
Revises: 003_remove_email
Create Date: 2026-03-08 00:00:00.000000
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "004_classes"
down_revision = "003_remove_email"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "classes",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("period", sa.String(), nullable=False),
        sa.Column(
            "teacher_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False
        ),
    )
    op.create_table(
        "students",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column(
            "class_id", sa.Integer(), sa.ForeignKey("classes.id"), nullable=False
        ),
    )


def downgrade():
    op.drop_table("students")
    op.drop_table("classes")
