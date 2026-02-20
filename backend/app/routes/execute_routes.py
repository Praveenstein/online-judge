"""API routes for the code execution service.

This module defines the endpoints for receiving source code, processing it
through the CodeExecutor, and returning the execution results.
"""

# Built-In Imports.
import subprocess

# External Imports.
from fastapi import APIRouter, Depends, HTTPException

# Local Imports.
from ..auth.utils import get_current_user
from ..models import User
from ..schemas import (
    ExecutionRequest,
    ExecutionResponse,
    TestExecutionRequest,
    TestExecutionResponse,
    TestCaseResult,
    AITestExecutionRequest,
    AITestExecutionResponse,
)
from ..services.compiler import CodeExecutor
from ..services.ai_tester import run_ai_tests

router = APIRouter(prefix="/execute", tags=["compiler"])


# ---------------------------------------------------------------------------
# In-memory test cases (temporary, for sum-of-two-numbers problems only)
# ---------------------------------------------------------------------------

# NOTE:
#   For now, all problems are treated as "sum of two numbers" problems.
#   We keep the test cases in memory and DO NOT touch the database.
#
#   Each test case provides stdin as two integers separated by whitespace,
#   and the expected output is the sum, as a string.

SUM_TWO_NUMBERS_TEST_CASES = [
    {"input_data": "1 2\n", "expected_output": "3"},
    {"input_data": "10 20\n", "expected_output": "30"},
    {"input_data": "-5 5\n", "expected_output": "0"},
    {"input_data": "100 200\n", "expected_output": "300"},
]


@router.post("/", response_model=ExecutionResponse)
async def run_code(
    request: ExecutionRequest,
    current_user: User = Depends(get_current_user),
) -> ExecutionResponse:
    """Endpoint to receive and execute code snippets.

    Args:
        request: An ExecutionRequest object containing code, language, and input.
        current_user: The authenticated user (required).

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


@router.post("/tests", response_model=TestExecutionResponse)
async def run_code_with_tests(
    request: TestExecutionRequest,
    current_user: User = Depends(get_current_user),
) -> TestExecutionResponse:
    """Execute code against a predefined set of test cases.

    For now this assumes that all problems are 'sum of two numbers' tasks.
    The function does not modify or depend on the database; it simply uses
    in-memory test cases and returns per-test results.
    """
    try:
        results: list[TestCaseResult] = []
        passed_tests: int = 0

        for test in SUM_TWO_NUMBERS_TEST_CASES:
            exec_result = await CodeExecutor.run(
                request.language, request.code, test["input_data"]
            )

            actual_stdout = exec_result.get("stdout", "").strip()
            expected_output = str(test["expected_output"]).strip()
            passed = exec_result.get("exit_code", 1) == 0 and actual_stdout == expected_output

            if passed:
                passed_tests += 1

            results.append(
                TestCaseResult(
                    input_data=test["input_data"],
                    expected_output=expected_output,
                    actual_output=actual_stdout,
                    passed=passed,
                    stderr=exec_result.get("stderr", ""),
                    exit_code=exec_result.get("exit_code", 1),
                )
            )

        return TestExecutionResponse(
            results=results,
            total_tests=len(SUM_TWO_NUMBERS_TEST_CASES),
            passed_tests=passed_tests,
            all_passed=passed_tests == len(SUM_TWO_NUMBERS_TEST_CASES),
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=408, detail="Code execution timed out while running tests."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai-tests", response_model=AITestExecutionResponse)
async def run_ai_generated_tests(
    request: AITestExecutionRequest,
    current_user: User = Depends(get_current_user),
) -> AITestExecutionResponse:
    """Run AI-generated tests against user code."""
    try:
        return await run_ai_tests(
            request.problem_description,
            request.code,
            request.language
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
