from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import health


def create_app() -> FastAPI:
    app = FastAPI(title="Attendance Taker API")

    # middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # routers
    # `health` is already an APIRouter instance
    app.include_router(health)

    return app


app = create_app()
