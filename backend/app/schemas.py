"""Pydantic schemas for user data validation and serialization.

This module defines the Data Transfer Objects (DTOs) used for validating
request payloads and formatting API responses for user and token data.
"""

# Built-In Imports.
from typing import Optional, List

# External Imports.
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for user registration and login requests.

    Attributes:
        email: A valid email address for the user.
        password: The plain-text password provided by the user.
    """

    email: EmailStr
    password: str


class UserOut(BaseModel):
    """Schema for user data sent back to the client.

    This model excludes sensitive information like passwords.
    """

    id: int
    email: EmailStr

    # Enables compatibility with SQLAlchemy models (Pydantic v2 style)
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """Schema for the authentication token response.

    Attributes:
        access_token: The JWT access token string.
        token_type: The type of token, typically 'bearer'.
    """

    access_token: str
    token_type: str


class ProblemBase(BaseModel):
    """Base schema containing shared attributes for a Problem.

    Attributes:
        title: The title of the problem.
        statement: The detailed description or statement of the problem.
        difficulty: The difficulty level of the problem (e.g., 'Easy', 'Medium').
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The title of the problem.",
        examples=["Two Sum"],
    )
    statement: str = Field(
        ...,
        min_length=1,
        description="The full text statement of the problem.",
    )
    difficulty: str = Field(
        ..., description="The difficulty rating of the problem.", examples=["Easy"]
    )


class ProblemCreate(ProblemBase):
    """Schema for creating a new problem.

    Inherits all fields from ProblemBase. Used for request validation
    when a client POSTs a new problem.
    """

    pass


class ProblemUpdate(BaseModel):
    """Schema for updating an existing problem.

    All fields are optional to allow partial updates.
    """

    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=2000,
        description="The updated title of the problem.",
    )
    statement: Optional[str] = Field(
        None, min_length=1, description="The updated problem statement."
    )
    difficulty: Optional[str] = Field(
        None, description="The updated difficulty rating."
    )


class ProblemOut(ProblemBase):
    """Schema for returning problem data to the client.

    Inherits fields from ProblemBase and adds the database-generated ID.
    Configured to support mapping from ORM objects (SQLAlchemy, etc.).
    """

    id: int = Field(
        ..., description="The unique identifier for the problem.", examples=[1]
    )
    creator_id: int = Field(
        ..., description="The ID of the user who created this problem.", examples=[42]
    )

    model_config = ConfigDict(from_attributes=True)


class ExecutionRequest(BaseModel):
    """Represents a request to execute a snippet of source code.

    Attributes:
        code: The source code string to be executed.
        language: The programming language of the code (e.g., 'python', 'cpp', 'java').
        input_data: Optional string representing standard input (stdin) for the program.
    """

    code: str = Field(..., description="The source code to execute.")
    language: str = Field(..., description="The programming language identifier.")
    input_data: Optional[str] = Field(
        default="", description="Optional stdin for the process."
    )


class ExecutionResponse(BaseModel):
    """Represents the output and status of a code execution request.

    Attributes:
        stdout: The standard output produced by the execution.
        stderr: The standard error produced by the execution.
        exit_code: The process exit code (0 usually indicates success).
    """

    stdout: str = Field(..., description="Captured standard output.")
    stderr: str = Field(..., description="Captured standard error.")
    exit_code: int = Field(..., description="The process return code.")


class TestCaseResult(BaseModel):
    """Represents the outcome of running a single test case."""

    input_data: str = Field(..., description="The stdin provided to the program.")
    expected_output: str = Field(
        ..., description="The expected standard output for this test case."
    )
    actual_output: str = Field(
        ..., description="The actual standard output produced by the program."
    )
    passed: bool = Field(
        ..., description="Whether the actual output matched the expected output."
    )
    stderr: str = Field(
        ..., description="Captured standard error for this specific test case."
    )
    exit_code: int = Field(
        ..., description="The process return code for this specific test case."
    )


class TestExecutionRequest(BaseModel):
    """Request body for executing code against predefined test cases.

    Notes:
        For now, all problems are treated as 'sum of two numbers' problems.
        The backend uses a fixed set of test cases and does not persist anything
        to the database.
    """

    code: str = Field(..., description="The source code to execute against test cases.")
    language: str = Field(..., description="The programming language identifier.")
    problem_id: int = Field(
        ..., description="The problem identifier (currently informational only)."
    )


class TestExecutionResponse(BaseModel):
    """Aggregated result of running code against multiple test cases."""

    results: List[TestCaseResult] = Field(
        ..., description="Per-test execution results and pass/fail status."
    )
    total_tests: int = Field(..., description="Total number of test cases executed.")
    passed_tests: int = Field(
        ..., description="Number of test cases that passed successfully."
    )
    all_passed: bool = Field(
        ..., description="True if and only if all test cases passed."
    )


# ---------------------------------------------------------------------------
# AI Code Review schemas
# ---------------------------------------------------------------------------


class AICodeReviewRequest(BaseModel):
    """Request body for submitting code to the AI code review endpoint.

    Attributes:
        code: The source code string to be reviewed.
        language: Optional programming language hint (e.g. 'python', 'javascript')
            for better review context. Defaults to empty string.
    """

    code: str = Field(
        ...,
        min_length=1,
        description="The source code to be reviewed by the AI.",
        examples=['print("Hello, World!")'],
    )
    language: Optional[str] = Field(
        default="",
        description="Optional language hint for review context (e.g. python, javascript).",
    )


class AICodeReviewResponse(BaseModel):
    """Response from the AI code review endpoint.

    Attributes:
        code_review: The AI-generated review text (feedback, suggestions, issues).
        model_used: Optional identifier of the model used (e.g. cerebras model name).
    """

    code_review: str = Field(
        ...,
        description="The AI-generated code review (feedback and suggestions).",
    )
    model_used: Optional[str] = Field(
        default=None,
        description="Identifier of the model used for the review, if available.",
    )
