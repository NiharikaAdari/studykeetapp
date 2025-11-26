"""
Flashcards CRUD and Leitner spaced repetition API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import distinct, text
from typing import List, Optional
from datetime import datetime, timedelta
import json as py_json

from backend.database import get_db, FlashcardModel
from backend.schemas import (
    FlashcardCreate, FlashcardUpdate, FlashcardRead,
    ReviewRequest, FlashcardGenerationRequest
)
from backend.utils.flashcard_generator import generate_flashcards_from_content

router = APIRouter()


# CRUD Operations
@router.post("/flashcards/")
def add_flashcard(flashcard: FlashcardCreate, db: Session = Depends(get_db)):
    """Create a new flashcard"""
    db_flashcard = FlashcardModel(
        subject=flashcard.subject,
        question=flashcard.question,
        answer=flashcard.answer,
        color=flashcard.color
    )
    db.add(db_flashcard)
    db.commit()
    db.refresh(db_flashcard)
    return db_flashcard


@router.get("/flashcards/")
def get_flashcards(subject: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all flashcards, optionally filtered by subject"""
    try:
        if subject:
            cards = db.query(FlashcardModel).filter(FlashcardModel.subject == subject).all()
        else:
            cards = db.query(FlashcardModel).all()
        
        result = []
        for card in cards:
            card_dict = {
                "id": card.id,
                "subject": card.subject,
                "question": card.question,
                "answer": card.answer,
                "color": card.color,
                "leitner_box": getattr(card, 'leitner_box', 1) or 1,
                "next_review": getattr(card, 'next_review', None),
                "review_history": getattr(card, 'review_history', None)
            }
            result.append(card_dict)
        return result
    except Exception as e:
        print(f"Error fetching flashcards: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/flashcards/subjects", response_model=List[str])
def get_unique_flashcard_subjects(db: Session = Depends(get_db)):
    """Get list of unique subjects"""
    subjects = db.query(distinct(FlashcardModel.subject)).all()
    return [subject[0] for subject in subjects]


@router.put("/flashcards/{flashcard_id}")
def update_flashcard(flashcard_id: int, flashcard: FlashcardUpdate, db: Session = Depends(get_db)):
    """Update an existing flashcard"""
    db_flashcard = db.query(FlashcardModel).filter(FlashcardModel.id == flashcard_id).first()
    
    if not db_flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    for key, value in flashcard.model_dump().items():
        setattr(db_flashcard, key, value)
    db.commit()
    db.refresh(db_flashcard)
    return db_flashcard


@router.delete("/flashcards/{flashcard_id}")
def delete_flashcard(flashcard_id: int, db: Session = Depends(get_db)):
    """Delete a flashcard"""
    db_flashcard = db.query(FlashcardModel).filter(FlashcardModel.id == flashcard_id).first()
    if db_flashcard:
        db.delete(db_flashcard)
        db.commit()
    return {"message": "Flashcard deleted"}


# Leitner System Endpoints
@router.post("/flashcards/migrate")
def migrate_flashcards(db: Session = Depends(get_db)):
    """Migration endpoint to add Leitner columns"""
    try:
        # Try to add columns if they don't exist
        try:
            db.execute(text("ALTER TABLE flashcards ADD COLUMN leitner_box INTEGER DEFAULT 1"))
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"leitner_box column might already exist: {e}")
        
        try:
            db.execute(text("ALTER TABLE flashcards ADD COLUMN next_review TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"next_review column might already exist: {e}")
        
        try:
            db.execute(text("ALTER TABLE flashcards ADD COLUMN review_history TEXT"))
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"review_history column might already exist: {e}")
        
        # Update any NULL values
        flashcards = db.query(FlashcardModel).all()
        updated_count = 0
        
        for flashcard in flashcards:
            if flashcard.leitner_box is None:
                flashcard.leitner_box = 1
                updated_count += 1
            if flashcard.next_review is None:
                flashcard.next_review = datetime.now()
                updated_count += 1
        
        db.commit()
        return {
            "message": f"Migration successful. Updated {updated_count} flashcard fields",
            "total_cards": len(flashcards)
        }
    except Exception as e:
        return {"message": f"Migration completed with warnings: {str(e)}"}


@router.get("/flashcards/due")
def get_due_flashcards(subject: Optional[str] = None, db: Session = Depends(get_db)):
    """Get cards due for review today"""
    try:
        now = datetime.now()
        query = db.query(FlashcardModel).filter(FlashcardModel.next_review <= now)
        
        if subject:
            query = query.filter(FlashcardModel.subject == subject)
            
        due_cards = query.order_by(FlashcardModel.leitner_box.asc()).all()
        
        result = []
        for card in due_cards:
            card_dict = {
                "id": card.id,
                "subject": card.subject,
                "question": card.question,
                "answer": card.answer,
                "color": card.color,
                "leitner_box": getattr(card, 'leitner_box', 1) or 1,
                "next_review": getattr(card, 'next_review', None),
                "review_history": getattr(card, 'review_history', None)
            }
            result.append(card_dict)
        return result
    except Exception as e:
        print(f"Error fetching due flashcards: {e}")
        # Fallback: return all cards
        cards = db.query(FlashcardModel).all()
        result = []
        for card in cards:
            card_dict = {
                "id": card.id,
                "subject": card.subject,
                "question": card.question,
                "answer": card.answer,
                "color": card.color,
                "leitner_box": 1,
                "next_review": None,
                "review_history": None
            }
            result.append(card_dict)
        return result


@router.post("/flashcards/review/{flashcard_id}")
def review_flashcard(flashcard_id: int, review: ReviewRequest, db: Session = Depends(get_db)):
    """Review a flashcard (mark again/hard/good/easy)"""
    flashcard = db.query(FlashcardModel).filter(FlashcardModel.id == flashcard_id).first()
    
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    # Update Leitner nest based on result
    if review.result == "again":
        flashcard.leitner_box = 1
        flashcard.next_review = datetime.now() + timedelta(minutes=15)
    elif review.result == "hard":
        flashcard.leitner_box = 2
        flashcard.next_review = datetime.now() + timedelta(days=1)
    elif review.result == "good":
        flashcard.leitner_box = 3
        flashcard.next_review = datetime.now() + timedelta(days=2)
    elif review.result == "easy":
        flashcard.leitner_box = 4
        flashcard.next_review = datetime.now() + timedelta(days=7)
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid result. Use 'again', 'hard', 'good', or 'easy'"
        )
    
    # Update review history
    history = []
    if flashcard.review_history:
        try:
            history = py_json.loads(flashcard.review_history)
        except:
            history = []
    
    history.append({
        "date": datetime.now().isoformat(),
        "result": review.result,
        "box": flashcard.leitner_box
    })
    
    flashcard.review_history = py_json.dumps(history)
    
    db.commit()
    db.refresh(flashcard)
    return flashcard


