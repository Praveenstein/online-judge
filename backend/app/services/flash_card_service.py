"""Service for generating personalized flash cards using AI.

This module analyzes user's problem attempts (especially failures) to generate
targeted flash cards for reinforcement.
"""

from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.cerebras import CerebrasModel
from pydantic_ai.providers.cerebras import CerebrasProvider
from pydantic_ai.profiles.openai import OpenAIModelProfile

from app.config import settings
from app.models import ProblemAttempt
from app.schemas import FlashCard

SYSTEM_PROMPT = (
    "You are a DSA mentor. Your task is to analyze a user's failed coding attempts "
    "and generate personalized flash cards to help them learn from their mistakes.\n\n"
    "Each flash card should have:\n"
    "1. Front: A conceptual question or a specific code scenario related to the failure.\n"
    "2. Back: A clear explanation, key insight, or small code snippet that would have solved the issue.\n\n"
    "Focus on patterns, edge cases, or algorithmic concepts that the user seems to be struggling with based on the provided data."
)

class FlashCardList(BaseModel):
    cards: List[FlashCard]

def _make_flashcard_agent() -> Agent[None, FlashCardList]:
    cerebras_key = getattr(settings, "CEREBRAS_API_KEY", "") or ""
    if not cerebras_key:
        raise ValueError("CEREBRAS_API_KEY is not set.")

    model_name = getattr(settings, "CEREBRAS_MODEL", "") or "gpt-oss-120b"
    model = CerebrasModel(
        model_name,
        provider=CerebrasProvider(api_key=cerebras_key),
    )
    model._profile = OpenAIModelProfile(openai_supports_strict_tool_definition=False)

    return Agent(
        model,
        output_type=FlashCardList,
        system_prompt=SYSTEM_PROMPT,
    )

async def generate_flash_cards(attempts: List[ProblemAttempt]) -> List[FlashCard]:
    """Generate flash cards from a list of problem attempts."""
    if not attempts:
        return []

    # Prepare historical context for the AI
    history_ctx = []
    for att in attempts:
        status = "Passed" if att.passed else "Failed"
        history_ctx.append(
            f"Problem: {att.problem_title}\n"
            f"Status: {status}\n"
            f"Language: {att.language}\n"
            f"Error/Output Snippet: {att.stderr or att.stdout or 'N/A'}\n"
            f"Code Snippet:\n{att.code[:500]}..." # Limit code size
        )

    ctx_str = "\n---\n".join(history_ctx)
    agent = _make_flashcard_agent()
    
    prompt = (
        f"Analyze these recent DSA attempts and generate 5 flash cards for reinforcement:\n\n"
        f"{ctx_str}"
    )
    
    result = await agent.run(prompt)
    
    # Add problem context to cards if missing
    cards = result.output.cards
    # (Optional: Map cards back to specific problems if logical)
    
    return cards
