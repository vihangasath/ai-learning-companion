import json
from sqlalchemy.orm import Session

from backend.app.models.note import Note


class NoteService:
    def get_by_content_id(self, db: Session, content_id: str, user_id: str) -> Note | None:
        return (
            db.query(Note)
            .filter(Note.content_id == content_id, Note.user_id == user_id)
            .first()
        )

    def get_all_by_user(self, db: Session, user_id: str, skip: int = 0, limit: int = 50) -> list[Note]:
        return (
            db.query(Note)
            .filter(Note.user_id == user_id)
            .order_by(Note.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, db: Session, note_id: str, user_id: str) -> Note | None:
        return (
            db.query(Note)
            .filter(Note.id == note_id, Note.user_id == user_id)
            .first()
        )

    def delete(self, db: Session, note_id: str, user_id: str) -> bool:
        note = self.get_by_id(db, note_id, user_id)
        if not note:
            return False
        db.delete(note)
        db.commit()
        return True


note_service = NoteService()
