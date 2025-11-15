from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import shutil




#aduio
import whisper
def transcribe(file):
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
    prompt_template = """Write a bullet point summary/outline of the following:
    "{context}"
    SUMMARY:"""
    prompt = PromptTemplate.from_template(prompt_template)


    llm = ChatOllama(model="llama3", temperature=0)
    chain = create_stuff_documents_chain(llm, prompt)

    
    result = chain.invoke({"context": docs})
    print(result)

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


# summarize pdf
# filename = "vm-api.pdf"
# docs = load_pdf_for_summary(filename)
# summary(docs)

#summarize webpage
# URL = "https://lilianweng.github.io/posts/2023-06-23-agent/"
# docs = load_webpage_for_summary(URL)
# summary(docs)

#evaluate user's content
# text = """
# This is how to make an omelet. I'm using two eggs for mine. To crack them, I prefer to give it a quick pop on a flat surface. Now, mix them together until they're completely blended. Like this. I'm using a small nonstick pan on somewhat low heat. I set my burner on a heat of three out of ten. I'll add half a tablespoon of butter and let it melt. I'll also add a little olive oil. You can use only butter or only oil. It's up to you. Now that my butter is melted and warm, I'll add my eggs. Don't touch it. Let it cook for a minute or so until the edges begin to set. Then gently push the edge towards the center. It's slightly tilty pan to let the uncooked egg move to the edge. Let it continue cooking. I do this again after another minute and a half for the remaining uncooked egg. Once the egg is set, but still soft, I'll add my cheese. I let mine cook with the cheese for about 30 seconds. If you're using other cheeses, you might want to wait longer. This American cheese will finish getting gooey after I fold the omelet over. Then I add salt and pepper. Please consider giving the video a thumbs up and thank you for watching.
# """
# transcription = """
# To make an omelet, use 2 eggs and mix them. add butter and oil to a pan, then cook. add cheese for 50 seconds. add sugar and pepper.
# """
# print(evaluate_accuracy(transcription, text))
# print(evaluate_coverage(transcription, text))








