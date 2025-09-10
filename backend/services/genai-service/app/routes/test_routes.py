from fastapi import APIRouter
from app.dto import APIResponseClass

router = APIRouter()

@router.get("/test")
def health_test() -> APIResponseClass: 
    return APIResponseClass(success=True, 
                            message="Health check passed", 
                            data={"status": "ok"})