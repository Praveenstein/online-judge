"""API routes for the code execution service.

This module defines the endpoints for receiving source code, processing it
through the CodeExecutor, and returning the execution results.
"""

# Built-In Imports.
import subprocess

# External Imports.
from fastapi import APIRouter, HTTPException

# Local Imports.
from ..schemas import ExecutionRequest, ExecutionResponse
from ..services.compiler import CodeExecutor

router = APIRouter(prefix="/execute", tags=["compiler"])


@router.post("/", response_model=ExecutionResponse)
async def run_code(request: ExecutionRequest) -> ExecutionResponse:
    """Endpoint to receive and execute code snippets.

    Args:
        request: An ExecutionRequest object containing code, language, and input.

    Returns:
        An ExecutionResponse containing stdout, stderr, and the exit code.

    Raises:
        HTTPException: 408 if execution exceeds the timeout,
                      500 for internal server errors.
    """
    try:
        # Pass the request data to the service layer for execution
        result = await CodeExecutor.run(
            request.language, request.code, request.input_data
        )
        return result
    except subprocess.TimeoutExpired:
        # Specifically catch execution timeouts to inform the user
        raise HTTPException(
            status_code=408, detail="Code execution timed out (Limit: 5s)"
        )
    except Exception as e:
        # Catch-all for other execution or system failures
        raise HTTPException(status_code=500, detail=str(e))
