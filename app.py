from fastapi import FastAPI, HTTPException, UploadFile, Form, File
from pydantic import BaseModel
import shutil
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import uuid


from dotenv import load_dotenv
load_dotenv()
# ENV VARS
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL")

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

WHISPER_MODEL  = os.getenv("WHISPER_MODEL")
#llm
import langchain_groq
from langchain_groq import ChatGroq
llm = ChatGroq(
    temperature=0,
    model=GROQ_MODEL,
    groq_api_key = GROQ_API_KEY
)


#aduio
from groq import Groq

groq_client = Groq(api_key=GROQ_API_KEY)

def transcribe(audio: UploadFile):
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


from llama_index.core import Document as LlamaDocument
class Question(BaseModel):
    text: str
class SummaryRequest(BaseModel):
    content_type: str
    content: str


#Read pdf, return text
from PyPDF2 import PdfReader
def load_pdf_for_query(filename):
    pdfreader = PdfReader(filename)
    rawtext = ''
    for i,page in enumerate(pdfreader.pages):
        content = page.extract_text()
        if content:
            rawtext += content
    return rawtext

#Read pdf, return pages/docs
from langchain_community.document_loaders import PyPDFLoader
def load_pdf_for_summary(filename):
    loader = PyPDFLoader(filename)
    pages = loader.load_and_split()
    return pages

# Function to create Document from text
from langchain_core.documents import Document as LCDocument

def create_docs_from_text(text):
    doc_text_splits = text.split('\n')

    documents = []
    for chunk in doc_text_splits:
        documents.append(
            LCDocument(
                page_content=chunk,
                metadata={}
            )
        )
    return documents

#Load webpage, return text
import re
from langchain_community.document_loaders import WebBaseLoader
def load_webpage_for_query(URL):
    loader = WebBaseLoader(URL)
    docs = loader.load()
    raw_content = docs[0].page_content.strip()
    
    # Remove extra spaces and newlines
    # Replace multiple newlines with a single newline
    cleaned_content = re.sub(r'\n\s*\n+', '\n\n', raw_content)
    return cleaned_content

#Load webpage, return docs
def load_webpage_for_summary(URL):
    loader = WebBaseLoader(URL)
    docs = loader.load()
    return docs

#Text splitter for chromadb embeddings
from langchain_text_splitters import CharacterTextSplitter
def split_documents(text):
    text_splitter = CharacterTextSplitter(
        separator= "\n",
        chunk_size = 800,
        chunk_overlap= 200,
        length_function=len,
    )
    return text_splitter.split_text(text)


#Vector Embeddings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

def create_db(text):
    
    chunks = split_documents(text)
    embed_model = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")


    vector_db = Chroma.from_texts(
        texts=chunks,
        embedding=embed_model,
        collection_name="local-rag"
    )
    
    return vector_db


#Retrieval
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document

"""
Answer a user's question using the vector_db
Arg:
-question (str)
-vector_db (Chroma)
Return:
-answer (str)
"""
def answerQuestion(question: str, vector_db: Chroma) -> str:

    llm = ChatGroq(
        temperature=0,
        model=GROQ_MODEL,
        groq_api_key = GROQ_API_KEY
    )

    system_prompt = (
 """You are a high-performance study tutor trained in the Feynman Technique.
Answer the student's question using ONLY the retrieved context.

### CONTEXT
{context}

### QUESTION
{input}

### INSTRUCTIONS
- Give a clear, simple explanation as if teaching a beginner.
- Use short sentences and concrete examples.
- Include a **1–2 sentence Feynman-style summary** at the end.
- If context is missing something, say “The context does not include that information.”
- Include short quoted snippets from the context to support claims (“...”).
- Do NOT add filler phrases, speculation, or generic introductions.

### ANSWER (NO PREAMBLE):
"""
    )
    
    prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)
    
    retriever = vector_db.as_retriever()
    # Modern Retrieval Chain
    chain = (
        {
            "input": lambda x: x["input"],
            "context": lambda x: retriever.invoke(x["input"])
        }
        | prompt
        | llm
    )

    result = chain.invoke({"input": question})

    # ChatGroq returns a Message, take .content
    return result.content

"""
Grade user's response using the vector_db
Arg:
-transcription (str)
-vector_db (Chroma)
Return:
-answer (str)
"""

