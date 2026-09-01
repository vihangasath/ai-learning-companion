import os


class LLMConfig:
    model_name: str = os.getenv("OPENAI_MODEL_NAME", "gpt-4o-mini")
    temperature: float = float(os.getenv("LLM_TEMPERATURE", "0.3"))
    max_tokens: int = int(os.getenv("LLM_MAX_TOKENS", "4096"))
    api_key: str = os.getenv("OPENAI_API_KEY", "")


llm_config = LLMConfig()
