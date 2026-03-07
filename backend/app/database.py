from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import get_settings

# Base class for declarative models can be module-level; it does not depend
# on the database URL.
Base = declarative_base()


@lru_cache(maxsize=1)
def get_engine():
    """Return a cached SQLAlchemy engine configured from settings.

    The engine is created lazily on first access so that tests or other code
    can modify environment variables before the URL is resolved.  Using
    :func:`lru_cache` ensures the same engine instance is reused throughout the
    process.
    """
    settings = get_settings()
    # convert to str in case the Pydantic field is a PostgresDsn or similar
    return create_engine(str(settings.database_url), future=True)


@lru_cache(maxsize=1)
def get_session_local():
    """Return a configured :func:`sessionmaker` bound to the cached engine."""
    return sessionmaker(bind=get_engine(), autoflush=False, autocommit=False)


def get_db():
    """Yields a database session and ensures it is closed afterwards."""
    db = get_session_local()()
    try:
        yield db
    finally:
        db.close()
