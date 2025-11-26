"""
Pydantic schemas for API request/response validation
"""
from pydantic import BaseModel
from typing import Optional


# Notes
class NoteBase(BaseModel):
    subject: str
    title: str
    content: str
    color: str


class NoteCreate(NoteBase):
    pass


class NoteUpdate(NoteBase):
    pass


class NoteRead(NoteBase):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True


# Flashcards
class FlashcardBase(BaseModel):
    subject: str
    question: str
    answer: str
    color: str


class FlashcardCreate(FlashcardBase):
    pass


class FlashcardUpdate(FlashcardBase):
    pass


class FlashcardRead(FlashcardBase):
    id: int
    leitner_box: Optional[int] = 1
    next_review: Optional[str] = None
    review_history: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True


# Study requests
class Question(BaseModel):
    text: str


class SummaryRequest(BaseModel):
    content_type: str
    content: str


class ReviewRequest(BaseModel):
    result: str  # "again", "hard", "good", or "easy"


class FlashcardGenerationRequest(BaseModel):
    source_type: str  # "summary", "coverage", "accuracy", "qa_answer"
    content: str
    subject: Optional[str] = "General"
