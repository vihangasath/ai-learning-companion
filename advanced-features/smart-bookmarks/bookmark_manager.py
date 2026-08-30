from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from .categorizer import BookmarkCategorizer
from .auto_labeler import BookmarkAutoLabeler

class BookmarkManager:
    """
    Handles bookmark CRUD operations, including auto-categorization and AI label generation.
    """
    
    def __init__(self, use_llm: bool = True, api_key: str = None):
        self.categorizer = BookmarkCategorizer(use_llm=use_llm, api_key=api_key)
        self.labeler = BookmarkAutoLabeler(use_llm=use_llm, api_key=api_key)
        self.in_memory_db: Dict[str, Dict[str, Any]] = {}

    def create_bookmark(
        self,
        user_id: str,
        content_id: str,
        content_url: str,
        text: str,
        timestamp_seconds: Optional[int] = None,
        custom_label: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates a new bookmark. Auto-categorizes the text and generates an AI label if not provided.
        """
        bookmark_id = str(uuid.uuid4())
        
        # Auto-categorize
        category = self.categorizer.categorize(text)
        
        # Generate label if not custom
        ai_label = None
        if not custom_label:
            ai_label = self.labeler.generate_label(text)
            label = ai_label
        else:
            label = custom_label
            
        bookmark = {
            "id": bookmark_id,
            "user_id": user_id,
            "content_id": content_id,
            "content_url": content_url,
            "text": text,
            "timestamp_seconds": timestamp_seconds,
            "category": category,
            "label": label,
            "ai_generated_label": ai_label,
            "created_at": datetime.utcnow().isoformat()
        }
        
        self.in_memory_db[bookmark_id] = bookmark
        return bookmark

    def get_bookmark(self, bookmark_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a bookmark by ID.
        """
        return self.in_memory_db.get(bookmark_id)

    def delete_bookmark(self, bookmark_id: str) -> bool:
        """
        Delete a bookmark by ID.
        """
        if bookmark_id in self.in_memory_db:
            del self.in_memory_db[bookmark_id]
            return True
        return False

    def list_bookmarks(self, user_id: str, content_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all bookmarks for a user, optionally filtered by content_id.
        """
        results = []
        for bm in self.in_memory_db.values():
            if bm["user_id"] == user_id:
                if content_id is None or bm["content_id"] == content_id:
                    results.append(bm)
        return results
