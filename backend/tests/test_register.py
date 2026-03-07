import pytest
from fastapi.testclient import TestClient

from app.database import Base, get_engine


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
        json={"username": "dupuser", "password": "validpass1"},
    )
    response = client.post(
        "/api/auth/register",
        json={"username": "dupuser", "password": "validpass2"},
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
    assert response.json()["user"]["role"] == "teacher"


def test_register_username_too_short(client):
    response = client.post(
        "/api/auth/register",
        json={"username": "ab", "password": "validpass1"},
    )
    assert response.status_code == 422


def test_register_username_invalid_characters(client):
    response = client.post(
        "/api/auth/register",
        json={"username": "bad user@name", "password": "validpass1"},
    )
    assert response.status_code == 422


def test_register_password_too_short(client):
    response = client.post(
        "/api/auth/register",
        json={"username": "validuser", "password": "short"},
    )
    assert response.status_code == 422
