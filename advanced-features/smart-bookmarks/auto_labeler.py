import os

class BookmarkAutoLabeler:
    """
    Generates short, descriptive titles/labels for bookmarks using LLM.
    """
    
    def __init__(self, use_llm: bool = True, api_key: str = None):
        self.use_llm = use_llm
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

    def generate_label(self, text: str) -> str:
        """
        Generate label. Falls back to string truncation if LLM is unavailable.
        """
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
                    ("system", "You are an educational designer. Summarize the bookmarked text snippet into a concise, descriptive title or label (max 5-6 words). Do not put quotation marks around the label."),
                    ("user", "Text snippet: {text}")
                ])
                chain = prompt | model | StrOutputParser()
                label = chain.invoke({"text": text}).strip()
                # Clean enclosing quotes if any
                return label.strip('\'"')
            except Exception as e:
                print(f"Bookmark auto-labeler LLM error: {e}")
                
        # Truncation fallback
        words = text.split()
        if len(words) <= 6:
            return text
        return " ".join(words[:6]) + "..."
