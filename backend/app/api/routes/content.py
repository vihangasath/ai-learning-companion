from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.content import ContentAnalyzeRequest
from backend.app.services.content_service import content_service
from backend.app.auth.middleware.auth_middleware import get_optional_user
from backend.app.models.user import User

router = APIRouter()


@router.post("/analyze")
def analyze_content(
    req: ContentAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    user_id = current_user.id if current_user else "default-user-id"

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
