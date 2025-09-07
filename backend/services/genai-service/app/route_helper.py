from fastapi import FastAPI
from fastapi.responses import JSONResponse 
from app.routes import *

def include_routers(app: FastAPI):
    BASE_API_PATH = "/api/v1/genai"
    app.include_router(test_router, 
                       prefix=f"{BASE_API_PATH}/test", 
                       tags=["Test Endpoints"],
                       default_response_class=JSONResponse)
    
    app.include_router(gemini_router, 
                       prefix=f"{BASE_API_PATH}/gemini", 
                       tags=["Gemini Endpoints"],
                       default_response_class=JSONResponse)