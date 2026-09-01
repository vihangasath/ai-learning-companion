from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.note import NoteResponse, NoteListResponse
from backend.app.services.note_service import note_service
from backend.app.auth.middleware.auth_middleware import get_current_user
from backend.app.models.user import User

router = APIRouter()


@router.get("/{content_id}")
def get_notes_by_content(content_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id
    note = note_service.get_by_content_id(db, content_id, user_id)
    if not note:
        raise HTTPException(status_code=404, detail="Notes not found for this content")

    return {
        "status": "success",
        "data": NoteResponse.model_validate(note),
    }


@router.get("/user/all")
def get_all_notes(skip: int = 0, limit: int = 50, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id
    notes = note_service.get_all_by_user(db, user_id, skip, limit)

    return {
        "status": "success",
        "data": NoteListResponse(
            notes=[NoteResponse.model_validate(n) for n in notes],
            total=len(notes),
        ),
    }
