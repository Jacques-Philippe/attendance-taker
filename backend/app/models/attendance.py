import enum

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from ..database import Base


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"
    excused = "excused"


class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"
    __table_args__ = (
        UniqueConstraint("class_id", "date", name="uq_attendance_sessions_class_date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(
        Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False
    )
    date = Column(Date, nullable=False)
    period = Column(String, nullable=False)
    taken_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(
        Integer,
        ForeignKey("attendance_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    student_id = Column(
        Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    status = Column(Enum(AttendanceStatus), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
