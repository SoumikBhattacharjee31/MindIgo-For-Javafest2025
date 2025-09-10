from fastapi import APIRouter, Header, BackgroundTasks
from fastapi.responses import StreamingResponse
from app.dto import APIResponseClass, ChatRequest, ChatResponse
from app.service import GeminiChatService 
from typing import Annotated

from app.config import get_logger

router = APIRouter()
chat_service = GeminiChatService()
logger = get_logger(__name__)


def log_safety_alert(user_id: str, safety_alert: dict):
    """Background task to log safety alerts"""
    if safety_alert.get("level") in ["warning", "crisis"]:
        logger.warning(f"User {user_id}: {safety_alert}")


@router.get("/health")
def health_check() -> APIResponseClass:
    return APIResponseClass(success=True, message="Mental Health Service Active", data=None)

@router.get("/open-session")
def get_new_session(user_id: Annotated[str | None, Header()] = None,
                    user_name: Annotated[str | None, Header()] = None) -> APIResponseClass:
    if user_id is None or user_name is None or not user_id.isdigit():
        logger.error("user_id header required or must be numeric")
        return APIResponseClass(success=False, message="user_id header required or must be numeric", data=None)
    
    return APIResponseClass(success=True, 
                            message="Session created", 
                            data=chat_service.provide_session_to_user(int(user_id), user_name),
                            errorCode=None)

@router.post("/chat")
def chat_endpoint(request: ChatRequest, 
                  background_tasks: BackgroundTasks,
                  user_id: Annotated[str | None, Header()] = None,
                  user_name: Annotated[str | None, Header()] = None) -> APIResponseClass:    
    
    if user_id is None or user_name is None or not user_id.isdigit():
        logger.error("user_id , user_name header required or must be numeric")
        return APIResponseClass(success=False, message="user_id header required or must be numeric", data=None)
    if request.session_id is None:
        logger.warning("session_id is required")
        return APIResponseClass(success=False, message="session_id is required", data=None)

    try:
        response = chat_service.chat(
            message=request.prompt, 
            user_id=int(user_id),
            user_name=user_name or "there",
            session_id=request.session_id,
        )
        
        # Log safety alerts in background
        if response.get("safety_alert"):
            background_tasks.add_task(log_safety_alert, user_id, response["safety_alert"])
        
        return APIResponseClass(
            success=True, 
            message="Response generated successfully", 
            data=ChatResponse(
                res=response["message"], 
                recommendations=response.get("recommendations", []),
                escalate=response.get("escalate", False),
                safety_alert=response.get("safety_alert")
            )
        )
    except Exception as e:
        logger.error(f"Error for user {user_id}: {str(e)}")
        return APIResponseClass(
            success=False, 
            message="Unable to process request. Please try again or contact support.", 
            data=None
        )


@router.post("/chat/stream")
async def chat_stream_endpoint(request: ChatRequest, 
                         background_tasks: BackgroundTasks,
                         user_id: Annotated[str | None, Header()] = None,
                         user_name: Annotated[str | None, Header()] = None):
    
    if user_id is None:
        logger.warning("user_id header required")
        return APIResponseClass(success=False, message="user_id header required", data=None)
    if request.thread_id is None:
        logger.warning("thread_id is required")
        return APIResponseClass(success=False, message="thread_id is required", data=None)

    try:
        generator = chat_service.chat_stream(
            message=request.prompt, 
            user_id=int(user_id),
            user_name=user_name or "there",
            thread_id=request.thread_id
        )
        return StreamingResponse(generator, media_type="text/plain")
    except Exception as e:
        logger.error(f"Streaming error for user {user_id}: {str(e)}")
        
        async def error_generator():
            yield "I apologize, but I'm having trouble processing your request right now. Please try again or reach out to support."
        
        return StreamingResponse(error_generator(), media_type="text/plain")