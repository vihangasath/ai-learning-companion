import importlib.util
import os
import sys
from typing import List, Dict, Any

# Dynamic import to handle hyphen in 'semantic-search' folder name
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
search_engine_path = os.path.join(parent_dir, "semantic-search", "search_engine.py")

spec = importlib.util.spec_from_file_location("search_engine", search_engine_path)
search_engine_module = importlib.util.module_from_spec(spec)
sys.modules["search_engine"] = search_engine_module
spec.loader.exec_module(search_engine_module)

SemanticSearchEngine = search_engine_module.SemanticSearchEngine

class BookmarkSearcher:
    """
    Searcher responsible for semantic searching over bookmarks.
    """
    
    def __init__(self, api_key: str = None, persist_directory: str = "./chroma_data"):
        # Setup semantic search engine targeting a dedicated bookmarks collection
        self.search_engine = SemanticSearchEngine(
            api_key=api_key,
            collection_name="bookmarks_embeddings",
            persist_directory=persist_directory
        )

    def index_bookmark(self, bookmark: Dict[str, Any]):
        """
        Embed and index a bookmark's text context.
        """
        doc_id = bookmark["id"]
        # Index the label and text content combined
        text_to_index = f"Label: {bookmark['label']}\nCategory: {bookmark['category']}\nContent: {bookmark['text']}"
        metadata = {
            "user_id": bookmark["user_id"],
            "content_id": bookmark["content_id"],
            "category": bookmark["category"]
        }
        self.search_engine.index_document(doc_id, text_to_index, metadata)

    def search_bookmarks(
        self, 
        query: str, 
        user_id: str, 
        n_results: int = 5, 
        category_filter: str = None
    ) -> List[Dict[str, Any]]:
        """
        Semantically search user bookmarks.
        """
        filters = {"user_id": user_id}
        if category_filter:
            filters["category"] = category_filter
            
        results = self.search_engine.search(
            query=query,
            n_results=n_results,
            filters=filters
        )
        return results
