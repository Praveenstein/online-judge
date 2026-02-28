from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..database import get_db
from ..models import ProblemAttempt, User, SavedFlashCard
from ..schemas import FlashCardResponse, SavedFlashCardCreate, SavedFlashCardOut
from ..auth.utils import get_current_user
from ..services.flash_card_service import generate_flash_cards

router = APIRouter(prefix="/flash-cards", tags=["flash-cards"])

@router.get("/generate", response_model=FlashCardResponse)
async def get_personalized_flash_cards(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate personalized flash cards based on user's recent failures."""
    # Get last 10 attempts, prioritizing failures
    query = (
        select(ProblemAttempt)
        .where(ProblemAttempt.user_id == current_user.id)
        .order_by(ProblemAttempt.passed.asc(), ProblemAttempt.created_at.desc())
        .limit(10)
    )
    result = await db.execute(query)
    attempts = result.scalars().all()
    
    if not attempts:
        return FlashCardResponse(cards=[], summary="No attempts found. Try solving some problems first!")
    
    try:
        cards = await generate_flash_cards(attempts)
        return FlashCardResponse(
            cards=cards,
            summary=f"Generated {len(cards)} cards based on your recent activity."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flash card generation failed: {str(e)}")

@router.get("/", response_model=List[SavedFlashCardOut])
async def get_saved_flash_cards(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all saved flash cards for the current user."""
    query = (
        select(SavedFlashCard)
        .where(SavedFlashCard.user_id == current_user.id)
        .order_by(SavedFlashCard.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=SavedFlashCardOut, status_code=status.HTTP_201_CREATED)
async def save_flash_card(
    card_in: SavedFlashCardCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save a flash card to the database."""
    card = SavedFlashCard(
        user_id=current_user.id,
        front=card_in.front,
        back=card_in.back,
        problem_context=card_in.problem_context
    )
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return card

@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_flash_card(
    card_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a saved flash card."""
    query = select(SavedFlashCard).where(
        SavedFlashCard.id == card_id,
        SavedFlashCard.user_id == current_user.id
    )
    result = await db.execute(query)
    card = result.scalar_one_or_none()
    
    if not card:
        raise HTTPException(status_code=404, detail="Flash card not found")
        
    await db.delete(card)
    await db.commit()
    return None
