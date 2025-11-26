# Migration Guide: app.py → Modular Structure

## What Changed

The monolithic `app.py` (1342 lines) has been reorganized into a modular structure:

### New Structure:
```
backend/
├── config.py              # Environment variables & configuration
├── database.py            # SQLAlchemy models (NoteModel, FlashcardModel)
├── schemas.py             # Pydantic models for validation
├── routes/
│   ├── study.py          # /answer_question, /summarize, /grade
│   ├── notes.py          # /notes/* endpoints
│   └── flashcards.py     # /flashcards/* endpoints (including Leitner)
└── utils/
    ├── audio.py          # Audio transcription (Whisper)
    ├── document_loader.py # PDF/URL/text loading functions
    ├── rag.py            # Vector DB, RAG, summarization, grading
    └── flashcard_generator.py # AI flashcard generation prompts & logic

main.py                    # New FastAPI app entry point (replaces app.py)
```

## Migration Steps

### Option 1: Automatic (Recommended)
1. Keep your existing `.env` file (no changes needed)
2. Run the startup script:
   - Windows: `start-dev.bat`
   - Linux/Mac: `./start-dev.sh`

### Option 2: Manual
1. Update your startup command from:
   ```bash
   uvicorn app:app --reload
   ```
   To:
   ```bash
   uvicorn main:app --reload
   ```

2. That's it! All endpoints remain the same.

## What Stays the Same

✅ **All API endpoints** - No changes to URLs or request/response formats
✅ **Database schema** - Same tables, same columns
✅ **Frontend code** - No changes needed
✅ **.env file** - Same environment variables
✅ **requirements.txt** - Same dependencies

## Benefits of New Structure

1. **Better Organization**: Related code is grouped together
2. **Easier Maintenance**: Find code faster, smaller files
3. **Team Collaboration**: Multiple people can work on different modules
4. **Testing**: Easier to write unit tests for individual modules
5. **Scalability**: Add new features without cluttering main file

## Backwards Compatibility

The old `app.py` still exists and works. You can:
- Use `uvicorn app:app --reload` (old way)
- Use `uvicorn main:app --reload` (new way)

Both serve identical endpoints!

## Troubleshooting

**Import Errors:**
```
ModuleNotFoundError: No module named 'backend'
```
Solution: Make sure you're running from the root directory (where main.py is located)

**Still using old app.py?**
If you prefer the old structure, continue using:
```bash
uvicorn app:app --reload
```

## Future Deprecation

Once you've verified the new structure works:
1. Delete or rename `app.py` → `app.py.backup`
2. Update any documentation to reference `main.py`
3. Enjoy cleaner, more maintainable code!
