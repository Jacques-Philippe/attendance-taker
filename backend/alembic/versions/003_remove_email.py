"""Remove email column from users table.

Revision ID: 003_remove_email
Revises: 002_sessions
Create Date: 2026-03-07 00:00:00.000000
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "003_remove_email"
down_revision = "002_sessions"
branch_labels = None
depends_on = None


def upgrade():
    """Drop email column from users."""
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("email")


def downgrade():
    """Re-add email column to users."""
    import sqlalchemy as sa

    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("email", sa.String(), nullable=True))
        batch_op.create_unique_constraint("uq_users_email", ["email"])
