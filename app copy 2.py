from fastapi import FastAPI, HTTPException, UploadFile, Form, File
from pydantic import BaseModel
import shutil
from fastapi.middleware.cors import CORSMiddleware
import os
import json

#aduio
import whisper
def transcribe(file: UploadFile):
    model = whisper.load_model("base")
    result = model.transcribe(file)
    return result["text"]


from llama_index.core import SummaryIndex
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core import Settings
from llama_index.core import Document

def evaluate_coverage(transcription, content):
    embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")
    llm = ChatOllama(model="llama3", temperature=0)
    Settings.llm = llm
    Settings.embed_model = embed_model

    prompt_template = f"""You are an AI assistant that helps the user use the feynman technique to explain content to better understand it. The user explained the following content:
    User Explanation: "{transcription}"
    
    Compare it with the original source content:
    <context>
    "{content}"
    </context>
    Evaluate the user's response. Tell the user ***what you covered*** and ***what you didn't cover*** in their explanation, with keywords from the original content.
    """
    docs = [Document(id="1", text=content)]
    summary_index = SummaryIndex.from_documents(docs)
    summary_engine = summary_index.as_query_engine()
    response = summary_engine.query(prompt_template)

    return str(response)

def evaluate_accuracy(transcription, content):
    embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")
    llm = ChatOllama(model="llama3", temperature=0)
    Settings.llm = llm
    Settings.embed_model = embed_model

    prompt_template = f"""You are an AI assistant that helps the user use the feynman technique to explain content to better understand it. The user explained the following content:
    User Explanation: "{transcription}"
    
    Compare it with the original content:
    <context>
    "{content}"
    </context>
    
    Evaluate the user's response. If they got anything wrong, tell them ***what they got wrong*** and include snippets from the content as proof. If they got things correct, tell them ***what they got correct***.
    """
    docs = [Document(id="1", text=content)]
    summary_index = SummaryIndex.from_documents(docs)
    summary_engine = summary_index.as_query_engine()
    response = summary_engine.query(prompt_template)

    return str(response)

class Question(BaseModel):
    text: str
class SummaryRequest(BaseModel):
    content_type: str
    content: str

###LOAD DATA/DOCS for RAG. The real code will pass in the relevant things like the code on screen, but for this case I am loading the txts

#Read pdf
from PyPDF2 import PdfReader
def load_pdf_for_query(filename):
    pdfreader = PdfReader(filename)
    rawtext = ''
    for i,page in enumerate(pdfreader.pages):
        content = page.extract_text()
        if content:
            rawtext += content
    return rawtext

from langchain_community.document_loaders import PyPDFLoader
def load_pdf_for_summary(filename):
    loader = PyPDFLoader(filename)
    pages = loader.load_and_split()
    return pages

from langchain.docstore.document import Document
# Function to create Document from text
def create_docs_from_text(text):
    # Split text into pages or sections if needed (simple split here for demonstration)
    doc_text_splits = text.split('\n')  # Split by new lines or any other delimiter
    metadata_string = [{} for _ in doc_text_splits]  # Empty metadata for each document

    documents = []
    for item in range(len(doc_text_splits)):
        page = Document(page_content=doc_text_splits[item], metadata=metadata_string[item])
        documents.append(page)

    return documents

import re
from langchain_community.document_loaders import WebBaseLoader
#Load webpage
def load_webpage_for_query(URL):
    loader = WebBaseLoader(URL)
    docs = loader.load()
    raw_content = docs[0].page_content.strip()
    
    # Remove extra spaces and newlines
    # Replace multiple newlines with a single newline
    cleaned_content = re.sub(r'\n\s*\n+', '\n\n', raw_content)
    return cleaned_content

def load_webpage_for_summary(URL):
    loader = WebBaseLoader(URL)
    docs = loader.load()
    return docs




#Text splitter
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
from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_community.chat_models import ChatOllama
from langchain_core.runnables import RunnablePassthrough
from langchain.retrievers.multi_query import MultiQueryRetriever

from langchain import hub
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

