import os


class EmbeddingConfig:
    model_name: str = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
    dimension: int = 1536
    api_key: str = os.getenv("OPENAI_API_KEY", "")


embedding_config = EmbeddingConfig()
