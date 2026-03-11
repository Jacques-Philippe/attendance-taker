"""Cascade delete attendance_records when a student is deleted.

Revision ID: 006_cascade_delete_attendance_records
Revises: 005_attendance
Create Date: 2026-03-11 00:00:00.000000
"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "006_student_cascade"
down_revision = "005_attendance"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint(
        "attendance_records_student_id_fkey", "attendance_records", type_="foreignkey"
    )
    op.create_foreign_key(
        "attendance_records_student_id_fkey",
        "attendance_records",
        "students",
        ["student_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade():
    op.drop_constraint(
        "attendance_records_student_id_fkey", "attendance_records", type_="foreignkey"
    )
    op.create_foreign_key(
        "attendance_records_student_id_fkey",
        "attendance_records",
        "students",
        ["student_id"],
        ["id"],
    )
