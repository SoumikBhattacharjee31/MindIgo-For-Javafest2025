from fastapi import APIRouter, Header, BackgroundTasks, HTTPException, status
from app.dto.api_response_class import APIResponseClass
from app.dto.gemini_response import ChatRequest, MessageHistoryResponse
from app.service.simplified_gemini_chat_service import GeminiChatService 
from typing import Annotated


from app.config.logger_config import get_logger

router = APIRouter()
chat_service = GeminiChatService()
logger = get_logger(__name__)


def log_safety_alert(user_id: str, safety_alert: dict):
    """Background task to log safety alerts"""
    if safety_alert.get("level") in ["warning", "crisis"]:
        logger.warning(f"🚨 SAFETY ALERT - User {user_id}: {safety_alert}")


def validate_headers(user_id: str = None, user_name: str = None):
    """Validate required headers"""
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-User-Id header is required"
        )
    if not user_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-User-Name header is required"
        )
    if not user_id.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-User-Id must be a valid integer"
        )
    return int(user_id), user_name


@router.get("/health")
def health_check() -> APIResponseClass:
    """Health check endpoint"""
    return APIResponseClass(
        success=True, 
        message="Mental Health Service Active", 
        data={"status": "healthy", "service": "genai-service"}
    )


@router.post("/session/new")
def create_new_session(
    user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
    user_name: Annotated[str | None, Header(alias="X-User-Name")] = None
) -> APIResponseClass:
    """Create a new chat session"""
    try:
        validated_user_id, validated_user_name = validate_headers(user_id, user_name)
        
        session_id = chat_service.provide_session_to_user(validated_user_id, validated_user_name)
        
        if not session_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create session"
            )
        
        return APIResponseClass(
            success=True, 
            message="Session created successfully", 
            data={"session_id": session_id}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating session for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while creating session"
        )


@router.get("/session/{session_id}")
def get_session_history(
    session_id: str,
    page: int = 1,
    per_page: int = 20,
    user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
    user_name: Annotated[str | None, Header(alias="X-User-Name")] = None
) -> APIResponseClass:
    """Get session message history with pagination"""
    try:
        validate_headers(user_id, user_name)
        
        if not session_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session ID is required"
            )
        
        if page < 1 or per_page < 1 or per_page > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid pagination parameters. Page must be >= 1, per_page must be 1-100"
            )
        
        # Check if session exists
        session_info = chat_service.get_session(session_id)
        if not session_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        # Get message history
        history_data = chat_service.get_message_history(session_id, page, per_page)
        
        return APIResponseClass(
            success=True,
            message="Session history retrieved successfully",
            data=MessageHistoryResponse(**history_data)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session history for {session_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving session history"
        )

@router.get("/user-sessions")
def get_user_session_history(
    user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
    user_name: Annotated[str | None, Header(alias="X-User-Name")] = None
) -> APIResponseClass:
    """Get user sessions"""
    try:
        validated_user_id, _ = validate_headers(user_id, user_name)
        
        # Get user sessions
        sessions = chat_service.get_user_sessions(user_id=validated_user_id)
        if not sessions:
            logger.info(f"No sessions found for user {validated_user_id}")
            return APIResponseClass(
                success=True,
                message="No sessions found for user",
                data=[]
            )
        
        
        return APIResponseClass(
            success=True,
            message="User sessions  retrieved successfully",
            data=sessions
        )
        
    except Exception as e:
        logger.error(f"Error getting session history for {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving session history"
        )


@router.post("/chat")
def chat_endpoint(
    request: ChatRequest, 
    background_tasks: BackgroundTasks,
    user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
    user_name: Annotated[str | None, Header(alias="X-User-Name")] = None
) -> APIResponseClass:    
    """Non-streaming chat endpoint"""
    try:
        validated_user_id, validated_user_name = validate_headers(user_id, user_name)
        
        if not request.prompt or not request.prompt.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message prompt is required and cannot be empty"
            )
        
        if not request.session_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session ID is required"
            )

        response = chat_service.chat(
            message=request.prompt.strip(), 
            user_id=validated_user_id,
            user_name=validated_user_name,
            session_id=request.session_id,
        )
        
        # Log safety alerts in background
        if response.safety_alert and response.safety_alert in ["warning", "crisis"]:
            background_tasks.add_task(log_safety_alert, user_id, response.safety_alert)

        return APIResponseClass(
            success=True, 
            message="Response generated successfully", 
            data= response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while processing chat request"
        )

