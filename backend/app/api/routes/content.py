from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.content import ContentAnalyzeRequest
from backend.app.services.content_service import content_service

router = APIRouter()


@router.post("/analyze")
def analyze_content(req: ContentAnalyzeRequest, db: Session = Depends(get_db)):
    user_id = "default-user-id"

    result = content_service.process_content(
        db=db,
        user_id=user_id,
        url=req.url,
        content_type=req.content_type,
        raw_text=req.raw_text,
        transcript=req.transcript,
    )

    return {
        "status": "success",
        "data": result,
        "message": "Content analyzed successfully",
    }
