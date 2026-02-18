"""Service for ingesting problem details from URLs.

This module provides a service to fetch problem descriptions and generate
starter code templates using AI and Tavily.
"""

from __future__ import annotations

# Built-In Imports.
from typing import List, Dict, Any

# External Imports.
import httpx
from pydantic_ai import Agent
from pydantic_ai.models.cerebras import CerebrasModel
from pydantic_ai.providers.cerebras import CerebrasProvider
from pydantic_ai.profiles.openai import OpenAIModelProfile

# Local Imports.
from app.config import settings

# ---------------------------------------------------------------------------
# Agent Configuration
# ---------------------------------------------------------------------------

SYSTEM_PROMPT: str = (
    "You are a DSA coach. Given the raw content or a description of a coding problem, "
    "your goal is to: \n"
    "1. Provide a concise but complete problem description in PLAIN TEXT. DO NOT use any Markdown styling (no bold, italic, or lists with symbols like ** or _).\n"
    "2. Provide a section called 'Examples' with sample input/output as PLAIN TEXT.\n"
    "3. Generate a LeetCode-style starter code template (Python preference) in a class/function format. "
    "DO NOT provide the solution, just the definition and a 'pass' or 'return' statement.\n"
    "4. DO NOT give any hints, explanations, or extra text apart from the question and template.\n"
    "Return the description and examples first, then the code block inside triple backticks."
)

DEFAULT_MODEL_NAME: str = "gpt-oss-120b"


def _make_agent() -> Agent[None, str]:
    """Build the Cerebras-backed problem ingestion agent."""
    cerebras_key = getattr(settings, "CEREBRAS_API_KEY", "") or ""

    if not cerebras_key:
        raise ValueError("CEREBRAS_API_KEY is not set.")

    model_name = getattr(settings, "CEREBRAS_MODEL", "") or DEFAULT_MODEL_NAME
    model = CerebrasModel(
        model_name,
        provider=CerebrasProvider(api_key=cerebras_key),
    )
    # Disable strict tool definitions to avoid "mixed values for strict" error
    model._profile = OpenAIModelProfile(openai_supports_strict_tool_definition=False)

    return Agent(
        model,
        system_prompt=SYSTEM_PROMPT,
    )


async def fetch_problem_details(url: str, title: str) -> List[Dict[str, Any]]:
    """Fetch problem details from a URL and format them for BlockNote.

    Args:
        url: The URL of the problem.
        title: The title of the problem.

    Returns:
        A list of BlockNote-formatted blocks.
    """
    tavily_key = getattr(settings, "TAVILY_API_KEY", "") or ""
    
    # Use Tavily Extract to get the page content if possible, otherwise use search context
    content = ""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": tavily_key,
                    "query": f"detailed description and template for coding problem: {title} {url}",
                    "search_depth": "advanced",
                    "include_raw_content": True
                }
            )
            data = response.json()
            content = "\n".join([r.get("content", "") for r in data.get("results", [])])
    except Exception as e:
        content = f"Could not fetch live content from {url}. Error: {str(e)}"

    agent = _make_agent()
    result = await agent.run(f"Problem: {title}\nURL: {url}\n\nSearch Context:\n{content}")
    
    # Format the result into BlockNote blocks
    raw_text = result.output
    blocks = []
    
    # Add title block
    blocks.append({
        "type": "heading",
        "props": {"level": 1},
        "content": [{"type": "text", "text": title, "styles": {}}]
    })

    # Add URL block
    blocks.append({
        "type": "paragraph",
        "content": [
            {"type": "text", "text": "Problem Link: ", "styles": {"bold": True}},
            {"type": "text", "text": url, "styles": {}}
        ]
    })
    
    # Split text and code
    import re
    parts = re.split(r"```[a-z]*\n?(.*?)```", raw_text, flags=re.DOTALL)
    
    for i, part in enumerate(parts):
        if i % 2 == 0:
            # Regular text (Description and Examples)
            text_part = part.strip()
            if text_part:
                # Split by double newlines or single newlines to create separate paragraphs
                # Removing any leading/trailing markdown-like artifacts just in case
                text_part = re.sub(r"[*#_]", "", text_part) # Strip simple markdown
                lines = [line.strip() for line in text_part.split("\n") if line.strip()]
                for line in lines:
                    blocks.append({
                        "type": "paragraph",
                        "content": [{"type": "text", "text": line, "styles": {}}]
                    })
        else:
            # Code block (LeetCode-style template)
            blocks.append({
                "type": "codeExecution",
                "props": {
                    "language": "python",
                    "code": part.strip()
                }
            })
            
    return blocks
