"""Create attendance_sessions and attendance_records tables.

Revision ID: 005_attendance
Revises: 004_classes
Create Date: 2026-03-08 00:00:00.000000
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "005_attendance"
down_revision = "004_classes"
branch_labels = None
depends_on = None

attendance_status = sa.Enum(
    "present", "absent", "late", "excused", name="attendancestatus"
)


def upgrade():
    op.create_table(
        "attendance_sessions",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column(
            "class_id", sa.Integer(), sa.ForeignKey("classes.id"), nullable=False
        ),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("period", sa.String(), nullable=False),
        sa.Column("taken_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
        sa.UniqueConstraint(
            "class_id", "date", name="uq_attendance_sessions_class_date"
        ),
    )
    op.create_table(
        "attendance_records",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column(
            "session_id",
            sa.Integer(),
            sa.ForeignKey("attendance_sessions.id"),
            nullable=False,
        ),
        sa.Column(
            "student_id", sa.Integer(), sa.ForeignKey("students.id"), nullable=False
        ),
        sa.Column("status", attendance_status, nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
    )


def downgrade():
    op.drop_table("attendance_records")
    op.drop_table("attendance_sessions")
    attendance_status.drop(op.get_bind(), checkfirst=True)
