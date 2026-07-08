import re
from typing import Dict, Any, Optional
import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Categories supported
CATEGORIES = ["Definition", "Concept", "Example", "Formula", "Question"]

class BookmarkCategorizer:
    """
    Categorizes bookmark content into specific educational buckets:
    Definition, Concept, Example, Formula, or Question.
    """
    
    def __init__(self, use_llm: bool = True, api_key: str = None):
        self.use_llm = use_llm
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

    def categorize(self, text: str) -> str:
        """
        Categorizes the bookmark content. Falls back to regex if LLM is disabled or fails.
        """
        if self.use_llm and self.api_key:
            try:
                model = ChatOpenAI(
                    model="gpt-4o-mini",
                    temperature=0.0,
                    openai_api_key=self.api_key
                )
                prompt = ChatPromptTemplate.from_messages([
                    ("system", "You are an educational assistant. Categorize the bookmarked study segment into exactly one of these categories: Definition, Concept, Example, Formula, Question. Respond with ONLY the category name."),
                    ("user", "Categorize this segment: {text}")
                ])
                chain = prompt | model | StrOutputParser()
                result = chain.invoke({"text": text}).strip()
                
                # Verify match
                for cat in CATEGORIES:
                    if cat.lower() in result.lower():
                        return cat
            except Exception as e:
                print(f"Bookmark categorization LLM error: {e}")
                
        # Regex rule-based fallback
        return self._regex_categorize(text)

    def _regex_categorize(self, text: str) -> str:
        text_lower = text.lower()
        
        # Check for formula indicators
        if any(op in text for op in ["=", " + ", " - ", " * ", " / ", "^"]) or re.search(r'\b[a-zA-Z]=\s*\w+', text):
            return "Formula"
            
        # Check for questions
        if "?" in text or any(word in text_lower for word in ["what is", "how do", "why does", "explain", "question"]):
            if "?" in text:
                return "Question"
                
        # Check for definitions
        if any(kw in text_lower for kw in ["defined as", "refers to", "means", "is a term", "definition"]):
            return "Definition"
            
        # Check for examples
        if any(kw in text_lower for kw in ["for example", "e.g.", "instance", "case study", "illustration"]):
            return "Example"
            
        # Default category
        return "Concept"
