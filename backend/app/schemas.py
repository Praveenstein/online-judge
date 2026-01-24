"""Pydantic schemas for user data validation and serialization.

This module defines the Data Transfer Objects (DTOs) used for validating
request payloads and formatting API responses for user and token data.
"""

# External Imports.
from pydantic import BaseModel, ConfigDict, EmailStr


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
