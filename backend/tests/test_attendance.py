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

TEACHER_A = {"username": "att_teacher_a", "password": "passA1234"}
TEACHER_B = {"username": "att_teacher_b", "password": "passB1234"}

DATE_1 = "2026-01-15"
DATE_2 = "2026-01-16"


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
def class_with_students(client_a):
    """Creates a class owned by teacher A with two students."""
    r = client_a.post("/api/classes/", json={"name": "Math", "period": "1st"})
    class_id = r.json()["id"]
    s1 = client_a.post(f"/api/classes/{class_id}/students", json={"name": "Alice"})
    s2 = client_a.post(f"/api/classes/{class_id}/students", json={"name": "Bob"})
    return {
        "class_id": class_id,
        "student_ids": [s1.json()["id"], s2.json()["id"]],
    }


def _session_payload(class_id, date, student_ids, status="present"):
    return {
        "class_id": class_id,
        "date": date,
        "records": [{"student_id": sid, "status": status} for sid in student_ids],
    }


# ---------------------------------------------------------------------------
# POST /api/attendance/sessions
# ---------------------------------------------------------------------------


def test_create_session_as_owner(client_a, class_with_students):
    payload = _session_payload(
        class_with_students["class_id"],
        DATE_1,
        class_with_students["student_ids"],
    )
    r = client_a.post("/api/attendance/sessions", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["classId"] == class_with_students["class_id"]
    assert data["date"] == DATE_1
    assert data["period"] == "1st"
    assert len(data["records"]) == 2
    assert all(rec["status"] == "present" for rec in data["records"])


def test_create_session_as_non_owner(client_a, client_b, class_with_students):
    payload = _session_payload(
        class_with_students["class_id"],
        DATE_2,
        class_with_students["student_ids"],
    )
    r = client_b.post("/api/attendance/sessions", json=payload)
    assert r.status_code == 403


def test_create_session_unknown_class(client_a):
    payload = _session_payload(99999, DATE_1, [1])
    r = client_a.post("/api/attendance/sessions", json=payload)
    assert r.status_code == 404


def test_create_session_duplicate_date(client_a, class_with_students):
    r_class = client_a.post("/api/classes/", json={"name": "Science", "period": "2nd"})
    class_id = r_class.json()["id"]
    r_s = client_a.post(f"/api/classes/{class_id}/students", json={"name": "Carol"})
    student_ids = [r_s.json()["id"]]

    payload = _session_payload(class_id, DATE_1, student_ids)
    r1 = client_a.post("/api/attendance/sessions", json=payload)
    assert r1.status_code == 201

    r2 = client_a.post("/api/attendance/sessions", json=payload)
    assert r2.status_code == 409


def test_create_session_foreign_student(client_a, class_with_students):
    # Create a second class with its own student
    r2 = client_a.post("/api/classes/", json={"name": "Art", "period": "3rd"})
    other_class_id = r2.json()["id"]
    rs = client_a.post(f"/api/classes/{other_class_id}/students", json={"name": "Dave"})
    foreign_student_id = rs.json()["id"]

    payload = _session_payload(
        class_with_students["class_id"],
        DATE_2,
        [foreign_student_id],
    )
    r = client_a.post("/api/attendance/sessions", json=payload)
    assert r.status_code == 422


def test_create_session_empty_records(client_a, class_with_students):
    payload = {
        "class_id": class_with_students["class_id"],
        "date": DATE_2,
        "records": [],
    }
    r = client_a.post("/api/attendance/sessions", json=payload)
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# GET /api/attendance/sessions
# ---------------------------------------------------------------------------


def test_list_sessions_scoped_to_teacher(client_a, client_b):
    # teacher A creates a class and submits attendance
    r_cls = client_a.post("/api/classes/", json={"name": "History", "period": "4th"})
    class_id = r_cls.json()["id"]
    rs = client_a.post(f"/api/classes/{class_id}/students", json={"name": "Eve"})
    client_a.post(
        "/api/attendance/sessions",
        json=_session_payload(class_id, DATE_1, [rs.json()["id"]]),
    )

    # teacher B should see zero sessions (no classes of their own)
    r_b = client_b.get("/api/attendance/sessions")
    assert r_b.status_code == 200
    assert r_b.json() == []

    # teacher A sees at least one
    r_a = client_a.get("/api/attendance/sessions")
    assert r_a.status_code == 200
    assert len(r_a.json()) >= 1
    assert all(s["takenBy"] for s in r_a.json())


def test_list_sessions_filter_by_class_id(client_a):
    r_cls = client_a.post("/api/classes/", json={"name": "PE", "period": "5th"})
    class_id = r_cls.json()["id"]
    rs = client_a.post(f"/api/classes/{class_id}/students", json={"name": "Frank"})
    client_a.post(
        "/api/attendance/sessions",
        json=_session_payload(class_id, DATE_1, [rs.json()["id"]]),
    )

    r = client_a.get(f"/api/attendance/sessions?class_id={class_id}")
    assert r.status_code == 200
    assert all(s["classId"] == class_id for s in r.json())


def test_list_sessions_filter_by_date(client_a):
    r_cls = client_a.post("/api/classes/", json={"name": "Music", "period": "6th"})
    class_id = r_cls.json()["id"]
    rs = client_a.post(f"/api/classes/{class_id}/students", json={"name": "Grace"})
    student_id = rs.json()["id"]

    target_date = "2026-02-01"
    other_date = "2026-02-02"
    client_a.post(
        "/api/attendance/sessions",
        json=_session_payload(class_id, target_date, [student_id]),
    )
    client_a.post(
        "/api/attendance/sessions",
        json=_session_payload(class_id, other_date, [student_id]),
    )

    r = client_a.get(f"/api/attendance/sessions?date={target_date}")
    assert r.status_code == 200
    assert all(s["date"] == target_date for s in r.json())
