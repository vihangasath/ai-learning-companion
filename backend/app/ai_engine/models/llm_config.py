import os
from pathlib import Path

from dotenv import load_dotenv

_ENV_FILE = Path(__file__).resolve().parent.parent.parent.parent.parent / ".env"
if _ENV_FILE.exists():
    load_dotenv(_ENV_FILE, override=True)


class LLMConfig:
    provider: str = os.getenv("LLM_PROVIDER", "").lower()
    openai_model: str = os.getenv("OPENAI_MODEL_NAME", "gpt-4o-mini")
    gemini_model: str = os.getenv("GEMINI_MODEL_NAME", "gemini-3.6-flash")
    temperature: float = float(os.getenv("LLM_TEMPERATURE", "0.3"))
    max_tokens: int = int(os.getenv("LLM_MAX_TOKENS", "4096"))
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")

    @property
    def active_provider(self) -> str:
        if self.provider:
            return self.provider
        if self.gemini_api_key:
            return "gemini"
        if self.openai_api_key:
            return "openai"
        return "mock"


llm_config = LLMConfig()


def build_chat_model():
    """Return a LangChain chat model for the active provider, or None in mock mode."""
    if llm_config.active_provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model=llm_config.gemini_model,
            temperature=llm_config.temperature,
            google_api_key=llm_config.gemini_api_key,
            max_output_tokens=llm_config.max_tokens,
        )
    if llm_config.active_provider == "openai":
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=llm_config.openai_model,
            temperature=llm_config.temperature,
            api_key=llm_config.openai_api_key,
            max_tokens=llm_config.max_tokens,
        )
    return None


def extract_text(result) -> str:
    """Normalise a chat model result into plain text (handles Gemini content blocks)."""
    content = result.content
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                parts.append(item.get("text", ""))
            elif isinstance(item, str):
                parts.append(item)
        return "\n".join(parts)
    return str(content)