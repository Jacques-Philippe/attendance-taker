import pytest
from fastapi.testclient import TestClient

from app.database import Base, get_engine

# from app.models import Base


@pytest.fixture(scope="module", autouse=True)
def setup_db(app):
    engine = get_engine()
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture
def client(app):
    return TestClient(app)


def test_register_new_user(client):
    response = client.post(
        "/api/auth/register",
        json={"username": "newteacher", "password": "secret123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newteacher"
    assert data["role"] == "teacher"
    assert "id" in data


def test_register_duplicate_username(client):
    client.post(
        "/api/auth/register",
        json={"username": "dupuser", "password": "pass1"},
    )
    response = client.post(
        "/api/auth/register",
        json={"username": "dupuser", "password": "pass2"},
    )
    assert response.status_code == 409


def test_registered_user_can_login(client):
    client.post(
        "/api/auth/register",
        json={"username": "logintest", "password": "mypassword"},
    )
    response = client.post(
        "/api/auth/login",
        json={"username": "logintest", "password": "mypassword"},
    )
    assert response.status_code == 200
    assert response.json()["user"]["username"] == "logintest"
