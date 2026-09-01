from typing import List, Dict


class TextChunker:
    def __init__(self, chunk_size: int = 2000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk(self, text: str) -> List[Dict[str, any]]:
        if not text:
            return []

        try:
            import tiktoken
            encoding = tiktoken.get_encoding("cl100k_base")
        except Exception:
            return self._chunk_by_words(text)

        tokens = encoding.encode(text)
        chunks = []
        start = 0

        while start < len(tokens):
            end = start + self.chunk_size
            chunk_tokens = tokens[start:end]
            chunk_text = encoding.decode(chunk_tokens)

            chunks.append({
                "text": chunk_text,
                "token_count": len(chunk_tokens),
                "chunk_index": len(chunks),
            })

            if end >= len(tokens):
                break

            start = end - self.chunk_overlap

        return chunks

    def _chunk_by_words(self, text: str) -> List[Dict[str, any]]:
        words = text.split()
        chunks = []
        start = 0
        word_chunk_size = self.chunk_size // 4

        while start < len(words):
            end = start + word_chunk_size
            chunk_text = " ".join(words[start:end])

            chunks.append({
                "text": chunk_text,
                "token_count": len(chunk_text.split()),
                "chunk_index": len(chunks),
            })

            if end >= len(words):
                break

            overlap_words = self.chunk_overlap // 4
            start = end - overlap_words

        return chunks


text_chunker = TextChunker()