@router.post("/flashcards/reset/{flashcard_id}")
def reset_flashcard(flashcard_id: int, db: Session = Depends(get_db)):
    """Reset a flashcard to box 1"""
    flashcard = db.query(FlashcardModel).filter(FlashcardModel.id == flashcard_id).first()
    
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    flashcard.leitner_box = 1
    flashcard.next_review = datetime.now()
    
    db.commit()
    db.refresh(flashcard)
    return flashcard


@router.get("/flashcards/session/stats")
def get_session_stats(db: Session = Depends(get_db)):
    """Get session statistics"""
    now = datetime.now()
    
    due_today = db.query(FlashcardModel).filter(FlashcardModel.next_review <= now).count()
    total_cards = db.query(FlashcardModel).count()
    
    box_distribution = {}
    for box_num in [1, 2, 3, 4]:
        count = db.query(FlashcardModel).filter(FlashcardModel.leitner_box == box_num).count()
        box_distribution[box_num] = count
    
    return {
        "due_today": due_today,
        "total": total_cards,
        "remaining": due_today,
        "box_distribution": box_distribution
    }


@router.get("/flashcards/session/preview")
def get_session_preview(db: Session = Depends(get_db)):
    """Get preview stats by subject"""
    now = datetime.now()
    
    subjects = db.query(FlashcardModel.subject).distinct().all()
    subjects = [s[0] for s in subjects if s[0]]
    
    preview = {}
    for subject in subjects:
        due_count = db.query(FlashcardModel).filter(
            FlashcardModel.subject == subject,
            FlashcardModel.next_review <= now
        ).count()
        
        box_dist = {}
        for box_num in [1, 2, 3, 4]:
            count = db.query(FlashcardModel).filter(
                FlashcardModel.subject == subject,
                FlashcardModel.leitner_box == box_num,
                FlashcardModel.next_review <= now
            ).count()
            box_dist[f"box_{box_num}"] = count
        
        preview[subject] = {
            "due_count": due_count,
            **box_dist
        }
    
    # Include "All" subjects
    total_due = db.query(FlashcardModel).filter(FlashcardModel.next_review <= now).count()
    all_box_dist = {}
    for box_num in [1, 2, 3, 4]:
        count = db.query(FlashcardModel).filter(
            FlashcardModel.leitner_box == box_num,
            FlashcardModel.next_review <= now
        ).count()
        all_box_dist[f"box_{box_num}"] = count
    
    preview["All"] = {
        "due_count": total_due,
        **all_box_dist
    }
    
    return preview


# Flashcard Generation
@router.post("/flashcards/generate-preview")
async def generate_flashcards_preview(request: FlashcardGenerationRequest):
    """Generate flashcards without saving - for preview only"""
    try:
        print(f"Received flashcard preview request: source_type={request.source_type}")
        
        flashcards_data = generate_flashcards_from_content(request.source_type, request.content)
        
        print(f"Generated {len(flashcards_data)} flashcards for preview")
        
        return {
            "flashcards": flashcards_data,
            "count": len(flashcards_data)
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error generating flashcard preview: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/flashcards/generate")
async def generate_flashcards(request: FlashcardGenerationRequest, db: Session = Depends(get_db)):
    """Generate and save flashcards"""
    try:
        print(f"Received flashcard generation request: source_type={request.source_type}, subject={request.subject}")
        
        flashcards_data = generate_flashcards_from_content(request.source_type, request.content)
        
        print(f"Parsed {len(flashcards_data)} flashcards from LLM response")
        
        # Save flashcards to database
        saved_flashcards = []
        colors = ["yellow.300", "pink.300", "blue.300", "green.300", "purple.300"]
        
        for idx, card in enumerate(flashcards_data):
            if "q" not in card or "a" not in card:
                print(f"Skipping card {idx}: missing q or a fields")
                continue
                
            db_flashcard = FlashcardModel(
                subject=request.subject,
                question=card["q"],
                answer=card["a"],
                color=colors[idx % len(colors)],
                leitner_box=1,
                next_review=datetime.now()
            )
            db.add(db_flashcard)
            saved_flashcards.append({
                "question": card["q"],
                "answer": card["a"]
            })
        
        db.commit()
        print(f"Successfully saved {len(saved_flashcards)} flashcards to database")
        
        return {
            "message": f"Generated and saved {len(saved_flashcards)} flashcards",
            "flashcards": saved_flashcards,
            "count": len(saved_flashcards)
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error generating flashcards: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
