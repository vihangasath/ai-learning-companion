from typing import List, Dict, Any

class ResultRanker:
    """
    Ranks and filters semantic search query matches based on similarity scores
    and metadata restrictions.
    """
    
    @staticmethod
    def filter_and_rank(
        results: List[Dict[str, Any]], 
        min_score: float = 0.0, 
        filters: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Filters and sorts the result list.
        filters is a dict of metadata fields and expected values.
        """
        filtered_results = []
        
        for item in results:
            score = item.get("similarity_score", 0.0)
            if score < min_score:
                continue
                
            # Apply metadata filters if provided
            match = True
            if filters:
                item_meta = item.get("metadata") or {}
                for f_key, f_val in filters.items():
                    if item_meta.get(f_key) != f_val:
                        match = False
                        break
            
            if match:
                filtered_results.append(item)
                
        # Sort by similarity score descending
        filtered_results.sort(key=lambda x: x.get("similarity_score", 0.0), reverse=True)
        return filtered_results
