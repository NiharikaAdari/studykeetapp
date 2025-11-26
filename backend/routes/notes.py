"""
Notes CRUD API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from typing import List, Optional

from backend.database import get_db, NoteModel
from backend.schemas import NoteCreate, NoteUpdate, NoteRead

router = APIRouter()


@router.post("/notes/")
def add_note(note: NoteCreate, db: Session = Depends(get_db)):
    """Create a new note"""
    db_note = NoteModel(
        subject=note.subject,
        title=note.title,
        content=note.content,
        color=note.color
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.get("/notes/", response_model=List[NoteRead])
def get_notes(subject: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all notes, optionally filtered by subject"""
    if subject:
        return db.query(NoteModel).filter(NoteModel.subject == subject).all()
    return db.query(NoteModel).all()


@router.get("/notes/subjects", response_model=List[str])
def get_unique_subjects(db: Session = Depends(get_db)):
    """Get list of unique subjects"""
    subjects = db.query(distinct(NoteModel.subject)).all()
    return [subject[0] for subject in subjects]


@router.put("/notes/{note_id}")
def update_note(note_id: int, note: NoteUpdate, db: Session = Depends(get_db)):
    """Update an existing note"""
    db_note = db.query(NoteModel).filter(NoteModel.id == note_id).first()
    
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    for key, value in note.model_dump().items():
        setattr(db_note, key, value)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    """Delete a note"""
    db_note = db.query(NoteModel).filter(NoteModel.id == note_id).first()
    if db_note:
        db.delete(db_note)
        db.commit()
    return {"message": "Note deleted"}
