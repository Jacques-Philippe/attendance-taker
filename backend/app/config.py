from pydantic import BaseSettings, PostgresDsn


class Settings(BaseSettings):
    database_url: PostgresDsn
    secret_key: str
    debug: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
