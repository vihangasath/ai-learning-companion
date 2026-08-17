import json
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from backend.app.models.note import Note
from backend.app.models.flashcard import Flashcard
from backend.app.models.quiz import Quiz


class ContentService:
    def process_content(
        self,
        db: Session,
        user_id: str,
        url: str,
        content_type: str,
        raw_text: str | None = None,
        transcript: str | None = None,
    ) -> dict:
        content_id = str(uuid.uuid4())

        from ai_engine.pipelines.content_pipeline import ContentPipeline

        pipeline = ContentPipeline()
        result = pipeline.run(
            url=url,
            content_type=content_type,
            raw_text=raw_text,
            transcript=transcript,
        )

        note = Note(
            id=str(uuid.uuid4()),
            user_id=user_id,
            content_id=content_id,
            content_url=url,
            content_type=content_type,
            title=result.get("title", "Untitled"),
            summary=result.get("summary", ""),
            detailed_notes=result.get("detailed_notes", ""),
            topics=json.dumps([t["topic"] for t in result.get("topics", [])]),
        )
        db.add(note)

        for fc_data in result.get("flashcards", []):
            fc = Flashcard(
                id=str(uuid.uuid4()),
                user_id=user_id,
                content_id=content_id,
                question=fc_data["question"],
                answer=fc_data["answer"],
                difficulty=fc_data.get("difficulty", "medium"),
            )
            db.add(fc)

        quiz = Quiz(
            id=str(uuid.uuid4()),
            user_id=user_id,
            content_id=content_id,
            questions=json.dumps(result.get("quiz", [])),
            quiz_type="mixed",
        )
        db.add(quiz)

        db.commit()

        return {
            "content_id": content_id,
            "content_url": url,
            "content_type": content_type,
            "title": result.get("title", "Untitled"),
            "summary": result.get("summary", ""),
            "detailed_notes": result.get("detailed_notes", ""),
            "flashcards": result.get("flashcards", []),
            "quiz": result.get("quiz", []),
            "topics": result.get("topics", []),
            "formulas": result.get("formulas", []),
            "created_at": datetime.utcnow(),
        }


content_service = ContentService()
