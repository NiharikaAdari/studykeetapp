"""
Study-related API endpoints (question answering, summarization, grading)
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
import os
import json

from backend.config import UPLOAD_DIR
from backend.utils.document_loader import (
    load_pdf_for_query, load_pdf_for_summary,
    load_webpage_for_query, load_webpage_for_summary,
    create_docs_from_text
)
from backend.utils.rag import (
    create_db, delete_vector_db,
    answer_question, evaluate_coverage,
    evaluate_accuracy, summarize
)
from backend.utils.audio import transcribe

router = APIRouter()


@router.post("/answer_question")
async def answer_question_api(
    question: str = Form(None),
    file: UploadFile = File(None),
    content: str = Form(None),
    content_type: str = Form(None)
):
    """Answer a question based on provided content"""
    try:
        print(f"Received content_type: {content_type}")
        print(f"Received question: {question}")
        
        if file and (content_type == 'PDF'):
            print(f"Processing PDF file: {file.filename}")
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as file_object:
                file_object.write(await file.read())
            text = load_pdf_for_query(file_path)
        elif content_type == 'URL':
            text = load_webpage_for_query(content)
        elif content_type == 'Text':
            text = content
        else:
            raise HTTPException(status_code=400, detail="Invalid content type")

        vector_db = create_db(text)
        result = answer_question(question, vector_db)
        value = {"result": result}
        
        delete_vector_db(vector_db)
        return json.dumps(value)
        
    except Exception as e:
        print(f"SERVER ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/summarize")
async def summarize_endpoint(
    file: UploadFile = File(None),
    content: str = Form(None),
    content_type: str = Form(None)
):
    """Summarize provided content"""
    try:
        print(f"Received content_type: {content_type}")

        if file and (content_type == 'PDF'):
            print(f"Processing PDF file: {file.filename}")
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as file_object:
                file_object.write(await file.read())
            docs = load_pdf_for_summary(file_path)
        elif content_type == 'URL':
            docs = load_webpage_for_summary(content)
        elif content_type == 'Text':
            docs = create_docs_from_text(content)
        else:
            raise HTTPException(status_code=400, detail="Invalid content type")

        result = summarize(docs)
        value = {"result": result}
        result = json.dumps(value, ensure_ascii=False, indent=4, separators=(',', ': '))
        
        return result
        
    except Exception as e:
        print(f"SERVER ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/grade")
async def grade_endpoint(
    audio: UploadFile = File(None),
    file: UploadFile = File(None),
    content: str = Form(None),
    content_type: str = Form(None),
    text: str = Form(None)
):
    """Grade user's explanation (coverage and accuracy)"""
    try:
        # Accept either an uploaded audio file OR a plain text transcription
        if audio:
            print(f"Received audio file: {audio.filename}")
            transcription = transcribe(audio)
        elif text:
            print("Received text input for grading")
            transcription = text
        else:
            raise HTTPException(status_code=400, detail="No audio file or text provided for grading")
        
        print(f"transcription: {transcription}")
        print(f"Received content_type: {content_type}")
        
        if file and (content_type == 'PDF'):
            print(f"Processing PDF file: {file.filename}")
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as file_object:
                file_object.write(await file.read())
            text = load_pdf_for_query(file_path)
        elif content_type == 'URL':
            text = load_webpage_for_query(content)
        elif content_type == 'Text':
            text = content
        else:
            raise HTTPException(status_code=400, detail="Invalid content type")

        vector_db = create_db(text)
        
        # Evaluate coverage
        coverage = evaluate_coverage(transcription, vector_db)
        print(f"coverage: {coverage}")
        
        # Evaluate accuracy
        accuracy = evaluate_accuracy(transcription, vector_db)
        print(f"accuracy: {accuracy}")

        delete_vector_db(vector_db)
        
        return JSONResponse(content={"coverage": coverage, "accuracy": accuracy})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
