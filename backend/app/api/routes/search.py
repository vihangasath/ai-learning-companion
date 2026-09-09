from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.database.schemas.models import Topic
from backend.app.models.note import Note
from backend.app.models.flashcard import Flashcard
from backend.app.models.quiz import Quiz
from backend.app.auth.middleware.auth_middleware import get_optional_user
from backend.app.models.user import User

router = APIRouter()


def _user_id(current_user: User | None) -> str:
    return current_user.id if current_user else "default-user-id"


@router.get("")
def search(
    q: str = Query("", min_length=0, max_length=200),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    user_id = _user_id(current_user)
    term = q.strip()
    results = []

    if not term:
        return {"status": "success", "data": {"query": term, "results": [], "total": 0}}

    needle = f"%{term}%"

    notes = (
        db.query(Note)
        .filter(
            Note.user_id == user_id,
            (Note.title.ilike(needle)) | (Note.summary.ilike(needle)) | (Note.detailed_notes.ilike(needle)),
        )
        .limit(limit)
        .all()
    )
    for n in notes:
        results.append(
            {
                "id": n.id,
                "kind": "note",
                "title": n.title or "Study Notes",
                "text": (n.summary or n.detailed_notes or "")[:300],
                "content_id": n.content_id,
                "score": 95,
            }
        )

    flashcards = (
        db.query(Flashcard)
        .filter(
            Flashcard.user_id == user_id,
            (Flashcard.question.ilike(needle)) | (Flashcard.answer.ilike(needle)),
        )
        .limit(limit)
        .all()
    )
    for fc in flashcards:
        results.append(
            {
                "id": fc.id,
                "kind": "flashcard",
                "title": fc.question,
                "text": fc.answer[:300],
                "content_id": fc.content_id,
                "score": 90,
            }
        )

    topics = db.query(Topic).filter((Topic.name.ilike(needle)) | (Topic.description.ilike(needle))).limit(limit).all()
    for t in topics:
        results.append(
            {
                "id": str(t.id),
                "kind": "topic",
                "title": t.name,
                "text": (t.description or t.category or "")[:300],
                "content_id": None,
                "score": 85,
            }
        )

    results.sort(key=lambda r: r["score"], reverse=True)
    results = _dedupe(results)[:limit]

    return {"status": "success", "data": {"query": term, "results": results, "total": len(results)}}


def _dedupe(results):
    seen = set()
    out = []
    for r in results:
        key = (r["kind"], r["title"], r["text"])
        if key in seen:
            continue
        seen.add(key)
        out.append(r)
    return out