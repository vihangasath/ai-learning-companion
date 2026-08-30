import os
from typing import List

class QueryEmbedder:
    """
    Class responsible for generating vector embeddings from text queries.
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.embeddings = None
        if self.api_key:
            try:
                from langchain_openai import OpenAIEmbeddings
                self.embeddings = OpenAIEmbeddings(
                    model="text-embedding-3-small",
                    openai_api_key=self.api_key
                )
            except Exception as e:
                print(f"Failed to initialize OpenAIEmbeddings: {e}")

    def embed_query(self, query: str) -> List[float]:
        """
        Embed a single text query string.
        """
        if self.embeddings:
            try:
                return self.embeddings.embed_query(query)
            except Exception as e:
                print(f"Error embedding query: {e}")
        
        # Fallback Mock Embedding (1536 dimensions as per OpenAI standard)
        return self._get_mock_embedding(query)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Embed multiple document strings.
        """
        if self.embeddings:
            try:
                return self.embeddings.embed_documents(texts)
            except Exception as e:
                print(f"Error embedding documents: {e}")
                
        return [self._get_mock_embedding(t) for t in texts]

    def _get_mock_embedding(self, text: str) -> List[float]:
        """
        Deterministic mock embedding based on character values for testing.
        Uses a simple bag-of-words summation to simulate keyword overlap.
        """
        import hashlib
        import math
        
        words = [w.strip(".,!?").lower() for w in text.split() if len(w.strip(".,!?")) > 2]
        if not words:
            words = [text.lower()]
            
        vec = [0.0] * 1536
        for word in words:
            h = hashlib.sha256(word.encode('utf-8')).digest()
            for i in range(1536):
                val = (h[i % len(h)] + i) % 256
                vec[i] += (float(val) / 256.0 - 0.5)
                
        # Normalize vector
        mag = math.sqrt(sum(x * x for x in vec))
        if mag > 0:
            vec = [x / mag for x in vec]
            
        return vec