def evaluate_coverage(transcription: str, vector_db: Chroma) -> str:
    
    #initilize llm
    llm = ChatGroq(
        temperature=0,
        model=GROQ_MODEL,
        groq_api_key = GROQ_API_KEY
    )


    #system prompt to evaluate coverage
    system_prompt = (
    """You are an intelligent study tutor evaluating how well the user explained the content using the Feynman Technique.

### USER EXPLANATION
{input}

### SOURCE CONTENT
{context}

### INSTRUCTIONS
Your job is to identify:
1. **What the student covered**  
2. **What they missed or skipped**  
3. **Which points should become flashcards (Leitner system)**

Be DIRECT, simple, and factual. No filler language.

### FORMAT

**What you covered (correct, included concepts):**
* [Clear bullet — one idea per bullet]

**What you missed (important concepts not mentioned):**
* [Clear bullet — one idea per bullet]

RULES:
- One bullet = one idea.
- Do NOT say “You mentioned that…” or “The source states…”
- Do NOT restate the entire context.
- Be surgical, clear, and student-friendly.

### ANSWER (NO PREAMBLE):
"""
    )
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "{input}"),
        ]
    )
    
    # Create the chain for query-answering based on retrieval
    retriever = vector_db.as_retriever()
    chain = (
        {
            "input": lambda x: x["input"],
            "context": lambda x: retriever.invoke(x["input"])
        }
        | prompt
        | llm
    )

    output = chain.invoke({"input": transcription})
    return output.content


"""
Grade user's response using the vector_db
Arg:
-transcription (str)
-vector_db (Chroma)
Return:
-answer (str)
"""
def evaluate_accuracy(transcription: str, vector_db: Chroma) -> str:
    # Initialize the LLM
    llm = ChatGroq(
        temperature=0,
        model=GROQ_MODEL,
        groq_api_key = GROQ_API_KEY
    )

    # Create the system prompt to evaluate accuracy
    system_prompt = (
 """You are an intelligent study tutor evaluating the **accuracy** of the user’s explanation.

### USER EXPLANATION
{input}

### SOURCE CONTENT
{context}

### INSTRUCTIONS
Identify:
1. What the student **got right**  
2. What they **got wrong or misunderstood**  
3. Provide corrective versions + proof  

Be direct. No filler.

### FORMAT

**Incorrect or misunderstood:**
* Said: X → Actually: Y ("quoted proof from context")

**Correct points:**
* [Accurate point, short and direct]

**Fix-it Flashcards (Leitner):**
* Q: [What concept was misunderstood?] → A: [Correct version]
* Q: [What does the context actually say about ___?] → A: [Correct explanation]

RULES:
- Always use the “Said: X → Actually: Y” format for errors.
- Quotes key phrases from context only when necessary for evidence.
- One idea per bullet.
- No soft language (“seems”, “appears”, “may be”).

### ANSWER (NO PREAMBLE):
"""
    )
    
    # Setup the prompt for the LLM
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "{input}"),
        ]
    )
    
    # Create the chain for query-answering based on retrieval
    retriever = vector_db.as_retriever()
    
    chain = (
        {
            "input": lambda x: x["input"],
            "context": lambda x: retriever.invoke(x["input"])
        }
        | prompt
        | llm
    )

    output = chain.invoke({"input": transcription})
    return output.content


"""
Give summary of content
Arg:
-docs
Return:
-summary (str)
"""
from langchain_core.prompts import PromptTemplate
def summary(docs):
    context_text = "\n\n".join([d.page_content for d in docs]).strip()
    if not context_text:
        raise HTTPException(status_code=400, detail="Empty text input.")
    print("Context being sent to Groq:\n", context_text[:500])  # first 500 chars

    # Define prompt
    
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            """You are an intelligent study tutor. Summarize the following content clearly and thoroughly.
            
### CONTENT
{context}

### SUMMARY (NO PREAMBLE):
"""
        )
    ])


    llm = ChatGroq(
        temperature=0,
        model=GROQ_MODEL,
        groq_api_key = GROQ_API_KEY
    )


    chain  = prompt | llm
    result = chain.invoke({"context": context_text})

    # chain = create_stuff_documents_chain(llm, prompt)    
    # result = chain.invoke({"context": docs})
    print(result.content)
    return result.content

"""
Delete the vector database.

Args:
-vector_db
"""
def delete_vector_db(vector_db):

    if vector_db is not None:
        vector_db.delete_collection()
       


#FASTAPI
   
app = FastAPI()
# Allow all origins (for development purposes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to specific origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Endpoints

