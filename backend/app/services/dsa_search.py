"""Service for searching DSA problems using AI and Tavily.

This module provides a service that uses a Cerebras-backed Pydantic AI agent
equipped with the Tavily search tool to find high-quality DSA practice problems
from across the web.
"""

from __future__ import annotations

# Built-In Imports.
from typing import TYPE_CHECKING

# External Imports.
from pydantic_ai import Agent
from pydantic_ai.models.cerebras import CerebrasModel
from pydantic_ai.providers.cerebras import CerebrasProvider
from pydantic_ai.profiles.openai import OpenAIModelProfile
from pydantic_ai.common_tools.tavily import tavily_search_tool

# Local Imports.
from app.config import settings
from app.schemas import DSASearchResponse

if TYPE_CHECKING:
    pass

# ---------------------------------------------------------------------------
# Agent Configuration
# ---------------------------------------------------------------------------

SYSTEM_PROMPT: str = (
    "You are a DSA coach. Search for top-tier practice problems "
    "and return them as a structured list with valid URLs."
)

DEFAULT_MODEL_NAME: str = "gpt-oss-120b"


def _make_agent() -> Agent[None, DSASearchResponse]:
    """Build the Cerebras-backed DSA search agent with Tavily search tool.

    Uses CEREBRAS_API_KEY and TAVILY_API_KEY from settings.
    Raises ValueError if keys are missing.

    Returns:
        A configured Agent that returns DSASearchResponse.
    """
    cerebras_key = getattr(settings, "CEREBRAS_API_KEY", "") or ""
    tavily_key = getattr(settings, "TAVILY_API_KEY", "") or ""

    if not cerebras_key or not tavily_key:
        raise ValueError(
            "CEREBRAS_API_KEY or TAVILY_API_KEY is not set. "
            "Add them to your .env to use DSA search."
        )

    model_name = getattr(settings, "CEREBRAS_MODEL", "") or DEFAULT_MODEL_NAME
    model = CerebrasModel(
        model_name,
        provider=CerebrasProvider(api_key=cerebras_key),
    )
    # Disable strict tool definitions to avoid "mixed values for strict" error with Cerebras
    model._profile = OpenAIModelProfile(openai_supports_strict_tool_definition=False)

    return Agent(
        model,
        tools=[tavily_search_tool(api_key=tavily_key)],
        output_type=DSASearchResponse,
        system_prompt=SYSTEM_PROMPT,
    )


# Lazy singleton
_agent: Agent[None, DSASearchResponse] | None = None


def get_agent() -> Agent[None, DSASearchResponse]:
    """Return the shared DSA search agent, creating it on first call."""
    global _agent
    if _agent is None:
        _agent = _make_agent()
    return _agent


async def run_dsa_search(query: str) -> DSASearchResponse:
    """Run the DSA problem search for the given query.

    Args:
        query: The user's search query (e.g. 'Graph Traversal').

    Returns:
        A DSASearchResponse instance containing a list of problems.
    """
    agent = get_agent()
    result = await agent.run(query)
    # result.output is an instance of DSASearchResponse
    return result.output
