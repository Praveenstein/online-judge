from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..database import get_db
from ..models import ProblemAttempt, User
from ..schemas import ProblemAttemptCreate, ProblemAttemptOut
from ..auth.utils import get_current_user

router = APIRouter(prefix="/attempts", tags=["attempts"])

@router.post("/", response_model=ProblemAttemptOut, status_code=status.HTTP_201_CREATED)
async def save_attempt(
    attempt_in: ProblemAttemptCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save a user's problem attempt."""
    new_attempt = ProblemAttempt(
        **attempt_in.model_dump(),
        user_id=current_user.id
    )
    db.add(new_attempt)
    await db.commit()
    await db.refresh(new_attempt)
    return new_attempt

@router.get("/", response_model=List[ProblemAttemptOut])
async def list_attempts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all attempts for the authenticated user."""
    query = select(ProblemAttempt).where(ProblemAttempt.user_id == current_user.id).order_by(ProblemAttempt.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{attempt_id}", response_model=ProblemAttemptOut)
async def get_attempt(
    attempt_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific attempt by ID."""
    query = select(ProblemAttempt).where(ProblemAttempt.id == attempt_id, ProblemAttempt.user_id == current_user.id)
    result = await db.execute(query)
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return attempt
