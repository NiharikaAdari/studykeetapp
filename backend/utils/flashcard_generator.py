"""
Flashcard generation prompts and logic
"""
import json
import re
from langchain_groq import ChatGroq
from backend.config import GROQ_MODEL, GROQ_API_KEY

MASTER_WRAPPER = """
You are an assistant that must follow the EXACT formatting rules.

Respond ONLY with valid JSON.
No explanations.
No commentary.
No extra text.
"""

SUMMARY_FLASHCARD_PROMPT = """
You are a high-quality study tutor. Extract flashcards from this summary.

### INPUT SUMMARY
{input}

### GOAL
Create essential-concept flashcards suitable for Leitner spaced repetition.

### RULES
- Each card must contain exactly ONE core idea.
- Question must test understanding or recall of the concept.
- Answers must be **short, direct, factual**.
- No filler words.
- Avoid trivial questions (e.g., "What is the topic about?").
- Avoid copying large chunks of text.

### OUTPUT FORMAT
ONLY return JSON:
[
  {{ "q": "...", "a": "..." }}
]
"""

COVERAGE_FLASHCARD_PROMPT = """
Extract high-value flashcards from the COVERAGE evaluation.

### INPUT COVERAGE
{input}

### GOAL
Turn "missed concepts" and "covered concepts" into strong recall cards.

### RULES
- PRIORITIZE missed concepts.
- One idea per card.
- The question must force recall (avoid trivial phrasing).
- The answer must be short and factual.
- If the input includes bullet lists, convert each bullet into a card if meaningful.
- Do NOT include phrases like "The student missed..."

### OUTPUT FORMAT
JSON only:
[
  {{ "q": "...", "a": "..." }}
]
"""

ACCURACY_FLASHCARD_PROMPT = """
Extract flashcards from the ACCURACY evaluation.

### INPUT ACCURACY
{input}

### GOAL
Convert misconceptions and correct statements into flashcards.

### RULES
- Use "Said X → Actually Y" sections to build correction cards.
- Question should target the CORRECT concept (not the mistake).
- The answer should give the correct explanation.
- If a point was correct, you may create a card, but prioritize corrections.
- Keep questions simple and retrieval-friendly.

### OUTPUT FORMAT
JSON ONLY:
[
  {{ "q": "...", "a": "..." }}
]
"""

QA_FLASHCARD_PROMPT = """
Extract flashcards from this question-answer explanation.

### INPUT
{input}

### GOAL
Create cards that help the student remember the key concepts required to answer similar questions.

### RULES
- Use the explanation and quoted supporting context.
- Each card must be a single concept.
- Avoid overly narrow questions (e.g., numbers unless essential).
- Keep answers short and factual.

### OUTPUT FORMAT
JSON:
[
  {{ "q": "...", "a": "..." }}
]
"""


def get_prompt_for_source_type(source_type: str) -> str:
    """Get the appropriate prompt based on source type"""
    prompts = {
        "summary": SUMMARY_FLASHCARD_PROMPT,
        "coverage": COVERAGE_FLASHCARD_PROMPT,
        "accuracy": ACCURACY_FLASHCARD_PROMPT,
        "qa_answer": QA_FLASHCARD_PROMPT
    }
    
    if source_type not in prompts:
        raise ValueError(f"Invalid source_type: {source_type}")
    
    return prompts[source_type]


def generate_flashcards_from_content(source_type: str, content: str) -> list:
    """Generate flashcards using LLM"""
    selected_prompt = get_prompt_for_source_type(source_type)
    full_prompt = MASTER_WRAPPER + "\n" + selected_prompt.format(input=content)
    
    llm = ChatGroq(
        temperature=0,
        model=GROQ_MODEL,
        groq_api_key=GROQ_API_KEY
    )
    
    response = llm.invoke(full_prompt)
    result_text = response.content.strip()
    
    # Parse JSON response
    flashcards_data = None
    try:
        flashcards_data = json.loads(result_text)
    except json.JSONDecodeError:
        # Try to extract JSON from response if wrapped in markdown
        json_match = re.search(r'\[\s*\{.*?\}\s*\]', result_text, re.DOTALL)
        if json_match:
            try:
                flashcards_data = json.loads(json_match.group(0))
            except:
                pass
        
        if not flashcards_data:
            raise ValueError("Failed to parse LLM response as JSON")
    
    if not flashcards_data or not isinstance(flashcards_data, list):
        raise ValueError("LLM did not return a valid flashcard array")
    
    return flashcards_data
