import os
from typing import List, Optional


class EmbeddingGenerator:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")

    def generate(self, texts: List[str]) -> List[List[float]]:
        if not self.api_key:
            return self._mock_embeddings(texts)

        try:
            return self._openai_embeddings(texts)
        except Exception:
            return self._mock_embeddings(texts)

    def _openai_embeddings(self, texts: List[str]) -> List[List[float]]:
        from openai import OpenAI
        client = OpenAI(api_key=self.api_key)
        model = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

        response = client.embeddings.create(input=texts, model=model)
        return [item.embedding for item in response.data]

    def _mock_embeddings(self, texts: List[str]) -> List[List[float]]:
        import random
        random.seed(42)
        return [[random.uniform(-0.1, 0.1) for _ in range(1536)] for _ in texts]

    def store_embeddings(
        self,
        chunks: List[dict],
        embeddings: List[List[float]],
        collection_name: str = "content_embeddings",
    ) -> None:
        try:
            import chromadb
            persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./chroma_data")
            client = chromadb.PersistentClient(path=persist_dir)
            collection = client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"},
            )

            ids = [f"{collection_name}_{c['chunk_index']}" for c in chunks]
            documents = [c["text"] for c in chunks]
            metadatas = [{"chunk_index": c["chunk_index"]} for c in chunks]

            collection.add(ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas)
        except Exception:
            pass


embedding_generator = EmbeddingGenerator()
