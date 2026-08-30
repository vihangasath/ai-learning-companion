import os
import re
from typing import Dict, Any, Optional

# Mapping of voice intents to system actions
INTENT_MAPPING = {
    "EXPLAIN_AGAIN": ["explain this again", "explain", "i don't understand", "clarify", "elaborate"],
    "SUMMARIZE_SECTION": ["summarize this section", "give me a summary", "summarize", "recap"],
    "GENERATE_QUIZ": ["generate quiz questions", "quiz me", "test me", "start a quiz", "give me a quiz", "quiz"],
    "REVIEW_FLASHCARDS": ["review flashcards", "open flashcards", "flashcards", "revision cards"]
}

class VoiceCommandParser:
    """
    Parses voice transcript strings into specific executable platform commands/intents.
    """
    
    def __init__(self, use_llm: bool = True, api_key: str = None):
        self.use_llm = use_llm
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

    def parse_command(self, text: str) -> Dict[str, Any]:
        """
        Parses text and returns the corresponding intent and confidence score.
        """
        text_clean = text.strip().lower()
        
        # 1. Try LLM parsing if key is available
        if self.use_llm and self.api_key:
            try:
                from langchain_openai import ChatOpenAI
                from langchain_core.prompts import ChatPromptTemplate
                from langchain_core.output_parsers import StrOutputParser

                model = ChatOpenAI(
                    model="gpt-4o-mini",
                    temperature=0.0,
                    openai_api_key=self.api_key
                )
                prompt = ChatPromptTemplate.from_messages([
                    ("system", "You are a voice command parser for LearnFlow AI. Classify the user voice input into one of these intents: EXPLAIN_AGAIN, SUMMARIZE_SECTION, GENERATE_QUIZ, REVIEW_FLASHCARDS. If the command does not match any, respond with UNKNOWN. Respond with ONLY the intent name."),
                    ("user", "Voice command: '{command}'")
                ])
                chain = prompt | model | StrOutputParser()
                intent = chain.invoke({"command": text_clean}).strip().upper()
                
                if intent in ["EXPLAIN_AGAIN", "SUMMARIZE_SECTION", "GENERATE_QUIZ", "REVIEW_FLASHCARDS"]:
                    return {"intent": intent, "confidence": 0.95, "raw_text": text}
            except Exception as e:
                print(f"LLM command parsing failed: {e}")

        # 2. Rule-based regex fallback
        for intent, patterns in INTENT_MAPPING.items():
            for pat in patterns:
                if pat in text_clean or re.search(r'\b' + re.escape(pat) + r'\b', text_clean):
                    return {"intent": intent, "confidence": 0.8, "raw_text": text}
                    
        return {"intent": "UNKNOWN", "confidence": 0.5, "raw_text": text}
