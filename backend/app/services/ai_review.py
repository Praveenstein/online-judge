"""AI-powered code review service.

This module provides an async service that uses a Cerebras-backed Pydantic AI agent
to review user-submitted code and return structured feedback. The agent is
initialized with a configurable API key and a fixed system prompt for concise reviews.
"""

from __future__ import annotations

# Built-In Imports.
from typing import TYPE_CHECKING

# External Imports.
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.cerebras import CerebrasModel
from pydantic_ai.providers.cerebras import CerebrasProvider

# Local Imports.
from app.config import settings

if TYPE_CHECKING:
    pass

# ---------------------------------------------------------------------------
# Agent output type (used by Pydantic AI for structured response)
# ---------------------------------------------------------------------------

SYSTEM_PROMPT: str = (
    "You are a helpful code reviewer. Review the given code for correctness, "
    "style, security, and best practices. Keep your replies concise and actionable."
)

DEFAULT_MODEL_NAME: str = (
    "llama-3.3-70b"  # Overridden by settings.CEREBRAS_MODEL when set
)


class CodeReviewOutput(BaseModel):
    """Structured output from the AI code review agent.

    Used as the agent's output_type so responses are validated and typed.
    """

    code_review: str = Field(
        ..., description="The review text (feedback and suggestions)."
    )


def _make_agent() -> Agent[None, CodeReviewOutput]:
    """Build the Cerebras-backed code review agent.

    Uses CEREBRAS_API_KEY from settings. Raises ValueError if the key is missing.

    Returns:
        A configured Agent that returns CodeReviewOutput.
    """
    api_key: str = getattr(settings, "CEREBRAS_API_KEY", "") or ""
    if not api_key:
        raise ValueError(
            "CEREBRAS_API_KEY is not set. Add it to your .env to use AI code review."
        )

    model_name: str = getattr(settings, "CEREBRAS_MODEL", "") or DEFAULT_MODEL_NAME
    model = CerebrasModel(
        model_name,
        provider=CerebrasProvider(api_key=api_key),
    )
    return Agent(
        model,
        output_type=CodeReviewOutput,
        system_prompt=SYSTEM_PROMPT,
    )


# Lazy singleton: create agent on first use so missing API key doesn't break app startup.
_agent: Agent[None, CodeReviewOutput] | None = None


def get_agent() -> Agent[None, CodeReviewOutput]:
    """Return the shared code review agent, creating it on first call."""
    global _agent
    if _agent is None:
        _agent = _make_agent()
    return _agent


def _format_review_prompt(code: str, language: str) -> str:
    """Format the user code into a prompt for the agent.

    Args:
        code: The source code to review.
        language: Optional language hint (e.g. 'python', 'javascript').

    Returns:
        A string prompt to send to the agent.
    """
    lang_part: str = f" (language: {language})" if language else ""
    return f"Review the following code{lang_part}:\n\n```\n{code}\n```"


async def run_code_review(code: str, language: str = "") -> tuple[str, str]:
    """Run the AI code review on the given code.

    Args:
        code: The source code to review.
        language: Optional programming language hint for context.

    Returns:
        A tuple (code_review_text, model_used). model_used is the model name
        or empty string if not available.

    Raises:
        ValueError: If CEREBRAS_API_KEY is not configured.
    """
    agent: Agent[None, CodeReviewOutput] = get_agent()
    prompt: str = _format_review_prompt(code, language)
    result = await agent.run(prompt)
    review_text: str = result.output.code_review
    model_used: str = getattr(settings, "CEREBRAS_MODEL", "") or DEFAULT_MODEL_NAME
    return review_text, model_used
