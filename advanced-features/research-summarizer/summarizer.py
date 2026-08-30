import os
from typing import Dict, Any, List

class ResearchPaperSummarizer:
    """
    Summarizes parsed academic papers, segmenting section-by-section.
    """
    
    def __init__(self, use_llm: bool = True, api_key: str = None):
        self.use_llm = use_llm
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

    def summarize_sections(self, parsed_sections: Dict[str, str]) -> Dict[str, str]:
        """
        Summarize each section of the research paper.
        """
        summarized = {}
        for section, content in parsed_sections.items():
            if section in ["Title/Header", "References"]:
                # Keep references and headers intact or skip
                summarized[section] = content[:500]  # truncate references list to first few
                continue
                
            # Skip empty sections
            if not content.strip():
                continue
                
            summarized[section] = self.summarize_text(content, section_context=section)
            
        return summarized

    def summarize_text(self, text: str, section_context: str = "General") -> str:
        """
        Summarize a given text block, using LLM or fallback.
        """
        # Limit text size to prevent exceeding token limit in a single request (basic chunking)
        clean_text = text[:12000] 
        
        if self.use_llm and self.api_key:
            try:
                from langchain_openai import ChatOpenAI
                from langchain_core.prompts import ChatPromptTemplate
                from langchain_core.output_parsers import StrOutputParser

                model = ChatOpenAI(
                    model="gpt-4o-mini",
                    temperature=0.3,
                    openai_api_key=self.api_key
                )
                
                prompt = ChatPromptTemplate.from_messages([
                    ("system", f"You are a research assistant. Summarize the following section ({section_context}) of an academic paper. Highlight the core methodology, findings, and implications. Keep it structured and bulleted."),
                    ("user", "Text to summarize:\n{text}")
                ])
                
                chain = prompt | model | StrOutputParser()
                summary = chain.invoke({"text": clean_text})
                return summary.strip()
                
            except Exception as e:
                print(f"Summarization error: {e}. Falling back.")
                
        return self._mock_summary(clean_text, section_context)

    def _mock_summary(self, text: str, section: str) -> str:
        """
        Generate a basic heuristic summary by pulling the first 3 sentences.
        """
        # Simple sentence splitter
        import re
        sentences = re.split(r'(?<=[.!?])\s+', text)
        clean_sentences = [s.strip() for s in sentences if s.strip()]
        
        headline = f"### Summary of {section}\n"
        body = "• " + "\n• ".join(clean_sentences[:4])
        
        if len(clean_sentences) > 4:
            body += f"\n• (Truncated; parsed {len(clean_sentences)} sentences)."
            
        return headline + body
