from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import get_optional_user
from backend.app.models.user import User
from backend.app.recommendation.engine.recommender import get_recommendations

router = APIRouter()


@router.get("")
def recommendations_endpoint(
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
    limit: int = 5,
):
    user_id = current_user.id if current_user else None
    recs = get_recommendations(db=db, user_id=user_id, limit=limit)
    return {
        "status": "success",
        "data": {
            "recommendations": recs,
            "total": len(recs),
        },
        "message": "Recommendations retrieved successfully",
    }

