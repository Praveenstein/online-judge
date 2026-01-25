"""Pydantic schemas for user data validation and serialization.

This module defines the Data Transfer Objects (DTOs) used for validating
request payloads and formatting API responses for user and token data.
"""

# Built-In Imports.
from typing import Optional

# External Imports.
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for user registration and login requests.

    Attributes:
        email: A valid email address for the user.
        password: The plain-text password provided by the user.
    """

    email: EmailStr
    password: str


class UserOut(BaseModel):
    """Schema for user data sent back to the client.

    This model excludes sensitive information like passwords.
    """

    id: int
    email: EmailStr

    # Enables compatibility with SQLAlchemy models (Pydantic v2 style)
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """Schema for the authentication token response.

    Attributes:
        access_token: The JWT access token string.
        token_type: The type of token, typically 'bearer'.
    """

    access_token: str
    token_type: str


class ProblemBase(BaseModel):
    """Base schema containing shared attributes for a Problem.

    Attributes:
        title: The title of the problem.
        statement: The detailed description or statement of the problem.
        difficulty: The difficulty level of the problem (e.g., 'Easy', 'Medium').
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The title of the problem.",
        examples=["Two Sum"],
    )
    statement: str = Field(
        ...,
        min_length=1,
        description="The full text statement of the problem.",
    )
    difficulty: str = Field(
        ..., description="The difficulty rating of the problem.", examples=["Easy"]
    )


class ProblemCreate(ProblemBase):
    """Schema for creating a new problem.

    Inherits all fields from ProblemBase. Used for request validation
    when a client POSTs a new problem.
    """

    pass


class ProblemUpdate(BaseModel):
    """Schema for updating an existing problem.

    All fields are optional to allow partial updates.
    """

    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=2000,
        description="The updated title of the problem.",
    )
    statement: Optional[str] = Field(
        None, min_length=1, description="The updated problem statement."
    )
    difficulty: Optional[str] = Field(
        None, description="The updated difficulty rating."
    )


class ProblemOut(ProblemBase):
    """Schema for returning problem data to the client.

    Inherits fields from ProblemBase and adds the database-generated ID.
    Configured to support mapping from ORM objects (SQLAlchemy, etc.).
    """

    id: int = Field(
        ..., description="The unique identifier for the problem.", examples=[1]
    )
    creator_id: int = Field(
        ..., description="The ID of the user who created this problem.", examples=[42]
    )

    model_config = ConfigDict(from_attributes=True)
