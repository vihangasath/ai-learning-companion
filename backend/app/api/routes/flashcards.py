from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.flashcard import (
    FlashcardResponse,
    FlashcardListResponse,
    FlashcardUpdateRequest,
)
from backend.app.services.flashcard_service import flashcard_service
from backend.app.auth.middleware.auth_middleware import get_current_user
from backend.app.models.user import User

router = APIRouter()


@router.get("/user/all")
def get_all_flashcards(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id
    flashcards = flashcard_service.get_all_by_user(db, user_id, skip, limit)

    return {
        "status": "success",
        "data": FlashcardListResponse(
            flashcards=[FlashcardResponse.model_validate(fc) for fc in flashcards],
            total=len(flashcards),
        ),
    }


@router.get("/{content_id}")
def get_flashcards(content_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id
    flashcards = flashcard_service.get_by_content_id(db, content_id, user_id)

    return {
        "status": "success",
        "data": FlashcardListResponse(
            flashcards=[FlashcardResponse.model_validate(fc) for fc in flashcards],
            total=len(flashcards),
        ),
    }


@router.put("/{flashcard_id}/learned")
def mark_learned(flashcard_id: str, req: FlashcardUpdateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id
    fc = flashcard_service.mark_learned(db, flashcard_id, user_id, req.is_learned)
    if not fc:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    return {
        "status": "success",
        "data": FlashcardResponse.model_validate(fc),
        "message": "Flashcard updated",
    }
