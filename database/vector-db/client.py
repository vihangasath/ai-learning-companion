"""
Vector DB Client - Placeholder for Phase 2
For hackathon, we use knowledge graph + rule-based recommendations.


Future integration:
- ChromaDB / Pinecone / pgvector
- Store embeddings of notes, transcripts
- Semantic search: "Find my notes about backpropagation"

How to integrate (example):
```
import chromadb
client = chromadb.Client()
collection = client.create_collection("learnflow_notes")
collection.add(documents=[note.content], ids=[str(note.id)])
results = collection.query(query_texts=["explain gradient descent"], n_results=5)
```

For now, keep it simple - no external dependency needed.
"""

class VectorDBClient:
    def __init__(self):
        self.enabled = False
        print("Vector DB placeholder - not needed for hackathon MVP")

    def add_note(self, note_id: str, content: str):
        pass

    def semantic_search(self, query: str, n_results: int = 5):
        # Fallback to keyword search for MVP
        return []

# Singleton
vector_db = VectorDBClient()
