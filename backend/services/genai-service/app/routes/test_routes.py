from fastapi import APIRouter
from app.dto.api_response_class import APIResponseClass
from app.util.content_service_util import get_breathing_exercise, get_mood

router = APIRouter()

@router.get("/test")
def health_test() -> APIResponseClass: 
    return APIResponseClass(success=True, 
                            message="Health check passed", 
                            data={"status": "ok"})

@router.get("/test/get-mood")
async def get_mood_endpoint() -> APIResponseClass:
    mood_data = await get_mood(user_id=1, days=7,isMock=False)
    return APIResponseClass(success=True, message="Mood data fetched", data=mood_data)

@router.get("/test/get-breathing")
async def get_breathing_endpoint() -> APIResponseClass:
    breathing_data = await get_breathing_exercise(user_id=1, isMock=False)
    return APIResponseClass(success=True, message="Breathing data fetched", data=breathing_data)