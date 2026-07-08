from typing import List, Dict, Any
import re
from .patterns import FORMULA_PATTERNS, TEXTUAL_FORMULA_ALIASES
from .formatter import format_to_latex, wrap_math_block
from .llm_extractor import extract_formulas_with_llm

class FormulaExtractor:
    """
    Main entry point for extracting mathematical and scientific formulas from educational content.
    Combines regex pattern matching and LLM capabilities.
    """
    
    def __init__(self, use_llm: bool = True, api_key: str = None):
        self.use_llm = use_llm
        self.api_key = api_key

    def extract(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract formulas from the text.
        Returns a list of dictionaries with:
        - name: description
        - raw_text: original match
        - latex: LaTeX formatted string
        - display_math: LaTeX wrapped in $$
        """
        results: Dict[str, Dict[str, Any]] = {}
        
        # 1. Apply regex patterns for exact symbols
        for name, pattern in FORMULA_PATTERNS.items():
            matches = pattern.finditer(text)
            for match in matches:
                matched_str = match.group(0)
                formatted = format_to_latex(matched_str)
                key = formatted.replace(" ", "")
                
                if key not in results:
                    results[key] = {
                        "name": name.replace("_", " ").title(),
                        "raw_text": matched_str,
                        "latex": formatted,
                        "display_math": wrap_math_block(formatted, display_mode=True),
                        "source": "regex_pattern"
                    }
                    
        # 2. Apply textual aliases (descriptions in text)
        text_lower = text.lower()
        for pattern, formula in TEXTUAL_FORMULA_ALIASES:
            matches = re.finditer(pattern, text_lower)
            for match in matches:
                matched_str = match.group(0)
                formatted = format_to_latex(formula)
                key = formatted.replace(" ", "")
                
                if key not in results:
                    results[key] = {
                        "name": pattern.replace(r"\b", "").replace(r"\s+", " ").strip().title(),
                        "raw_text": matched_str,
                        "latex": formatted,
                        "display_math": wrap_math_block(formatted, display_mode=True),
                        "source": "regex_alias"
                    }
                    
        # 3. Apply LLM extraction if enabled
        if self.use_llm:
            llm_results = extract_formulas_with_llm(text, self.api_key)
            for item in llm_results:
                latex = format_to_latex(item["latex"])
                key = latex.replace(" ", "")
                
                if key not in results:
                    results[key] = {
                        "name": item["name"],
                        "raw_text": item["raw_text"],
                        "latex": latex,
                        "display_math": wrap_math_block(latex, display_mode=True),
                        "source": "llm_model"
                    }
                    
        return list(results.values())
