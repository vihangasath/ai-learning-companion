from backend.app.ai_engine.processors.transcript_extractor import transcript_extractor
from backend.app.ai_engine.processors.text_cleaner import text_cleaner
from backend.app.ai_engine.processors.chunker import text_chunker
from backend.app.ai_engine.processors.embedding_generator import embedding_generator
from backend.app.ai_engine.generators.summary_generator import summary_generator
from backend.app.ai_engine.generators.note_generator import note_generator
from backend.app.ai_engine.generators.flashcard_generator import flashcard_generator
from backend.app.ai_engine.generators.quiz_generator import quiz_generator
from backend.app.ai_engine.generators.topic_detector import topic_detector


class ContentPipeline:
    def run(
        self,
        url: str,
        content_type: str,
        raw_text: str | None = None,
        transcript: str | None = None,
    ) -> dict:
        raw = transcript_extractor.extract(url, content_type, raw_text or transcript)

        cleaned = text_cleaner.clean(raw)

        chunks = text_chunker.chunk(cleaned)

        full_text = " ".join([c["text"] for c in chunks])

        topic_result = topic_detector.detect(full_text)

        formulas = topic_detector.extract_formulas(full_text)

        embeddings = embedding_generator.generate([c["text"] for c in chunks])
        embedding_generator.store_embeddings(chunks, embeddings)

        summary = summary_generator.generate(full_text)

        notes = note_generator.generate(full_text, title_hint=url)

        flashcards = flashcard_generator.generate(full_text)

        quiz = quiz_generator.generate(full_text)

        return {
            "title": notes.get("title", "Untitled"),
            "summary": summary.get("short_summary", ""),
            "detailed_notes": self._format_notes(notes),
            "flashcards": flashcards,
            "quiz": quiz,
            "topics": topic_result,
            "formulas": formulas,
        }

    def _format_notes(self, notes: dict) -> str:
        sections = notes.get("sections", [])
        lines = []
        for section in sections:
            lines.append(f"## {section.get('heading', '')}")
            for point in section.get("points", []):
                lines.append(f"- {point}")
            lines.append("")
        return "\n".join(lines)


content_pipeline = ContentPipeline()
