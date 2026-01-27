"""API Router for managing coding problems.

This module defines endpoints for creating, reading, updating, and deleting
problem records.
"""

# External Imports.
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict

# Local Imports.
from ..database import get_db
from ..models import Problem, User
from ..schemas import ProblemCreate, ProblemOut, ProblemUpdate
from ..auth.utils import get_current_user

router = APIRouter(prefix="/problems", tags=["problems"])


@router.post("/", response_model=ProblemOut)
async def create_problem(
    problem_data: ProblemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProblemOut:
    """Create a new problem.

    Args:
        problem_data: The data required to create the problem.
        db: The database session.
        current_user: The authenticated user creating the problem.

    Returns:
        The newly created Problem object.
    """
    new_problem = Problem(**problem_data.model_dump(), creator_id=current_user.id)
    db.add(new_problem)
    await db.commit()
    await db.refresh(new_problem)
    return new_problem


@router.get("/", response_model=List[ProblemOut])
async def get_all_problems(db: AsyncSession = Depends(get_db)) -> List[ProblemOut]:
    """Retrieve a list of all problems.

    Args:
        db: The database session.

    Returns:
        A list of Problem objects.
    """
    result = await db.execute(select(Problem))
    return result.scalars().all()


@router.put("/{problem_id}", response_model=ProblemOut)
async def update_problem(
    problem_id: int,
    update_data: ProblemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProblemOut:
    """Update an existing problem.

    Args:
        problem_id: The ID of the problem to update.
        update_data: The fields to update.
        db: The database session.
        current_user: The authenticated user.

    Returns:
        The updated Problem object.

    Raises:
        HTTPException: If the problem is not found (404) or the user lacks permission (403).
    """
    result = await db.execute(select(Problem).where(Problem.id == problem_id))
    problem = result.scalar_one_or_none()

    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    if problem.creator_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to edit this problem"
        )

    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(problem, key, value)

    await db.commit()
    await db.refresh(problem)
    return problem


@router.delete("/{problem_id}")
async def delete_problem(
    problem_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, str]:
    """Delete a problem.

    Args:
        problem_id: The ID of the problem to delete.
        db: The database session.
        current_user: The authenticated user.

    Returns:
        A confirmation message.

    Raises:
        HTTPException: If the problem is not found (404) or the user lacks permission (403).
    """
    result = await db.execute(select(Problem).where(Problem.id == problem_id))
    problem = result.scalar_one_or_none()

    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    if problem.creator_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this problem"
        )

    await db.delete(problem)
    await db.commit()
    return {"message": "Problem deleted"}


@router.get("/{problem_id}", response_model=ProblemOut)
async def get_problem(
    problem_id: int, db: AsyncSession = Depends(get_db)
) -> ProblemOut:
    """Retrieve a single problem by its ID."""
    result = await db.execute(select(Problem).where(Problem.id == problem_id))
    problem = result.scalar_one_or_none()

    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    return problem
