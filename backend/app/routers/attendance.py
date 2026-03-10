import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..middleware.auth import get_current_user
from ..models.attendance import AttendanceRecord, AttendanceSession
from ..models.class_ import Class, Student
from ..models.user import User
from ..schemas.attendance import (
    AttendanceSessionCreate,
    AttendanceSessionDetailResponse,
    AttendanceSessionResponse,
)

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


def _get_owned_class(class_id: int, current_user: User, db: Session) -> Class:
    c = db.query(Class).filter(Class.id == class_id).first()
    if c is None:
        raise HTTPException(status_code=404, detail="Class not found")
    if c.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return c


@router.post(
    "/sessions", response_model=AttendanceSessionDetailResponse, status_code=201
)
def create_session(
    body: AttendanceSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cls = _get_owned_class(body.class_id, current_user, db)

    # Validate all student_ids belong to this class
    class_student_ids = {
        s.id
        for s in db.query(Student.id).filter(Student.class_id == body.class_id).all()
    }
    foreign_ids = {r.student_id for r in body.records} - class_student_ids
    if foreign_ids:
        raise HTTPException(
            status_code=422,
            detail=f"Students not in this class: {sorted(foreign_ids)}",
        )

    session = AttendanceSession(
        class_id=body.class_id,
        date=body.date,
        period=cls.period,
        taken_by=current_user.id,
    )
    db.add(session)
    try:
        db.flush()  # get session.id; raises IntegrityError on duplicate (class_id, date)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Attendance for this class on this date has already been submitted",
        )

    records = [
        AttendanceRecord(
            session_id=session.id,
            student_id=r.student_id,
            status=r.status,
        )
        for r in body.records
    ]
    db.add_all(records)
    db.commit()
    db.refresh(session)

    return AttendanceSessionDetailResponse(
        id=session.id,
        class_id=session.class_id,
        date=session.date,
        period=session.period,
        taken_by=session.taken_by,
        created_at=session.created_at,
        records=records,
    )


@router.get("/sessions", response_model=list[AttendanceSessionResponse])
def list_sessions(
    class_id: int | None = None,
    date: datetime.date | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Only sessions for classes owned by the current teacher
    query = (
        db.query(AttendanceSession)
        .join(Class, Class.id == AttendanceSession.class_id)
        .filter(Class.teacher_id == current_user.id)
    )
    if class_id is not None:
        query = query.filter(AttendanceSession.class_id == class_id)
    if date is not None:
        query = query.filter(AttendanceSession.date == date)
    return query.all()
