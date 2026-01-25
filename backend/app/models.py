"""Database models for the authentication system.

This module contains the SQLAlchemy ORM models, specifically the User model
which represents the 'users' table in the database.
"""

# External Imports.
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

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

    # Relationship to problems
    problems: Mapped[list["Problem"]] = relationship(back_populates="creator")


class Problem(Base):
    """Represents a coding problem in the system."""

    __tablename__ = "problems"

    # Unique identifier for the problem
    id: Mapped[int] = mapped_column(primary_key=True)

    # Title of the problem, indexed for faster searching
    title: Mapped[str] = mapped_column(index=True)

    # The full text description of the problem
    statement: Mapped[str] = mapped_column()

    # Difficulty level: Easy, Medium, or Hard
    difficulty: Mapped[str] = mapped_column(default="Medium")

    # Foreign key linking to the user who created the problem
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # Relationship to the User model
    creator: Mapped["User"] = relationship(back_populates="problems")
