from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..database import get_db
from ..models import Note, User
from ..schemas import NoteCreate, NoteUpdate, NoteOut, NoteFromProblem
from ..auth.utils import get_current_user
from ..services.problem_ingestion import fetch_problem_details

router = APIRouter(prefix="/notes", tags=["notes"])

@router.get("/", response_model=List[NoteOut])
async def list_notes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all notes for the authenticated user."""
    query = select(Note).where(Note.user_id == current_user.id).order_by(Note.updated_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_in: NoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new note."""
    new_note = Note(
        title=note_in.title,
        content=note_in.content,
        user_id=current_user.id
    )
    db.add(new_note)
    await db.commit()
    await db.refresh(new_note)
    return new_note

@router.get("/{note_id}", response_model=NoteOut)
async def get_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific note by ID."""
    query = select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    result = await db.execute(query)
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.put("/{note_id}", response_model=NoteOut)
async def update_note(
    note_id: int,
    note_in: NoteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a note's title or content."""
    query = select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    result = await db.execute(query)
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if note_in.title is not None:
        note.title = note_in.title
    if note_in.content is not None:
        note.content = note_in.content
        
    await db.commit()
    await db.refresh(note)
    return note

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a note."""
    query = select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    result = await db.execute(query)
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    await db.delete(note)
    await db.commit()
    return None


@router.post("/from-problem", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note_from_problem(
    note_in: NoteFromProblem,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new note from a DSA problem URL."""
    # Fetch problem details and format as blocks
    blocks = await fetch_problem_details(note_in.url, note_in.title)
    
    new_note = Note(
        title=note_in.title,
        content=blocks,
        user_id=current_user.id
    )
    db.add(new_note)
    await db.commit()
    await db.refresh(new_note)
    return new_note
