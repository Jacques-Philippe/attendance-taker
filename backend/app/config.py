from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    debug: bool = False
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


from functools import lru_cache


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached :class:`Settings` instance.

    Calling this function multiple times returns the same object, ensuring
    that environment variables are read only once and allowing callers to
    obtain configuration lazily (e.g. during app startup rather than at
    import time).
    """
    return Settings()
