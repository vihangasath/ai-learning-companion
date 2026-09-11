import os
from typing import List, Dict, Any, Optional

class IndexManager:
    """
    Manages vector index additions, updates, and lookups using ChromaDB.
    Contains an in-memory fallback if ChromaDB is unavailable.
    """
    
    def __init__(self, collection_name: str = "content_embeddings", persist_directory: str = "./chroma_data"):
        self.collection_name = collection_name
        self.persist_directory = persist_directory
        self.client = None
        self.collection = None
        self.use_fallback = False
        
        try:
            import chromadb
            self.client = chromadb.PersistentClient(path=self.persist_directory)
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
        except Exception as e:
            print(f"ChromaDB not available or failed to initialize ({e}). Using in-memory fallback.")
            self.use_fallback = True
            self.fallback_db: Dict[str, Dict[str, Any]] = {}

    def add_document(self, doc_id: str, text: str, embedding: List[float], metadata: Optional[Dict[str, Any]] = None):
        """
        Add a single document with its embedding and metadata to the vector index.
        """
        if not self.use_fallback and self.collection:
            try:
                self.collection.add(
                    ids=[doc_id],
                    embeddings=[embedding],
                    documents=[text],
                    metadatas=[metadata or {}]
                )
                return
            except Exception as e:
                print(f"Error adding to ChromaDB: {e}. Falling back to in-memory.")
                
        # In-memory fallback
        self.fallback_db[doc_id] = {
            "id": doc_id,
            "text": text,
            "embedding": embedding,
            "metadata": metadata or {}
        }

    def query_similar(self, query_embedding: List[float], n_results: int = 5) -> List[Dict[str, Any]]:
        """
        Query vector index for similar documents.
        """
        if not self.use_fallback and self.collection:
            try:
                results = self.collection.query(
                    query_embeddings=[query_embedding],
                    n_results=n_results
                )
                
                # Format ChromaDB output
                formatted_results = []
                if results and "ids" in results and results["ids"]:
                    ids = results["ids"][0]
                    documents = results["documents"][0]
                    metadatas = results["metadatas"][0]
                    distances = results["distances"][0] if "distances" in results else [0.0] * len(ids)
                    
                    for i in range(len(ids)):
                        # In ChromaDB cosine distance, 0 is identical and 2 is opposite.
                        # Similarity = 1 - distance/2 or 1 - distance depending on mapping
                        similarity = 1.0 - (distances[i] if distances else 0.0)
                        formatted_results.append({
                            "id": ids[i],
                            "text": documents[i],
                            "metadata": metadatas[i],
                            "similarity_score": round(similarity, 4)
                        })
                return formatted_results
            except Exception as e:
                print(f"ChromaDB query failed: {e}. Querying in-memory.")
                
        # In-memory cosine similarity fallback
        import math
        
        def dot_product(v1, v2):
            return sum(x * y for x, y in zip(v1, v2))
            
        def magnitude(v):
            return math.sqrt(sum(x * x for x in v))
            
        matches = []
        q_mag = magnitude(query_embedding)
        
        for doc_id, doc in self.fallback_db.items():
            doc_emb = doc["embedding"]
            d_mag = magnitude(doc_emb)
            
            if q_mag > 0 and d_mag > 0:
                similarity = dot_product(query_embedding, doc_emb) / (q_mag * d_mag)
            else:
                similarity = 0.0
                
            matches.append({
                "id": doc_id,
                "text": doc["text"],
                "metadata": doc["metadata"],
                "similarity_score": round(similarity, 4)
            })
            
        matches.sort(key=lambda x: x["similarity_score"], reverse=True)
        return matches[:n_results]

    def delete_document(self, doc_id: str):
        """
        Delete a document from index by id.
        """
        if not self.use_fallback and self.collection:
            try:
                self.collection.delete(ids=[doc_id])
                return
            except Exception as e:
                print(f"ChromaDB delete failed: {e}.")
                
        if doc_id in self.fallback_db:
            del self.fallback_db[doc_id]
