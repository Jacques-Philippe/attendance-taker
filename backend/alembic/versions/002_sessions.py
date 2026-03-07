"""Add sessions table.

Revision ID: 002_sessions
Revises: 001_initial
Create Date: 2026-03-07 00:00:00.000000
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "002_sessions"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade():
    """Create sessions table."""
    op.create_table(
        "sessions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("token", sa.String(), nullable=False, unique=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade():
    """Drop sessions table."""
    op.drop_table("sessions")
