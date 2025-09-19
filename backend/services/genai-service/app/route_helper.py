from fastapi import FastAPI
from fastapi.responses import JSONResponse 
from app.routes.gemini_routes import router as gemini_router
from app.routes.quiz_routes import router as quiz_router
from app.routes.test_routes import router as test_router

from app.config.logger_config import get_logger

logger = get_logger(__name__)


def include_routers(app: FastAPI):
    BASE_API_PATH = "/api/v1/genai"
    app.include_router(test_router, 
                       prefix=f"{BASE_API_PATH}", 
                       tags=["Test Endpoints"],
                       default_response_class=JSONResponse)
    
    app.include_router(gemini_router, 
                       prefix=f"{BASE_API_PATH}/gemini", 
                       tags=["Gemini Endpoints"],
                       default_response_class=JSONResponse)
    app.include_router(quiz_router, 
                       prefix=f"{BASE_API_PATH}/quiz",
                       tags=["Quiz Endpoints"],
                       default_response_class=JSONResponse)
