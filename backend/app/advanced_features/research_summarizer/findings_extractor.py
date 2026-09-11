import os
from typing import Dict, Any
from pydantic import BaseModel, Field

class ResearchFindings(BaseModel):
    contributions: str = Field(description="Key contributions of the research paper")
    methodology_summary: str = Field(description="Brief summary of the methodologies or algorithms used")
    datasets_used: str = Field(description="Datasets, tools, or experimental subjects referenced")
    key_findings: str = Field(description="Main findings, results, or quantitative metrics achieved")

class FindingsExtractor:
    """
    Extracts structured academic findings and metadata from research paper text.
    """
    
    def __init__(self, use_llm: bool = True, api_key: str = None):
        self.use_llm = use_llm
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

    def extract_findings(self, full_text: str) -> Dict[str, Any]:
        """
        Extract structured findings (contributions, key variables, datasets, results).
        """
        # Truncate text for prompt context safety
        sample_text = full_text[:12000]
        
        if self.use_llm and self.api_key:
            try:
                from langchain_openai import ChatOpenAI
                from langchain_core.prompts import ChatPromptTemplate
                from langchain_core.output_parsers import JsonOutputParser

                model = ChatOpenAI(
                    model="gpt-4o-mini",
                    temperature=0.1,
                    openai_api_key=self.api_key
                )
                
                parser = JsonOutputParser(pydantic_object=ResearchFindings)
                
                prompt = ChatPromptTemplate.from_messages([
                    ("system", "You are an academic reviewer. Extract structural contributions, methodology, datasets, and key findings from the paper text. Conform output to the schema.\nFormat Instructions:\n{format_instructions}"),
                    ("user", "Analyze this text:\n{text}")
                ])
                
                chain = prompt | model | parser
                result = chain.invoke({
                    "text": sample_text,
                    "format_instructions": parser.get_format_instructions()
                })
                return result
            except Exception as e:
                print(f"Findings extraction LLM error: {e}")
                
        return self._mock_findings(sample_text)

    def _mock_findings(self, text: str) -> Dict[str, Any]:
        """
        Heuristic findings generator when LLM is unavailable.
        """
        # Look for keywords in sentences
        import re
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        contributions = "Not extracted. (Requires LLM API Key)."
        methodology = "Not extracted. (Requires LLM API Key)."
        datasets = "Not extracted."
        findings = []
        
        for s in sentences:
            s_lower = s.lower()
            if "contribute" in s_lower or "propose" in s_lower or "introduce" in s_lower:
                if len(contributions) > 50:
                    continue
                contributions = s.strip()
            elif "dataset" in s_lower or "database" in s_lower or "corpus" in s_lower:
                datasets = s.strip()
            elif "accuracy" in s_lower or "percent" in s_lower or "%" in s_lower or "result" in s_lower:
                if len(findings) < 2:
                    findings.append(s.strip())
                    
        return {
            "contributions": contributions,
            "methodology_summary": methodology,
            "datasets_used": datasets,
            "key_findings": "\n".join(findings) if findings else "Results found throughout text."
        }
