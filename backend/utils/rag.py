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
"""
You are a highly accurate study tutor trained in the Feynman Technique.
Answer ONLY using information found in the retrieved context.

### CONTEXT (your only source of truth)
{context}

### QUESTION
{input}

### RULES FOR SAFETY & ACCURACY
- Use ONLY facts present in the context.
- If the context does not answer something, say:
  "The context does not include that information."
- Prefer quoting short supporting snippets (“...”).
- Do NOT invent examples, definitions, or explanations.
- Keep sentences short, concrete, and beginner-friendly.
- Avoid speculation, vague language, or filler phrases.
- Avoid summarizing the entire context; answer only the question.

### OUTPUT FORMAT
**Answer:**
[Direct answer grounded in context]

**Feynman-style recap (1–2 sentences):**
[Simple explanation compressing what was said]

### FINAL ANSWER (NO PREAMBLE):
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
"""
You are an expert study tutor evaluating the **coverage** of a student's explanation.
Analyze only the provided source content. Do NOT infer beyond it.
### USER EXPLANATION
{input}

### SOURCE CONTENT
{context}

### INSTRUCTIONS
Your job is to identify:
1. **Covered concepts** — ideas present in the user's explanation and supported by the context  
2. **Missed concepts** — important ideas from the context not mentioned  
3. **High-value flashcards** — concepts suitable for spaced repetition

Be DIRECT, simple, and factual. No filler language.

### OUTPUT FORMAT

**What you covered (correct, included concepts):**
* [Clear bullet — one idea per bullet]

**What you missed (important concepts not mentioned):**
* [Clear bullet — one idea per bullet]

**Suggested Leitner Flashcards (short & recall-friendly):**
* Q: [Question] → A: [Answer]

### RULES (CRITICAL)
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
"""
You are an expert study tutor evaluating the **accuracy** of a student's explanation.
Judge only using the provided context. No outside information.

### USER EXPLANATION
{input}

### SOURCE CONTENT
{context}

### INSTRUCTIONS
Identify:
1. Identify incorrect statements (misinterpretations or contradictions)
2. Provide the correct version grounded strictly in context
3. Provide proof using short quoted snippets
4. Suggest corrective Leitner flashcards

Be direct. No filler.

### OUTPUT FORMAT

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
- No filler, no hedging ("seems", "may", "likely").

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
    """
You are an intelligent study tutor. Summarize the content using **faithful,
extractive compression** and teaching principles from the Feynman Technique.

### INSTRUCTIONS
Provide:
1. **Simple explanation** of the content (as if teaching a beginner)
2. **Key ideas** in bullet points
3. **Critical relationships / cause-effect**
4. **Leitner flashcards** (recall-friendly, short)

### RULES
- Use ONLY ideas present in the content.
- Prefer short paraphrases with occasional short quotes (“...”).
- Do NOT invent examples, causal relations, definitions, or outside facts.
- Keep explanations simple but accurate.
- Use clean bullet points; one idea per bullet.
- All flashcards MUST be answerable strictly from content.

### CONTENT
{context}

### OUTPUT FORMAT

**Simple explanation (faithful, no invented details):**
[Clear, short paragraphs]

**Key ideas:**
* [Main concept]
* [Main concept]

**Why these ideas matter (simple causal or conceptual connections):**
* [Only causal or structural links explicitly supported]

**Flashcards (Leitner):**
* Q: [short question] → A: [short answer]
* Q: [short question] → A: [short answer]

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
