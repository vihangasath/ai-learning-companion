from fastapi import APIRouter

router = APIRouter()


@router.get("")
def get_recommendations():
    return {
        "status": "success",
        "data": {
            "recommendations": [],
        },
        "message": "Recommendations will be available when Member 3 integrates the recommendation engine",
    }
