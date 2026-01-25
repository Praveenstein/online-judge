"""Authentication router module.

This module provides API endpoints for user registration, authentication (login),
and user management, utilizing asynchronous database operations and JWT security.
"""

# External Imports.
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from fastapi.security import OAuth2PasswordRequestForm

# Local Imports.
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserOut, Token
from ..auth.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)) -> User:
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

    new_user = User(
        email=user_data.email, hashed_password=hash_password(user_data.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)
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
    user_id: int, db: AsyncSession = Depends(get_db)
) -> dict[str, str]:
    """Removes a user from the database by their ID.

    Args:
        user_id: The primary key ID of the user to delete.
        db: The asynchronous database session.

    Returns:
        A confirmation message.
    """
    await db.execute(delete(User).where(User.id == user_id))
    await db.commit()
    return {"message": "User deleted"}
