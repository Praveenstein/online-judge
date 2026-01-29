"""Database infrastructure module.

This module initializes the asynchronous SQLAlchemy engine and session factory,
and defines the declarative base for the application's ORM models.
"""

# Built-In Imports.
from typing import AsyncGenerator

# External Imports.
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# Local Imports.
from .config import settings

# Initialize the async engine using the database URL from settings
# echo=True logs all generated SQL statements (useful for development)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    # This ensures the connection is verified before use
    pool_pre_ping=True,
    # Force SSL requirement if not connecting to a local dev DB
    connect_args={"ssl": "require"}
    if "localhost" not in settings.POSTGRES_SERVER
    else {},
)

# Factory for creating new AsyncSession instances
async_session = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""

    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides an asynchronous database session.

    Yields:
        An active SQLAlchemy AsyncSession instance.

    Note:
        The session is automatically closed after the request is finished
        via the context manager.
    """
    async with async_session() as session:
        yield session