"""
Answer a user's question using the vector_db
Arg:
-question (str)
-vector_db (Chroma)
Return:
-answer (str)
"""
def answerQuestion(question: str, vector_db: Chroma) -> str:

    #LLM
    local_model = "llama3"
    llm = ChatOllama(model=local_model, temperature=0)

    #User prompt
    template = """You are an AI study assistant. Answer the question based ONLY on the following context:
    <context>
    {context}
    </context>
    Question: {input}
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    Only provide the answer from the {context}, nothing else.
    Add snippets and quotes of the context you used to answer the question.
    """
    prompt = ChatPromptTemplate.from_template(template)
    document_chain = create_stuff_documents_chain(llm, prompt)
    retriever = vector_db.as_retriever()
    retrieval_chain = create_retrieval_chain(retriever, document_chain)
    response = retrieval_chain.invoke({"input": question})
    # chain = (
    #     {"context": retriever, "question": RunnablePassthrough()}
    #     | prompt
    #     | llm
    #     | StrOutputParser()
    # )
    # response = chain.invoke(question)
    return response["answer"]


from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.llm import LLMChain
from langchain_core.prompts import PromptTemplate
def summary(docs):

    # Define prompt
    prompt_template = """You are a helpful study assistant. Write a thorough summary of the following:
    "{context}"
    SUMMARY:"""
    prompt = PromptTemplate.from_template(prompt_template)


    llm = ChatOllama(model="llama3", temperature=0)
    chain = create_stuff_documents_chain(llm, prompt)

    
    result = chain.invoke({"context": docs})
    return result

"""
Delete the vector database.

Args:
-vector_db
"""
def delete_vector_db(vector_db):

    if vector_db is not None:
        vector_db.delete_collection()
       
#test

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

#answer question from text

#summarize pdf

#summarize webpage
# URL = "https://lilianweng.github.io/posts/2023-06-23-agent/"
# docs = load_webpage_for_summary(URL)
# summary(docs)

#summarize text
   
app = FastAPI()
# Allow all origins (for development purposes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to specific origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#pass in file to server
# @app.post("/pdfquery")
# async def upload_pdf(file: UploadFile = File(...)):
#     try:
#         # Ensure the directory exists
#         import os
#         file_location = "files"
#         os.makedirs(file_location, exist_ok=True)
        
#         file_path = os.path.join(file_location, file.filename)
#         with open(file_path, "wb") as file_object:
#             file_object.write(file.file.read())
#         return {"message": "PDF processed successfully"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

#pass in question, content_type, recieve answer
@app.post("/answer_question")
async def answer_question_api(request: Question, content_type: str, content: str):
    try:
        if content_type == 'pdf':
            filename = content
            file_path = os.path.join("files", filename)
            text = load_pdf_for_query(file_path)
            
        elif content_type == 'webpage':
            url = content
            text = load_webpage_for_query(url)
        elif content_type == 'text':
            text = content
        else:
            raise HTTPException(status_code=400, detail="Invalid content type")

        vector_db = create_db(text)
        answer = answerQuestion(request.text, vector_db)
        return {"result": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
   
  

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
                file_object.write(await file.read())  # Ensure to read the file content correctly
            docs = load_pdf_for_summary(file_path)
        elif content_type == 'URL':
            docs = load_webpage_for_summary(content)  # 'content' is used as URL here
        elif content_type == 'Text':
            docs = create_docs_from_text(content)
        else:
            raise HTTPException(status_code=400, detail="Invalid content type")

        result = summary(docs)
        
        value = {"result": result}
        return json.dumps(value)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    

@app.post("/grade")
async def grade(audiofile: UploadFile = File(...), content_type: str = "text", content: str = ""):
    try:
        # Transcribe the audio
        transcription = transcribe(audiofile)
        
        # Load content based on type
        if content_type == 'pdf':
            filename = content
            file_path = os.path.join("files", filename)
            text = load_pdf_for_query(file_path)
        elif content_type == 'webpage':
            text = load_pdf_for_query(content)
        elif content_type == 'text':
            text = content
        else:
            raise HTTPException(status_code=400, detail="Invalid content type")
        
        # Evaluate coverage
        coverage = evaluate_coverage(transcription, text)
        # Evaluate accuracy
        accuracy = evaluate_accuracy(transcription, text)

        return {"coverage": coverage, "accuracy": accuracy  }
    
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

# #summarize webpage
# URL = "https://lilianweng.github.io/posts/2023-06-23-agent/"
# docs = load_webpage_for_summary(URL)
# summary(docs)