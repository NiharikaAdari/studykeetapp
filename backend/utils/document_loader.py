"""
Document loading and processing utilities
"""
import re
import os
from PyPDF2 import PdfReader
from langchain_community.document_loaders import PyPDFLoader, WebBaseLoader
from langchain_core.documents import Document as LCDocument
from langchain_text_splitters import CharacterTextSplitter


def load_pdf_for_query(filename: str) -> str:
    """Read PDF and return text content"""
    pdfreader = PdfReader(filename)
    rawtext = ''
    for page in pdfreader.pages:
        content = page.extract_text()
        if content:
            rawtext += content
    return rawtext


def load_pdf_for_summary(filename: str):
    """Read PDF and return pages/docs for summarization"""
    loader = PyPDFLoader(filename)
    pages = loader.load_and_split()
    return pages


def create_docs_from_text(text: str):
    """Create Document objects from text"""
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


def load_webpage_for_query(url: str) -> str:
    """Load webpage and return cleaned text"""
    loader = WebBaseLoader(url)
    docs = loader.load()
    raw_content = docs[0].page_content.strip()
    
    # Remove extra spaces and newlines
    cleaned_content = re.sub(r'\n\s*\n+', '\n\n', raw_content)
    return cleaned_content


def load_webpage_for_summary(url: str):
    """Load webpage and return docs for summarization"""
    loader = WebBaseLoader(url)
    docs = loader.load()
    return docs


def split_documents(text: str):
    """Split text into chunks for embeddings"""
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=800,
        chunk_overlap=200,
        length_function=len,
    )
    return text_splitter.split_text(text)
