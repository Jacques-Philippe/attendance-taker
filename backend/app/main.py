"""Application entry point and factory."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import auth, health


def create_app() -> FastAPI:
    """Construct and configure the FastAPI application instance.

    This factory is useful for testing (allowing multiple apps with separate
    configuration) and for potential future extensions such as dependency
    injection or environment-specific settings.

    Returns:
        An initialized :class:`FastAPI` application with CORS middleware and
        registered routers.
    """
    app = FastAPI(title="Attendance Taker API")

    # middleware
    # allow_credentials=True requires an explicit origin allowlist — browsers
    # reject credentialed responses when the server echoes back "*".
    # Configure CORS_ORIGINS in the environment for production deployments.
    settings = get_settings()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # routers
    # ``health`` is an :class:`APIRouter` instance imported from
    # :mod:`.routers.health`.  Additional routers for users, classes,
    # attendance, etc. will be mounted here in later phases.
    app.include_router(health)
    app.include_router(auth)

    return app


app = create_app()
