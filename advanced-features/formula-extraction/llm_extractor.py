import os
from typing import List, Dict, Any
from pydantic import BaseModel, Field

class ExtractedFormula(BaseModel):
    name: str = Field(description="Name or description of the formula (e.g. Pythagorean Theorem)")
    raw_text: str = Field(description="The natural language representation found in the text")
    latex: str = Field(description="The cleaned LaTeX formatted formula (without $$ delimiters)")

class FormulaList(BaseModel):
    formulas: List[ExtractedFormula] = Field(description="List of extracted formulas")

def extract_formulas_with_llm(text: str, api_key: str = None) -> List[Dict[str, Any]]:
    """
    Extract math/science formulas from conversational text using OpenAI.
    """
    if not api_key:
        api_key = os.getenv("OPENAI_API_KEY")
        
    if not api_key:
        # Fallback Mock Mode if API key is not present
        return _mock_llm_extraction(text)
        
    try:
        from langchain_openai import ChatOpenAI
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import JsonOutputParser

        # Initialize LangChain model
        model = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.0,
            openai_api_key=api_key
        )
        
        parser = JsonOutputParser(pydantic_object=FormulaList)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert mathematical AI assistant. Extract all mathematical, physical, or chemical formulas described in the user text. Format the output as JSON conforming to the schema.\nFormat Instructions:\n{format_instructions}"),
            ("user", "Extract formulas from the following text:\n{text}")
        ])
        
        chain = prompt | model | parser
        
        result = chain.invoke({
            "text": text,
            "format_instructions": parser.get_format_instructions()
        })
        
        return result.get("formulas", [])
        
    except Exception as e:
        # In case of API failure or missing library, log and return fallback
        print(f"LLM extraction error: {e}")
        return _mock_llm_extraction(text)

def _mock_llm_extraction(text: str) -> List[Dict[str, Any]]:
    """
    Simple rule-based fallback for formula extraction when LLM is unavailable.
    """
    extracted = []
    text_lower = text.lower()
    
    # Relative import within package
    from .patterns import TEXTUAL_FORMULA_ALIASES
    import re
    
    for pattern, formula in TEXTUAL_FORMULA_ALIASES:
        match = re.search(pattern, text_lower)
        if match:
            extracted.append({
                "name": pattern.replace(r"\b", "").replace(r"\s+", " ").strip().title(),
                "raw_text": match.group(0),
                "latex": formula
            })
            
    return extracted
