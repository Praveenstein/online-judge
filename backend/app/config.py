"""Configuration module for the Auth API.

This module defines the Settings class which handles environment variable
parsing using Pydantic Settings. It provides a centralized configuration
object for database credentials, security keys, and JWT settings.
"""

# External Imports.
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings and environment variable validator.

    Attributes:
        POSTGRES_USER: Username for the PostgreSQL database.
        POSTGRES_PASSWORD: Password for the PostgreSQL database.
        POSTGRES_SERVER: Host address of the PostgreSQL server.
        POSTGRES_PORT: Port number for the PostgreSQL server.
        POSTGRES_DB: Name of the database.
        SECRET_KEY: Secret key used for signing JWT tokens.
        ALGORITHM: Encryption algorithm used for JWT. Defaults to HS256.
        ACCESS_TOKEN_EXPIRE_MINUTES: Duration in minutes before a token expires.
    """

    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_SERVER: str
    POSTGRES_PORT: int
    POSTGRES_DB: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    @property
    def DATABASE_URL(self) -> str:
        """Constructs the asynchronous PostgreSQL connection string.

        Returns:
            A formatted string used by SQLAlchemy and asyncpg.
        """
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # Configuration for Pydantic to read from a .env file and ignore extra variables
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


# Global settings instance to be imported across the application
settings = Settings()
