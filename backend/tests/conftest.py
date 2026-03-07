import os
import sys
import tempfile

import pytest
from fastapi.testclient import TestClient

# ensure backend/app module is importable when tests run from within backend/
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import create_app


@pytest.fixture(scope="session")
def app():
    # set any env vars needed for tests
    os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
    os.environ.setdefault("SECRET_KEY", "testkey")
    app = create_app()
    return app


@pytest.fixture(scope="session")
def client(app):
    return TestClient(app)
