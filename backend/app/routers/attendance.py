import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..middleware.auth import get_current_user
from ..models.attendance import AttendanceRecord, AttendanceSession, AttendanceStatus
from ..models.class_ import Class, Student
from ..models.user import User
from ..schemas.attendance import (
    AttendanceSessionCreate,
    AttendanceSessionDetailResponse,
    AttendanceSessionResponse,
    ClassReportResponse,
    StudentAttendanceSummary,
    StudentHistoryResponse,
    StudentSessionRecord,
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


@router.get("/sessions/{session_id}", response_model=AttendanceSessionDetailResponse)
def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = (
        db.query(AttendanceSession).filter(AttendanceSession.id == session_id).first()
    )
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    cls = db.query(Class).filter(Class.id == session.class_id).first()
    if cls.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    records = (
        db.query(AttendanceRecord)
        .filter(AttendanceRecord.session_id == session_id)
        .all()
    )
    return AttendanceSessionDetailResponse(
        id=session.id,
        class_id=session.class_id,
        date=session.date,
        period=session.period,
        taken_by=session.taken_by,
        created_at=session.created_at,
        records=records,
    )


@router.get("/reports", response_model=ClassReportResponse)
def get_reports(
    class_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cls = _get_owned_class(class_id, current_user, db)

    sessions = (
        db.query(AttendanceSession).filter(AttendanceSession.class_id == class_id).all()
    )
    total_sessions = len(sessions)
    session_ids = [s.id for s in sessions]

    students = db.query(Student).filter(Student.class_id == class_id).all()

    # Count records per student per status
    counts: dict[int, dict[str, int]] = {
        s.id: {"present": 0, "absent": 0, "late": 0, "excused": 0} for s in students
    }
    if session_ids:
        records = (
            db.query(AttendanceRecord)
            .filter(AttendanceRecord.session_id.in_(session_ids))
            .all()
        )
        for r in records:
            counts[r.student_id][r.status.value] += 1

    student_summaries = [
        StudentAttendanceSummary(
            student_id=s.id,
            student_name=s.name,
            total=sum(counts[s.id].values()),
            present=counts[s.id]["present"],
            absent=counts[s.id]["absent"],
            late=counts[s.id]["late"],
            excused=counts[s.id]["excused"],
        )
        for s in students
    ]

    return ClassReportResponse(
        class_id=cls.id,
        class_name=cls.name,
        period=cls.period,
        total_sessions=total_sessions,
        students=student_summaries,
    )


@router.get("/student/{student_id}", response_model=StudentHistoryResponse)
def get_student_history(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    cls = db.query(Class).filter(Class.id == student.class_id).first()
    if cls.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    rows = (
        db.query(AttendanceRecord, AttendanceSession)
        .join(AttendanceSession, AttendanceSession.id == AttendanceRecord.session_id)
        .filter(AttendanceRecord.student_id == student_id)
        .order_by(AttendanceSession.date.desc())
        .all()
    )
    records = [
        StudentSessionRecord(
            session_id=session.id,
            date=session.date,
            period=session.period,
            status=record.status,
        )
        for record, session in rows
    ]

    return StudentHistoryResponse(
        student_id=student.id,
        student_name=student.name,
        class_id=cls.id,
        class_name=cls.name,
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
