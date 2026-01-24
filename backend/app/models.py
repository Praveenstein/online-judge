"""Database models for the authentication system.

This module contains the SQLAlchemy ORM models, specifically the User model
which represents the 'users' table in the database.
"""

# External Imports.
from sqlalchemy.orm import Mapped, mapped_column

# Local Imports.
from .database import Base


class User(Base):
    """SQLAlchemy model representing a user account.

    Attributes:
        id: Unique identifier and primary key for the user.
        email: The user's email address, which is unique and indexed for fast lookups.
        hashed_password: The salted and hashed version of the user's password.
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
