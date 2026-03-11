"""Cascade delete sessions, records, and students when a class is deleted.

Revision ID: 007_class_cascade
Revises: 006_student_cascade
Create Date: 2026-03-11 00:00:00.000000
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "007_class_cascade"
down_revision = "006_student_cascade"
branch_labels = None
depends_on = None


def upgrade():
    # attendance_sessions.class_id → classes.id
    op.drop_constraint(
        "attendance_sessions_class_id_fkey", "attendance_sessions", type_="foreignkey"
    )
    op.create_foreign_key(
        "attendance_sessions_class_id_fkey",
        "attendance_sessions",
        "classes",
        ["class_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # attendance_records.session_id → attendance_sessions.id
    op.drop_constraint(
        "attendance_records_session_id_fkey", "attendance_records", type_="foreignkey"
    )
    op.create_foreign_key(
        "attendance_records_session_id_fkey",
        "attendance_records",
        "attendance_sessions",
        ["session_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # students.class_id → classes.id
    op.drop_constraint("students_class_id_fkey", "students", type_="foreignkey")
    op.create_foreign_key(
        "students_class_id_fkey",
        "students",
        "classes",
        ["class_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade():
    op.drop_constraint("students_class_id_fkey", "students", type_="foreignkey")
    op.create_foreign_key(
        "students_class_id_fkey", "students", "classes", ["class_id"], ["id"]
    )

    op.drop_constraint(
        "attendance_records_session_id_fkey", "attendance_records", type_="foreignkey"
    )
    op.create_foreign_key(
        "attendance_records_session_id_fkey",
        "attendance_records",
        "attendance_sessions",
        ["session_id"],
        ["id"],
    )

    op.drop_constraint(
        "attendance_sessions_class_id_fkey", "attendance_sessions", type_="foreignkey"
    )
    op.create_foreign_key(
        "attendance_sessions_class_id_fkey",
        "attendance_sessions",
        "classes",
        ["class_id"],
        ["id"],
    )
