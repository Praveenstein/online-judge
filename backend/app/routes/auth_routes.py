"""Authentication router module.

This module provides API endpoints for user registration, authentication (login),
and user management, utilizing asynchronous database operations and JWT security.
"""

# External Imports.
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from fastapi.security import OAuth2PasswordRequestForm
import re

# Local Imports.
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserOut, Token
from ..auth.security import hash_password, verify_password, create_access_token
from ..auth.utils import get_current_user
from ..limiter import limiter

router = APIRouter(prefix="/auth", tags=["auth"])

def is_strong_password(password: str) -> bool:
    """Checks if a password meets minimum strength requirements."""
    if len(password) < 8:
        return False
    if not re.search(r"\d", password):
        return False
    if not re.search(r"[A-Za-z]", password):
        return False
    return True


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserCreate, db: AsyncSession = Depends(get_db)) -> User:
    """Registers a new user in the system.

    Checks if the email is already in use, hashes the password, and stores
    the new user record in the database.

    Args:
        user_data: The user's registration details (email and password).
        db: The asynchronous database session.

    Returns:
        The newly created user object.

    Raises:
        HTTPException: 400 error if the email is already registered.
    """
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )
        
    if not is_strong_password(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters long and contain both letters and numbers."
        )

    new_user = User(
        email=user_data.email, hashed_password=hash_password(user_data.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(
    request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)
):
    # Note: OAuth2PasswordRequestForm uses 'username', so we treat it as the email
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


@router.delete("/delete/{user_id}")
async def delete_user(
    user_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict[str, str]:
    """Removes a user from the database by their ID.

    Args:
        user_id: The primary key ID of the user to delete.
        db: The asynchronous database session.
        current_user: The authenticated user making the request.

    Returns:
        A confirmation message.
    """
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this user"
        )
        
    await db.execute(delete(User).where(User.id == user_id))
    await db.commit()
    return {"message": "User deleted"}
