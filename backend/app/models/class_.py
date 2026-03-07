from sqlalchemy import Column, ForeignKey, Integer, String

from ..database import Base


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    name = Column(String, nullable=False)
    period = Column(String, nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)


class Enrollment(Base):
    __tablename__ = "enrollments"

    class_id = Column(Integer, ForeignKey("classes.id"), primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