#pass in question, content_type, recieve answer
@app.post("/answer_question")
async def answer_question_api(question: str = Form(None), file: UploadFile = File(None), content: str = Form(None), content_type: str = Form(None)):
    try:
        print("Received content_type:", content_type)
        print("Received question:", question)
        if file and (content_type == 'PDF'):
            print("Processing PDF file...")
            print("name", file.filename)
            file_location = "files"
            os.makedirs(file_location, exist_ok=True)
            file_path = os.path.join(file_location, file.filename)
            with open(file_path, "wb") as file_object:
                file_object.write(await file.read())  
            text = load_pdf_for_query(file_path)
        elif content_type == 'URL':
            url = content
            text = load_webpage_for_query(url)
        elif content_type == 'Text':
            text = content
        else:
            raise HTTPException(status_code=400, detail="Invalid content type")

      

        vector_db = create_db(text)
        result = answerQuestion(question, vector_db)
        value = {"result": result}
        # Clear the vector database
        if vector_db is not None:
            delete_vector_db(vector_db)
        return json.dumps(value)
    except Exception as e:
        print("SERVER ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
    
   
  
from fastapi.responses import JSONResponse
@app.post("/summarize")
async def summarize(file: UploadFile = File(None), content: str = Form(None), content_type: str = Form(None)):
    try:
        docs = None
        print("Received content_type:", content_type)

        if file and (content_type == 'PDF'):
            print("Processing PDF file...")
            print("name", file.filename)
            file_location = "files"
            os.makedirs(file_location, exist_ok=True)
            file_path = os.path.join(file_location, file.filename)
            with open(file_path, "wb") as file_object:
                file_object.write(await file.read())  
            docs = load_pdf_for_summary(file_path)
        elif content_type == 'URL':
            docs = load_webpage_for_summary(content)  
        elif content_type == 'Text':
            docs = create_docs_from_text(content)
        else:
            raise HTTPException(status_code=400, detail="Invalid content type")

        result = summary(docs)
        
        value = {"result": result}
        result = json.dumps(value, ensure_ascii=False, indent=4, separators=(',',': '))
        print(result)


        return result
    except Exception as e:
        print("SERVER ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
    
    

@app.post("/grade")
async def grade(audio: UploadFile = File(None), file: UploadFile= File(None), content: str = Form(None), content_type: str = Form(None), text: str = Form(None)):
    try:

        print("hello")
        # Accept either an uploaded audio file OR a plain text transcription
        if audio:
            print(f"Received audio file: {audio.filename}")
            transcription = transcribe(audio)
        elif text:
            print("Received text input for grading")
            transcription = text
        else:
            raise HTTPException(status_code=400, detail="No audio file or text provided for grading")
        print("transcription", transcription)
        
        print("Received content_type:", content_type)
        if file and (content_type == 'PDF'):
            print("Processing PDF file...")
            print("name", file.filename)
            file_location = "files"
            os.makedirs(file_location, exist_ok=True)
            file_path = os.path.join(file_location, file.filename)
            with open(file_path, "wb") as file_object:
                file_object.write(await file.read())  # Ensure to read the file content correctly
            text = load_pdf_for_query(file_path)
        elif content_type == 'URL':
            url = content
            text = load_webpage_for_query(url)
        elif content_type == 'Text':
            text = content
        else:
            raise HTTPException(status_code=400, detail="Invalid content type")

      

        vector_db = create_db(text)
        # Evaluate coverage
        coverage = evaluate_coverage(transcription, vector_db)
        print("coverage", coverage)
        # Evaluate accuracy
        accuracy = evaluate_accuracy(transcription, vector_db)
        print("accuracy", accuracy)

        # Clear the vector database
        if vector_db is not None:
            delete_vector_db(vector_db)
        # Return structured JSON with explicit keys for the frontend
        return JSONResponse(content={"coverage": coverage, "accuracy": accuracy})
        

    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


#Summarize text
# text = """ A cookie (American English) or biscuit (British English) is a baked snack or dessert that is typically small, flat, and sweet. It usually contains flour, sugar, egg, and some type of oil, fat, or butter. It may include other ingredients such as raisins, oats, chocolate chips, or nuts.
# Most English-speaking countries call crunchy cookies "biscuits", except for the United States and Canada, where "biscuit" refers to a type of quick bread. Chewier biscuits are sometimes called "cookies" even in the United Kingdom.[3] Some cookies may also be named by their shape, such as date squares or bars.
# Biscuit or cookie variants include sandwich biscuits, such as custard creams, Jammie Dodgers, Bourbons, and Oreos, with marshmallows or jam filling and sometimes dipped in chocolate or another sweet coating. Cookies are often served with beverages such as milk, coffee, or tea and sometimes dunked, an approach which releases more flavour from confections by dissolving the sugars,[4] while also softening their texture. Factory-made cookies are sold in grocery stores, convenience stores, and vending machines. Fresh-baked cookies are sold at bakeries and coffeehouses.
# """
# docs = create_docs_from_text(text)
# summary = summary(docs)
# print(summary)


# summarize pdf
# filename = "vm-api.pdf"
# docs = load_pdf_for_summary(filename)
# summary = summary(docs)
# print(summary)

#summarize webpage
# URL = "https://lilianweng.github.io/posts/2023-06-23-agent/"
# docs = load_webpage_for_summary(URL)
# summary(docs)

#answer question from pdf
# filename = "vm-api.pdf"
# text = load_pdf_for_query(filename)
# db = create_db(text)
# question = "What is the error when you don't allocate enough memory?"

# answer = answerQuestion(question, db)
# print(answer)

#answer question from webpage
# URL = "https://lilianweng.github.io/posts/2023-06-23-agent/"
# text = load_webpage_for_query(URL)
# db = create_db(text)
# question = "What does the chain of hindsight do for the model?"
# answer = answerQuestion(question, db)
# print(answer)

#DATABASE
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
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

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#database endpoints
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import distinct  
from pydantic import BaseModel
from typing import List, Optional


#create or update
class NoteBase(BaseModel):
    subject: str
    title: str
    content: str
    color: str
    # id: int
class NoteCreate(NoteBase):
    pass

class NoteUpdate(NoteBase):
    subject: str
    title: str
    content: str
    color: str

# Read model (used for returning notes with ID)
class NoteRead(NoteBase):
    id: int  # Include the id in the response

    class Config:
        orm_mode = True  # To work with ORM models

        
#add note
@app.post("/notes/")
def add_note(note: NoteCreate, db: Session = Depends(get_db)):

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

#get note, filter by subject
@app.get("/notes/", response_model=List[NoteRead])
def get_notes(subject: Optional[str] = None, db: Session = Depends(get_db)):
    if subject:
        return db.query(NoteModel).filter(NoteModel.subject == subject).all()
    return db.query(NoteModel).all()

#get subjects
@app.get("/notes/subjects", response_model=List[str])  
def get_unique_subjects(db: Session = Depends(get_db)):
    subjects = db.query(distinct(NoteModel.subject)).all()
    return [subject[0] for subject in subjects]  


#edit note, update
@app.put("/notes/{note_id}")
def update_note(note_id: int, note: NoteUpdate, db: Session = Depends(get_db)):
    db_note = db.query(NoteModel).filter(NoteModel.id == note_id).first()
    
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if db_note:
        for key, value in note.model_dump().items():
            setattr(db_note, key, value)
        db.commit()
        db.refresh(db_note)
    return db_note

#delete note
@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    db_note = db.query(NoteModel).filter(NoteModel.id == note_id).first()
    if db_note:
        db.delete(db_note)
        db.commit()
    return {"message": "Note deleted"}


# FLASHCARD ENDPOINTS
class FlashcardBase(BaseModel):
    subject: str
    question: str
    answer: str
    color: str

class FlashcardCreate(FlashcardBase):
    pass

class FlashcardUpdate(FlashcardBase):
    subject: str
    question: str
    answer: str
    color: str

class FlashcardRead(FlashcardBase):
    id: int

    class Config:
        orm_mode = True

#add flashcard
@app.post("/flashcards/")
def add_flashcard(flashcard: FlashcardCreate, db: Session = Depends(get_db)):
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

#get flashcards, filter by subject
@app.get("/flashcards/", response_model=List[FlashcardRead])
def get_flashcards(subject: Optional[str] = None, db: Session = Depends(get_db)):
    if subject:
        return db.query(FlashcardModel).filter(FlashcardModel.subject == subject).all()
    return db.query(FlashcardModel).all()

#get subjects
@app.get("/flashcards/subjects", response_model=List[str])
def get_unique_flashcard_subjects(db: Session = Depends(get_db)):
    subjects = db.query(distinct(FlashcardModel.subject)).all()
    return [subject[0] for subject in subjects]

#edit flashcard, update
@app.put("/flashcards/{flashcard_id}")
def update_flashcard(flashcard_id: int, flashcard: FlashcardUpdate, db: Session = Depends(get_db)):
    db_flashcard = db.query(FlashcardModel).filter(FlashcardModel.id == flashcard_id).first()
    
    if not db_flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    if db_flashcard:
        for key, value in flashcard.model_dump().items():
            setattr(db_flashcard, key, value)
        db.commit()
        db.refresh(db_flashcard)
    return db_flashcard

#delete flashcard
@app.delete("/flashcards/{flashcard_id}")
def delete_flashcard(flashcard_id: int, db: Session = Depends(get_db)):
    db_flashcard = db.query(FlashcardModel).filter(FlashcardModel.id == flashcard_id).first()
    if db_flashcard:
        db.delete(db_flashcard)
        db.commit()
    return {"message": "Flashcard deleted"}