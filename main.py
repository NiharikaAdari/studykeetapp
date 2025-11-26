"""
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes import study, notes, flashcards

app = FastAPI(title="StudyKeet API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(study.router, tags=["Study"])
app.include_router(notes.router, tags=["Notes"])
app.include_router(flashcards.router, tags=["Flashcards"])


@app.get("/")
def root():
    return {"message": "StudyKeet API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
