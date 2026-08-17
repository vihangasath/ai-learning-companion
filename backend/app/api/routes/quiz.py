from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.quiz import QuizResponse, QuizSubmitRequest, QuizResultResponse
from backend.app.services.quiz_service import quiz_service

router = APIRouter()


@router.get("/{content_id}")
def get_quiz(content_id: str, db: Session = Depends(get_db)):
    user_id = "default-user-id"
    quiz = quiz_service.get_by_content_id(db, content_id, user_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found for this content")

    return {
        "status": "success",
        "data": QuizResponse.model_validate(quiz),
    }


@router.post("/submit")
def submit_quiz(req: QuizSubmitRequest, db: Session = Depends(get_db)):
    user_id = "default-user-id"
    try:
        result = quiz_service.submit_quiz(db, user_id, req.quiz_id, req.answers)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {
        "status": "success",
        "data": result,
        "message": "Quiz submitted successfully",
    }
