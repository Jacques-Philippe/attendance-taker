import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from alembic import command as alembic_command
from alembic.config import Config as AlembicConfig
from app.database import Base, get_engine
from app.models.user import User
from app.services.auth import hash_password

_ALEMBIC_INI = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "alembic.ini")
)

TEACHER_A = {"username": "rep_teacher_a", "password": "passA1234"}
TEACHER_B = {"username": "rep_teacher_b", "password": "passB1234"}

DATE_1 = "2026-03-01"
DATE_2 = "2026-03-02"


@pytest.fixture(scope="module", autouse=True)
def setup_db(app):
    alembic_command.upgrade(AlembicConfig(_ALEMBIC_INI), "head")

    engine = get_engine()
    db = sessionmaker(bind=engine)()
    db.add(
        User(
            username=TEACHER_A["username"],
            password_hash=hash_password(TEACHER_A["password"]),
            role="teacher",
        )
    )
    db.add(
        User(
            username=TEACHER_B["username"],
            password_hash=hash_password(TEACHER_B["password"]),
            role="teacher",
        )
    )
    db.commit()
    db.close()

    yield

    alembic_command.downgrade(AlembicConfig(_ALEMBIC_INI), "base")
    Base.metadata.drop_all(engine)


def _logged_in(app, credentials):
    c = TestClient(app)
    resp = c.post("/api/auth/login", json=credentials)
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return c


@pytest.fixture
def client_a(app):
    return _logged_in(app, TEACHER_A)


@pytest.fixture
def client_b(app):
    return _logged_in(app, TEACHER_B)


@pytest.fixture
def seeded(client_a):
    """
    Creates a class owned by teacher A with two students, then submits two
    attendance sessions (DATE_1 and DATE_2).  Returns ids for reuse.
    """
    r_cls = client_a.post("/api/classes/", json={"name": "Biology", "period": "2nd"})
    class_id = r_cls.json()["id"]
    s1 = client_a.post(f"/api/classes/{class_id}/students", json={"name": "Alice"})
    s2 = client_a.post(f"/api/classes/{class_id}/students", json={"name": "Bob"})
    student_ids = [s1.json()["id"], s2.json()["id"]]

    # Session 1: Alice present, Bob absent
    r1 = client_a.post(
        "/api/attendance/sessions",
        json={
            "class_id": class_id,
            "date": DATE_1,
            "records": [
                {"student_id": student_ids[0], "status": "present"},
                {"student_id": student_ids[1], "status": "absent"},
            ],
        },
    )
    # Session 2: Alice late, Bob present
    r2 = client_a.post(
        "/api/attendance/sessions",
        json={
            "class_id": class_id,
            "date": DATE_2,
            "records": [
                {"student_id": student_ids[0], "status": "late"},
                {"student_id": student_ids[1], "status": "present"},
            ],
        },
    )
    return {
        "class_id": class_id,
        "student_ids": student_ids,
        "session_ids": [r1.json()["id"], r2.json()["id"]],
    }


# ---------------------------------------------------------------------------
# GET /api/attendance/sessions/{id}
# ---------------------------------------------------------------------------


def test_get_session_as_owner(client_a, seeded):
    session_id = seeded["session_ids"][0]
    r = client_a.get(f"/api/attendance/sessions/{session_id}")
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == session_id
    assert data["classId"] == seeded["class_id"]
    assert data["date"] == DATE_1
    assert len(data["records"]) == 2


def test_get_session_as_non_owner(client_b, seeded):
    session_id = seeded["session_ids"][0]
    r = client_b.get(f"/api/attendance/sessions/{session_id}")
    assert r.status_code == 403


def test_get_session_unknown_id(client_a):
    r = client_a.get("/api/attendance/sessions/99999")
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# GET /api/attendance/reports
# ---------------------------------------------------------------------------


def test_get_reports_as_owner(client_a, seeded):
    class_id = seeded["class_id"]
    r = client_a.get(f"/api/attendance/reports?class_id={class_id}")
    assert r.status_code == 200
    data = r.json()
    assert data["classId"] == class_id
    assert data["totalSessions"] == 2

    # Alice: 1 present + 1 late
    alice = next(s for s in data["students"] if s["studentName"] == "Alice")
    assert alice["total"] == 2
    assert alice["present"] == 1
    assert alice["late"] == 1
    assert alice["absent"] == 0
    assert alice["excused"] == 0

    # Bob: 1 absent + 1 present
    bob = next(s for s in data["students"] if s["studentName"] == "Bob")
    assert bob["total"] == 2
    assert bob["present"] == 1
    assert bob["absent"] == 1


def test_get_reports_as_non_owner(client_b, seeded):
    r = client_b.get(f"/api/attendance/reports?class_id={seeded['class_id']}")
    assert r.status_code == 403


def test_get_reports_missing_class_id(client_a):
    r = client_a.get("/api/attendance/reports")
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# GET /api/attendance/student/{id}
# ---------------------------------------------------------------------------


def test_get_student_history_as_owner(client_a, seeded):
    student_id = seeded["student_ids"][0]  # Alice
    r = client_a.get(f"/api/attendance/student/{student_id}")
    assert r.status_code == 200
    data = r.json()
    assert data["studentName"] == "Alice"
    assert data["classId"] == seeded["class_id"]
    assert len(data["records"]) == 2
    # Records should be in descending date order
    dates = [rec["date"] for rec in data["records"]]
    assert dates == sorted(dates, reverse=True)


def test_get_student_history_as_non_owner(client_b, seeded):
    student_id = seeded["student_ids"][0]
    r = client_b.get(f"/api/attendance/student/{student_id}")
    assert r.status_code == 403


def test_get_student_history_unknown_id(client_a):
    r = client_a.get("/api/attendance/student/99999")
    assert r.status_code == 404
