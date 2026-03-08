import os
import sys

import pytest
from fastapi.testclient import TestClient

# ensure backend/app module is importable when tests run from within backend/
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Set env vars BEFORE importing app modules so @lru_cache picks up test values
# instead of production values from .env
os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"
os.environ["SECRET_KEY"] = "testkey"
os.environ["DEBUG"] = "true"

from app.main import create_app


@pytest.fixture(scope="session")
def app():
    return create_app()


@pytest.fixture(scope="session")
def client(app):
    return TestClient(app)
