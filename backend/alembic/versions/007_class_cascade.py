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
    # SQLite does not enforce foreign keys, so skip constraint changes there.
    if op.get_bind().dialect.name == "sqlite":
        return

    with op.batch_alter_table("attendance_sessions") as batch_op:
        batch_op.drop_constraint(
            "attendance_sessions_class_id_fkey", type_="foreignkey"
        )
        batch_op.create_foreign_key(
            "attendance_sessions_class_id_fkey",
            "classes",
            ["class_id"],
            ["id"],
            ondelete="CASCADE",
        )

    with op.batch_alter_table("attendance_records") as batch_op:
        batch_op.drop_constraint(
            "attendance_records_session_id_fkey", type_="foreignkey"
        )
        batch_op.create_foreign_key(
            "attendance_records_session_id_fkey",
            "attendance_sessions",
            ["session_id"],
            ["id"],
            ondelete="CASCADE",
        )

    with op.batch_alter_table("students") as batch_op:
        batch_op.drop_constraint("students_class_id_fkey", type_="foreignkey")
        batch_op.create_foreign_key(
            "students_class_id_fkey",
            "classes",
            ["class_id"],
            ["id"],
            ondelete="CASCADE",
        )


def downgrade():
    if op.get_bind().dialect.name == "sqlite":
        return

    with op.batch_alter_table("students") as batch_op:
        batch_op.drop_constraint("students_class_id_fkey", type_="foreignkey")
        batch_op.create_foreign_key(
            "students_class_id_fkey", "classes", ["class_id"], ["id"]
        )

    with op.batch_alter_table("attendance_records") as batch_op:
        batch_op.drop_constraint(
            "attendance_records_session_id_fkey", type_="foreignkey"
        )
        batch_op.create_foreign_key(
            "attendance_records_session_id_fkey",
            "attendance_sessions",
            ["session_id"],
            ["id"],
        )

    with op.batch_alter_table("attendance_sessions") as batch_op:
        batch_op.drop_constraint(
            "attendance_sessions_class_id_fkey", type_="foreignkey"
        )
        batch_op.create_foreign_key(
            "attendance_sessions_class_id_fkey",
            "classes",
            ["class_id"],
            ["id"],
        )
