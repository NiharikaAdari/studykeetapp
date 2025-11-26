# StudyKeet Backend Architecture

## Request Flow Diagram

```
Frontend (Electron/React)
         ↓
    HTTP Request
         ↓
┌────────────────────────────────────────┐
│         main.py (FastAPI App)          │
│  - CORS Middleware                     │
│  - Route Registration                  │
└────────────────────────────────────────┘
         ↓
    Router Layer
         ↓
┌────────────────────────────────────────┐
│         backend/routes/                │
│  ┌──────────────────────────────────┐  │
│  │ study.py                         │  │
│  │  - /answer_question              │  │
│  │  - /summarize                    │  │
│  │  - /grade                        │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ notes.py                         │  │
│  │  - CRUD operations for notes     │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ flashcards.py                    │  │
│  │  - CRUD operations               │  │
│  │  - Leitner spaced repetition     │  │
│  │  - Flashcard generation          │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
         ↓
    Business Logic
         ↓
┌────────────────────────────────────────┐
│         backend/utils/                 │
│  ┌──────────────────────────────────┐  │
│  │ rag.py                           │  │
│  │  - create_db()                   │  │
│  │  - answer_question()             │  │
│  │  - evaluate_coverage()           │  │
│  │  - evaluate_accuracy()           │  │
│  │  - summarize()                   │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ document_loader.py               │  │
│  │  - load_pdf_for_query()          │  │
│  │  - load_webpage_for_query()      │  │
│  │  - create_docs_from_text()       │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ flashcard_generator.py           │  │
│  │  - generate_flashcards()         │  │
│  │  - Prompt templates              │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ audio.py                         │  │
│  │  - transcribe()                  │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
         ↓
    Data Layer
         ↓
┌────────────────────────────────────────┐
│      backend/database.py               │
│  - SQLAlchemy Models                   │
│  - Session Management                  │
│  - NoteModel                           │
│  - FlashcardModel                      │
└────────────────────────────────────────┘
         ↓
    PostgreSQL Database
         &
    External Services
┌────────────────────────────────────────┐
│  - ChromaDB (Vector DB)                │
│  - Groq API (LLM)                      │
│  - HuggingFace (Embeddings)            │
└────────────────────────────────────────┘
```

## Module Responsibilities

### `main.py`
- FastAPI application initialization
- CORS middleware configuration
- Router registration
- Health check endpoints

### `backend/config.py`
- Environment variable loading
- Configuration constants
- Database URL construction

### `backend/schemas.py`
- Pydantic models for request validation
- Response models
- Type definitions

### `backend/database.py`
- SQLAlchemy ORM models
- Database engine setup
- Session factory
- Database connection management

### `backend/routes/`
**study.py** - Study-related endpoints
- Question answering with RAG
- Content summarization
- Coverage and accuracy grading
- Audio transcription integration

**notes.py** - Notes management
- Create, read, update, delete notes
- Filter by subject
- Get unique subjects list

**flashcards.py** - Flashcard system
- CRUD operations for flashcards
- Leitner spaced repetition system
- Session statistics and preview
- AI-powered flashcard generation

### `backend/utils/`
**rag.py** - Retrieval Augmented Generation
- Vector database creation and management
- Question answering with context
- Coverage evaluation (what was covered/missed)
- Accuracy evaluation (correct/incorrect)
- Content summarization

**document_loader.py** - Content processing
- PDF loading and text extraction
- Web page scraping and cleaning
- Text document creation
- Text splitting for embeddings

**flashcard_generator.py** - AI generation
- Prompt templates for different content types
- LLM-based flashcard generation
- JSON parsing and validation

**audio.py** - Audio processing
- Groq Whisper integration
- Audio file transcription

## Data Flow Examples

### Example 1: Question Answering
```
User uploads PDF → 
document_loader.load_pdf_for_query() → 
rag.create_db() → 
rag.answer_question() → 
Response to frontend
```

### Example 2: Grading
```
User records audio → 
audio.transcribe() → 
document_loader processes source → 
rag.evaluate_coverage() → 
rag.evaluate_accuracy() → 
Response with both evaluations
```

### Example 3: Flashcard Generation
```
User completes study session → 
flashcard_generator.generate_flashcards_from_content() → 
Groq LLM generates cards → 
flashcards.py saves to database → 
Response with saved cards
```

## Environment Configuration

All configuration is centralized in `backend/config.py` and loaded from `.env`:

```
GROQ_API_KEY         → Used by rag.py, flashcard_generator.py, audio.py
GROQ_MODEL           → LLM model selection
WHISPER_MODEL        → Audio transcription model
DB_USER/DB_PASSWORD  → Database credentials
DB_HOST/DB_PORT      → Database connection
DB_NAME              → Database name
```

## Benefits of This Architecture

✅ **Separation of Concerns**: Each module has a single, clear responsibility
✅ **Testability**: Easy to write unit tests for individual functions
✅ **Maintainability**: Find and fix bugs faster with organized code
✅ **Scalability**: Add new features without touching unrelated code
✅ **Collaboration**: Multiple developers can work on different modules
✅ **Reusability**: Utility functions can be imported anywhere
✅ **Documentation**: Clear structure makes codebase self-documenting
