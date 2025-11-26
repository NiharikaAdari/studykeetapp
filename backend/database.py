"""
Database models and session management
"""
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from backend.config import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class NoteModel(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String(255))
    title = Column(String(255))
    content = Column(Text)
    color = Column(String(50))
    timestamp = Column(DateTime, default=datetime.now())


class FlashcardModel(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String(255))
    question = Column(Text)
    answer = Column(Text)
    color = Column(String(50))
    timestamp = Column(DateTime, default=datetime.now())
    leitner_box = Column(Integer, default=1, nullable=True)
    next_review = Column(DateTime, default=datetime.now, nullable=True)
    review_history = Column(Text, nullable=True)


# Create tables
Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for database sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
