from typing import List, Dict, Any, Optional
from .query_embedder import QueryEmbedder
from .index_manager import IndexManager
from .result_ranker import ResultRanker

class SemanticSearchEngine:
    """
    Unified interface orchestrating query embedding, index lookup, and ranked result retrieval.
    """
    
    def __init__(self, api_key: str = None, collection_name: str = "content_embeddings", persist_directory: str = "./chroma_data"):
        self.embedder = QueryEmbedder(api_key=api_key)
        self.index_manager = IndexManager(collection_name=collection_name, persist_directory=persist_directory)

    def index_document(self, doc_id: str, text: str, metadata: Optional[Dict[str, Any]] = None):
        """
        Embed and index a document.
        """
        embedding = self.embedder.embed_query(text)
        self.index_manager.add_document(doc_id, text, embedding, metadata)

    def search(
        self, 
        query: str, 
        n_results: int = 5, 
        min_score: float = 0.0, 
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Execute semantic search.
        """
        query_embedding = self.embedder.embed_query(query)
        raw_results = self.index_manager.query_similar(query_embedding, n_results=n_results * 2)
        ranked_results = ResultRanker.filter_and_rank(raw_results, min_score=min_score, filters=filters)
        
        return ranked_results[:n_results]

    def delete_document(self, doc_id: str):
        """
        Delete a document from the index.
        """
        self.index_manager.delete_document(doc_id)
