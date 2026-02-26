"""API routes for searching DSA questions.

This module defines the /api/dsa/search endpoint that allows users
to search for top DSA problems using an AI-powered service.
"""

from __future__ import annotations

# External Imports.
from fastapi import APIRouter, HTTPException

# Local Imports.
from app.schemas import DSASearchRequest, DSASearchResponse
from app.services.dsa_search import run_dsa_search

router = APIRouter(prefix="/api/dsa", tags=["DSA Search"])


@router.post("/search", response_model=DSASearchResponse)
async def search_dsa_problems(request: DSASearchRequest) -> DSASearchResponse:
    """Search for relevant DSA practice problems from across the web.

    Args:
        request: The search query.

    Returns:
        A structured list of problems with URLs and difficulty levels.

    Raises:
        HTTPException: If the AI service fails or keys are missing.
    """
    try:
        result = await run_dsa_search(request.query)
        return result
    except ValueError as e:
        # Likely missing API keys
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        # Fallback for other errors
        raise HTTPException(
            status_code=500, detail=f"An error occurred during DSA search: {str(e)}"
        )
