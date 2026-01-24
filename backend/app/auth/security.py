"""Security and authentication utilities.

This module provides helper functions for password hashing, verification,
and the generation of JSON Web Tokens (JWT) for user authentication.
"""

# Built-In Imports.
from datetime import datetime, timedelta, timezone
from typing import Any

# External Imports.
import bcrypt
from jose import jwt

# Local Imports.
from ..config import settings


def hash_password(password: str) -> str:
    """Hashes a plain-text password using bcrypt.

    Args:
        password: The plain-text password to hash.

    Returns:
        The decoded string representation of the hashed password and salt.
    """
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain-text password against a stored hash.

    Args:
        plain_password: The password provided by the user.
        hashed_password: The hashed password retrieved from the database.

    Returns:
        True if the passwords match, False otherwise.
    """
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def create_access_token(data: dict[str, Any]) -> str:
    """Generates a signed JWT access token.

    Args:
        data: A dictionary of claims to include in the token payload.

    Returns:
        A signed JWT string.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})

    encoded_jwt: str = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt
