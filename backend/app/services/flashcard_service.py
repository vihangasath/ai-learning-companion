from datetime import datetime
from sqlalchemy.orm import Session

from backend.app.models.flashcard import Flashcard


class FlashcardService:
    def get_by_content_id(self, db: Session, content_id: str, user_id: str) -> list[Flashcard]:
        return (
            db.query(Flashcard)
            .filter(Flashcard.content_id == content_id, Flashcard.user_id == user_id)
            .all()
        )

    def get_all_by_user(self, db: Session, user_id: str, skip: int = 0, limit: int = 100) -> list[Flashcard]:
        return (
            db.query(Flashcard)
            .filter(Flashcard.user_id == user_id)
            .order_by(Flashcard.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def mark_learned(self, db: Session, flashcard_id: str, user_id: str, learned: bool = True) -> Flashcard | None:
        fc = (
            db.query(Flashcard)
            .filter(Flashcard.id == flashcard_id, Flashcard.user_id == user_id)
            .first()
        )
        if not fc:
            return None
        fc.is_learned = learned
        fc.last_reviewed_at = datetime.utcnow()
        fc.review_count = (fc.review_count or 0) + 1
        db.commit()
        db.refresh(fc)
        return fc


flashcard_service = FlashcardService()
