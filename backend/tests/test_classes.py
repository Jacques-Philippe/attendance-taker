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

TEACHER_A = {"username": "teacher_a", "password": "passA1234"}
TEACHER_B = {"username": "teacher_b", "password": "passB1234"}


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


# ---------------------------------------------------------------------------
# Class CRUD
# ---------------------------------------------------------------------------


def test_create_class(client_a):
    r = client_a.post("/api/classes/", json={"name": "Math", "period": "1st"})
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Math"
    assert data["period"] == "1st"
    assert "teacher_id" in data


def test_create_class_sets_teacher_id_from_session(client_a, client_b):
    r_a = client_a.post("/api/classes/", json={"name": "Science", "period": "2nd"})
    r_b = client_b.post("/api/classes/", json={"name": "Art", "period": "3rd"})
    assert r_a.json()["teacher_id"] != r_b.json()["teacher_id"]


def test_list_classes_scoped_to_teacher(client_a, client_b):
    # Ensure teacher A only sees their own classes
    r = client_a.get("/api/classes/")
    assert r.status_code == 200
    names = [c["name"] for c in r.json()]
    # Teacher B's "Art" class must not appear for teacher A
    assert "Art" not in names or all(
        c["teacher_id"] == r.json()[0]["teacher_id"] for c in r.json()
    )
    # Simpler: all returned classes share the same teacher_id
    ids = {c["teacher_id"] for c in r.json()}
    assert len(ids) <= 1


def test_get_class_as_owner(client_a):
    r = client_a.post("/api/classes/", json={"name": "History", "period": "4th"})
    class_id = r.json()["id"]
    r2 = client_a.get(f"/api/classes/{class_id}")
    assert r2.status_code == 200
    assert "students" in r2.json()


def test_get_class_as_non_owner(client_a, client_b):
    r = client_a.post("/api/classes/", json={"name": "PE", "period": "5th"})
    class_id = r.json()["id"]
    r2 = client_b.get(f"/api/classes/{class_id}")
    assert r2.status_code == 403


def test_patch_class_as_owner(client_a):
    r = client_a.post("/api/classes/", json={"name": "Old Name", "period": "1st"})
    class_id = r.json()["id"]
    r2 = client_a.patch(f"/api/classes/{class_id}", json={"name": "New Name"})
    assert r2.status_code == 200
    assert r2.json()["name"] == "New Name"


def test_patch_class_as_non_owner(client_a, client_b):
    r = client_a.post("/api/classes/", json={"name": "Chemistry", "period": "2nd"})
    class_id = r.json()["id"]
    r2 = client_b.patch(f"/api/classes/{class_id}", json={"name": "Hacked"})
    assert r2.status_code == 403


def test_delete_class_as_owner(client_a):
    r = client_a.post("/api/classes/", json={"name": "Temp", "period": "6th"})
    class_id = r.json()["id"]
    r2 = client_a.delete(f"/api/classes/{class_id}")
    assert r2.status_code == 204


def test_delete_class_as_non_owner(client_a, client_b):
    r = client_a.post("/api/classes/", json={"name": "Protected", "period": "7th"})
    class_id = r.json()["id"]
    r2 = client_b.delete(f"/api/classes/{class_id}")
    assert r2.status_code == 403


# ---------------------------------------------------------------------------
# Student sub-resource
# ---------------------------------------------------------------------------


@pytest.fixture
def class_with_student(client_a):
    r = client_a.post("/api/classes/", json={"name": "Biology", "period": "3rd"})
    class_id = r.json()["id"]
    rs = client_a.post(f"/api/classes/{class_id}/students", json={"name": "Alice"})
    return {"class_id": class_id, "student_id": rs.json()["id"]}


def test_add_student_as_owner(client_a):
    r = client_a.post("/api/classes/", json={"name": "Music", "period": "8th"})
    class_id = r.json()["id"]
    rs = client_a.post(f"/api/classes/{class_id}/students", json={"name": "Bob"})
    assert rs.status_code == 201
    assert rs.json()["name"] == "Bob"


def test_add_student_as_non_owner(client_a, client_b):
    r = client_a.post("/api/classes/", json={"name": "Drama", "period": "9th"})
    class_id = r.json()["id"]
    rs = client_b.post(f"/api/classes/{class_id}/students", json={"name": "Eve"})
    assert rs.status_code == 403


def test_patch_student_as_owner(client_a, class_with_student):
    class_id = class_with_student["class_id"]
    student_id = class_with_student["student_id"]
    r = client_a.patch(
        f"/api/classes/{class_id}/students/{student_id}", json={"name": "Alicia"}
    )
    assert r.status_code == 200
    assert r.json()["name"] == "Alicia"


def test_delete_student_as_owner(client_a, class_with_student):
    class_id = class_with_student["class_id"]
    student_id = class_with_student["student_id"]
    r = client_a.delete(f"/api/classes/{class_id}/students/{student_id}")
    assert r.status_code == 204


def test_delete_nonexistent_student(client_a, class_with_student):
    class_id = class_with_student["class_id"]
    r = client_a.delete(f"/api/classes/{class_id}/students/99999")
    assert r.status_code == 404
