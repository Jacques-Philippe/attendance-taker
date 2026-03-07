# pydantic v2 splits settings into a separate package; import
# BaseSettings from there to keep mypy happy and avoid the
# "Variable ... is not valid as a type" error.
try:
    from pydantic_settings import BaseSettings
except ImportError:  # backwards compatibility
    from pydantic import BaseSettings  # type: ignore[assignment]

from pydantic import PostgresDsn


class Settings(BaseSettings):
    database_url: PostgresDsn
    secret_key: str
    debug: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
