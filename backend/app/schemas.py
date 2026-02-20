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
# ---------------------------------------------------------------------------
# DSA Search schemas
# ---------------------------------------------------------------------------


class DSASearchRequest(BaseModel):
    """Request body for querying top DSA questions via AI search.

    Attributes:
        query: The user's search query (e.g. 'Graph Traversal', 'Dynamic Programming').
    """

    query: str = Field(
        ...,
        min_length=1,
        description="The DSA topic or specific question query to search for.",
        examples=["Graph Traversal problems"],
    )


class DSAProblem(BaseModel):
    """Schema for a single DSA problem result from AI search.

    Attributes:
        title: The name of the practice problem.
        url: Link to the problem on a platform (LeetCode, GFG, etc.).
        difficulty: Categorized difficulty level ('Easy', 'Medium', 'Hard').
    """

    title: str = Field(..., description="The title of the DSA problem.")
    url: str = Field(..., description="A valid URL to the problem statement.")
    difficulty: str = Field(
        ..., description="The difficulty level as returned by the AI."
    )


class DSASearchResponse(BaseModel):
    """Validated structured response for DSA search queries.

    Attributes:
        topic: The detected or user-provided topic of search.
        problems: A list of relevant practice problems.
    """

    topic: str = Field(..., description="The DSA topic related to the search.")
    problems: List[DSAProblem] = Field(
        ..., description="Recommended practice problems from across the web."
    )


# ---------------------------------------------------------------------------
# Note schemas
# ---------------------------------------------------------------------------
from datetime import datetime


class NoteBase(BaseModel):
    """Base schema for a Note."""

    title: str = Field(..., min_length=1, max_length=255)
    content: List[dict] = Field(..., description="The BlockNote state stored as a list of blocks.")


class NoteCreate(NoteBase):
    """Schema for creating a new note."""

    pass


class NoteUpdate(BaseModel):
    """Schema for updating an existing note."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[List[dict]] = Field(None)


class NoteOut(NoteBase):
    """Schema for returning note data."""

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NoteFromProblem(BaseModel):
    """Schema for creating a note from a DSA problem search result."""

    title: str = Field(..., description="The title of the problem.")
    url: str = Field(..., description="The URL of the problem statement.")
    difficulty: Optional[str] = Field(None, description="The difficulty of the problem.")
class AITestExecutionRequest(BaseModel):
    """Request for running AI-generated tests against user code."""

    code: str = Field(..., description="The user's source code.")
    language: str = Field(..., description="Programming language (e.g. 'python').")
    problem_description: str = Field(
        ..., description="The problem statement to generate tests for."
    )


class AITestResult(BaseModel):
    """Result of a single AI-generated test case."""

    input_data: str = Field(..., description="The test input.")
    expected_output: str = Field(..., description="Output from reference solution.")
    actual_output: str = Field(..., description="Output from user's code.")
    passed: bool = Field(..., description="True if outputs match.")
    stderr: Optional[str] = Field(None, description="Error from user's code execution.")
    exit_code: int = Field(..., description="Exit code from user's code execution.")


class AITestExecutionResponse(BaseModel):
    """Aggregate response for AI test execution."""

    results: List[AITestResult] = Field(..., description="List of test results.")
    summary: str = Field(..., description="A short summary of the results (e.g. '3/5 Passed').")


# ---------------------------------------------------------------------------
# Problem Attempt schemas
# ---------------------------------------------------------------------------

class ProblemAttemptBase(BaseModel):
    """Base schema for a Problem Attempt."""
    problem_title: str
    problem_url: Optional[str] = None
    difficulty: Optional[str] = None
    code: str
    language: str
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    exit_code: int
    test_results: Optional[List[dict] | dict] = None
    passed: bool


class ProblemAttemptCreate(ProblemAttemptBase):
    """Schema for creating a new problem attempt."""
    pass


class ProblemAttemptOut(ProblemAttemptBase):
    """Schema for returning problem attempt data."""
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Flash Card schemas
# ---------------------------------------------------------------------------

class FlashCard(BaseModel):
    """Schema for a single practice flash card."""
    front: str = Field(..., description="The question or problem statement part of the card.")
    back: str = Field(..., description="The key insight, logic pattern, or solution snippet.")
    problem_context: Optional[str] = Field(None, description="Title of the problem this card relates to.")


class FlashCardResponse(BaseModel):
    """Response containing a set of flash cards."""
    cards: List[FlashCard]
    summary: str
