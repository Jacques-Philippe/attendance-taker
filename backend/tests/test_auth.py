import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from alembic import command as alembic_command
from alembic.config import Config as AlembicConfig
from app.database import Base, get_engine
from app.models.user import User
from app.services.auth import hash_password

TEST_USERNAME = "teacher1"
TEST_PASSWORD = "s3cr3t!"

_ALEMBIC_INI = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "alembic.ini")
)


@pytest.fixture(scope="module", autouse=True)
def setup_db(app):
    """Run Alembic migrations and seed a test user for auth tests."""
    alembic_command.upgrade(AlembicConfig(_ALEMBIC_INI), "head")

    engine = get_engine()
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    db.add(
        User(
            username=TEST_USERNAME,
            password_hash=hash_password(TEST_PASSWORD),
            role="teacher",
        )
    )
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(engine)


@pytest.fixture
def anon(app):
    """A fresh client with no cookies."""
    return TestClient(app)


@pytest.fixture
def logged_in(app):
    """A fresh client that has already performed a login."""
    c = TestClient(app)
    c.post(
        "/api/auth/login", json={"username": TEST_USERNAME, "password": TEST_PASSWORD}
    )
    return c


def test_login_valid_credentials(anon):
    response = anon.post(
        "/api/auth/login",
        json={"username": TEST_USERNAME, "password": TEST_PASSWORD},
    )
    assert response.status_code == 200
    assert "session_token" in response.cookies
    data = response.json()
    assert data["user"]["username"] == TEST_USERNAME
    assert data["user"]["role"] == "teacher"


def test_login_wrong_password(anon):
    response = anon.post(
        "/api/auth/login",
        json={"username": TEST_USERNAME, "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_login_unknown_username(anon):
    response = anon.post(
        "/api/auth/login",
        json={"username": "nobody", "password": TEST_PASSWORD},
    )
    assert response.status_code == 401


def test_me_with_valid_session(logged_in):
    response = logged_in.get("/api/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == TEST_USERNAME
    assert data["role"] == "teacher"
    assert "id" in data


def test_me_with_no_cookie(anon):
    response = anon.get("/api/auth/me")
    assert response.status_code == 401


def test_logout(logged_in):
    response = logged_in.post("/api/auth/logout")
    assert response.status_code == 204


def test_me_after_logout(logged_in):
    logged_in.post("/api/auth/logout")
    response = logged_in.get("/api/auth/me")
    assert response.status_code == 401
