from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..middleware.auth import get_current_user
from ..models.class_ import Class, Student
from ..models.user import User
from ..schemas.class_ import (
    ClassCreate,
    ClassDetailResponse,
    ClassResponse,
    ClassUpdate,
    StudentCreate,
    StudentResponse,
    StudentUpdate,
)

router = APIRouter(prefix="/api/classes", tags=["classes"])


def _get_owned_class(class_id: int, current_user: User, db: Session) -> Class:
    c = db.query(Class).filter(Class.id == class_id).first()
    if c is None:
        raise HTTPException(status_code=404, detail="Class not found")
    if c.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return c


@router.get("/", response_model=list[ClassResponse])
def list_classes(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return db.query(Class).filter(Class.teacher_id == current_user.id).all()


@router.post("/", response_model=ClassResponse, status_code=201)
def create_class(
    body: ClassCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    c = Class(name=body.name, period=body.period, teacher_id=current_user.id)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.get("/{class_id}", response_model=ClassDetailResponse)
def get_class(
    class_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    c = _get_owned_class(class_id, current_user, db)
    students = db.query(Student).filter(Student.class_id == class_id).all()
    return ClassDetailResponse(
        id=c.id,
        name=c.name,
        period=c.period,
        teacher_id=c.teacher_id,
        students=students,
    )


@router.patch("/{class_id}", response_model=ClassResponse)
def update_class(
    class_id: int,
    body: ClassUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    c = _get_owned_class(class_id, current_user, db)
    if body.name is not None:
        c.name = body.name
    if body.period is not None:
        c.period = body.period
    db.commit()
    db.refresh(c)
    return c


@router.delete("/{class_id}", status_code=204)
def delete_class(
    class_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    c = _get_owned_class(class_id, current_user, db)
    db.query(Student).filter(Student.class_id == class_id).delete()
    db.delete(c)
    db.commit()


@router.post("/{class_id}/students", response_model=StudentResponse, status_code=201)
def add_student(
    class_id: int,
    body: StudentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_owned_class(class_id, current_user, db)
    student = Student(name=body.name, class_id=class_id)
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


def _get_owned_student(
    class_id: int, student_id: int, current_user: User, db: Session
) -> Student:
    _get_owned_class(class_id, current_user, db)
    student = (
        db.query(Student)
        .filter(Student.id == student_id, Student.class_id == class_id)
        .first()
    )
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.patch("/{class_id}/students/{student_id}", response_model=StudentResponse)
def update_student(
    class_id: int,
    student_id: int,
    body: StudentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = _get_owned_student(class_id, student_id, current_user, db)
    student.name = body.name
    db.commit()
    db.refresh(student)
    return student


@router.delete("/{class_id}/students/{student_id}", status_code=204)
def delete_student(
    class_id: int,
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = _get_owned_student(class_id, student_id, current_user, db)
    db.delete(student)
    db.commit()
