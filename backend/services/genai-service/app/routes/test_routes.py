from fastapi import APIRouter
from app.dto import APIResponseClass
from app.util import get_mood

router = APIRouter()

@router.get("/test")
def health_test() -> APIResponseClass: 
    return APIResponseClass(success=True, 
                            message="Health check passed", 
                            data={"status": "ok"})

@router.get("/test/get-mood")
async def get_mood_endpoint() -> APIResponseClass:
    mood_data = await get_mood(user_id=1, days=7)
    return APIResponseClass(success=True, message="Mood data fetched", data=mood_data)