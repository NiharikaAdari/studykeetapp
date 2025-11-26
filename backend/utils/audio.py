"""
Audio transcription utilities using Groq Whisper
"""
from fastapi import UploadFile, HTTPException
from groq import Groq
from backend.config import GROQ_API_KEY, WHISPER_MODEL

groq_client = Groq(api_key=GROQ_API_KEY)


def transcribe(audio: UploadFile) -> str:
    """Transcribe audio file using Groq Whisper"""
    try:
        audio_bytes = audio.file.read()

        result = groq_client.audio.transcriptions.create(
            file=(audio.filename, audio_bytes),
            model=WHISPER_MODEL,
        )

        return result.text

    except Exception as e:
        print(f"Groq Whisper error: {e}")
        raise HTTPException(status_code=500, detail="Transcription failed")
