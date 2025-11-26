"""
Vector database and RAG utilities
"""
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from backend.config import GROQ_MODEL, GROQ_API_KEY
from backend.utils.document_loader import split_documents


def create_db(text: str) -> Chroma:
    """Create vector database from text"""
    chunks = split_documents(text)
    embed_model = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")

    vector_db = Chroma.from_texts(
        texts=chunks,
        embedding=embed_model,
        collection_name="local-rag"
    )
    
    return vector_db


def delete_vector_db(vector_db: Chroma):
    """Delete the vector database"""
    if vector_db is not None:
        vector_db.delete_collection()


def answer_question(question: str, vector_db: Chroma) -> str:
    """Answer a user's question using the vector database"""
    llm = ChatGroq(
        temperature=0,
        model=GROQ_MODEL,
        groq_api_key=GROQ_API_KEY
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
- If context is missing something, say "The context does not include that information."
- Include short quoted snippets from the context to support claims ("...").
- Do NOT add filler phrases, speculation, or generic introductions.

### ANSWER (NO PREAMBLE):
"""
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])
    
    retriever = vector_db.as_retriever()
    chain = (
        {
            "input": lambda x: x["input"],
            "context": lambda x: retriever.invoke(x["input"])
        }
        | prompt
        | llm
    )

    result = chain.invoke({"input": question})
    return result.content


def evaluate_coverage(transcription: str, vector_db: Chroma) -> str:
    """Evaluate coverage of user's explanation"""
    llm = ChatGroq(
        temperature=0,
        model=GROQ_MODEL,
        groq_api_key=GROQ_API_KEY
    )

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
- Do NOT say "You mentioned that…" or "The source states…"
- Do NOT restate the entire context.
- Be surgical, clear, and student-friendly.

### ANSWER (NO PREAMBLE):
"""
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])
    
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


def evaluate_accuracy(transcription: str, vector_db: Chroma) -> str:
    """Evaluate accuracy of user's explanation"""
    llm = ChatGroq(
        temperature=0,
        model=GROQ_MODEL,
        groq_api_key=GROQ_API_KEY
    )

    system_prompt = (
"""You are an intelligent study tutor evaluating the **accuracy** of the user's explanation.

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
- Always use the "Said: X → Actually: Y" format for errors.
- Quotes key phrases from context only when necessary for evidence.
- One idea per bullet.
- No soft language ("seems", "appears", "may be").

### ANSWER (NO PREAMBLE):
"""
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])
    
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


def summarize(docs) -> str:
    """Generate summary of content"""
    context_text = "\n\n".join([d.page_content for d in docs]).strip()
    if not context_text:
        raise ValueError("Empty text input")
    
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
        groq_api_key=GROQ_API_KEY
    )

    chain = prompt | llm
    result = chain.invoke({"context": context_text})
    
    return result.content
