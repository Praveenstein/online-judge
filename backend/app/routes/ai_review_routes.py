"""API routes for the AI code review service.

This module defines the POST /ai-review endpoint where clients submit source code
and receive an AI-generated review (feedback, suggestions, best practices).
"""

# External Imports.
from fastapi import APIRouter, Depends, HTTPException

# Local Imports.
from app.auth.utils import get_current_user
from app.models import User
from app.schemas import AICodeReviewRequest, AICodeReviewResponse
from app.services.ai_review import run_code_review

router = APIRouter(prefix="/ai-review", tags=["ai-code-review"])


@router.post(
    "/",
    response_model=AICodeReviewResponse,
    summary="Submit code for AI review",
    description=(
        "Submit source code and receive an AI-generated code review. "
        "The review includes feedback on correctness, style, security, and best practices. "
        "Requires CEREBRAS_API_KEY to be set in the server environment."
    ),
    responses={
        200: {
            "description": "Code review completed successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "code_review": "Consider adding type hints and docstrings.",
                        "model_used": "llama-3.3-70b",
                    }
                }
            },
        },
        401: {"description": "Not authenticated. Provide a valid Bearer token."},
        503: {"description": "AI code review is unavailable (e.g. missing API key)."},
        500: {
            "description": "Internal error during review (e.g. model or network failure)."
        },
    },
)
async def ai_review_post(
    request: AICodeReviewRequest,
    current_user: User = Depends(get_current_user),
) -> AICodeReviewResponse:
    """Submit code for AI review and return the result.

    Args:
        request: The request body containing `code` and optional `language`.
        current_user: The authenticated user (required).

    Returns:
        AICodeReviewResponse with `code_review` and optional `model_used`.

    Raises:
        HTTPException: 503 if CEREBRAS_API_KEY is not configured.
        HTTPException: 500 for model/network errors.
    """
    try:
        review_text, model_used = await run_code_review(
            code=request.code,
            language=request.language or "",
        )
        return AICodeReviewResponse(
            code_review=review_text,
            model_used=model_used or None,
        )
    except ValueError as e:
        if "CEREBRAS_API_KEY" in str(e):
            raise HTTPException(
                status_code=503,
                detail="AI code review is not configured. Set CEREBRAS_API_KEY on the server.",
            ) from e
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI code review failed: {e!s}",
        ) from e
