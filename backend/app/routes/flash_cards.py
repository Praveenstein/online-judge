from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..database import get_db
from ..models import ProblemAttempt, User
from ..schemas import FlashCardResponse
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
