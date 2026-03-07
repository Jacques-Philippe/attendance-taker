"""Application entry point and factory."""


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import health


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
    # Cross-origin resource sharing is liberal during development; this should
    # be tightened in production.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # routers
    # ``health`` is an :class:`APIRouter` instance imported from
    # :mod:`.routers.health`.  Additional routers for users, classes,
    # attendance, etc. will be mounted here in later phases.
    app.include_router(health)

    return app


app = create_app()
