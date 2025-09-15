from hashlib import md5
from datetime import datetime 
from typing import Optional, Dict, List, Any

from app.config.settings import settings
from app.config.logger_config import get_logger
from app.db.mongo import get_database
from app.model.oversimplifier_ai_agent import MindigoAIAgent
from app.dto.response_models import Response, Recommendation

logger = get_logger(__name__)

class GeminiChatService:
    def __init__(self):
        self.db_uri = settings.MONGO_URI
        self.db = get_database(mongo_uri=self.db_uri)
        self.mongo_client = self.db.client
        self.ai_agent = MindigoAIAgent(mongo_client=self.mongo_client)
        logger.info("Initialized GeminiChatService with MongoDB")
        
    def _generate_session_id(self, user_id: int) -> str:
        """Generate simple session ID."""
        timestamp = datetime.now().isoformat()
        raw_id = f"{user_id}_{timestamp}"
        return md5(raw_id.encode()).hexdigest()
    
    def _get_or_create_session(self, user_id: int, user_name: str, session_id: str = None) -> str:
        """Get existing session or create new one using database."""
        if session_id:
            # Check if session exists in database
            session_info = self.db.get_session_info(session_id)
            if session_info:
                return session_id
        
        # Create new session ID
        new_session_id = self._generate_session_id(user_id)
        
        # Initialize session in database by updating metadata
        self.db.update_session_metadata(new_session_id, {
            "user_id": user_id,
            "user_name": user_name,
            "created_at": datetime.now().isoformat()
        })
        
        return new_session_id

    def _store_message(self, 
                    user_id: int,
                    user_name: str,
                    session_id: str, 
                    user_message: str,
                    ai_message: str,
                    safety_alert: str,
                    escalate: bool,
                    recommendations: List[Recommendation]) -> bool:
        try:
            metadata = {
                "safety_alert": safety_alert,
                "escalate": escalate,
                "recommendations": [rec.model_dump() for rec in recommendations]  # Convert to dict
            }
                
            self.db.store_message(
                session_id=session_id,
                user_id=user_id,
                user_name=user_name,
                user_message=user_message,
                ai_response=ai_message,
                metadata=metadata
            )
            
                
        except Exception as e:
            logger.error(f"Failed to store message in database: {str(e)}")
            
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Retrieve session information directly from database."""
        try:
            return self.db.get_session_info(session_id)
        except Exception as e:
            logger.error(f"Error getting session {session_id}: {str(e)}")
            return None
        
    def get_user_sessions(self, user_id: int) -> List[Dict]:
        """Get all sessions for a user directly from database."""
        try:
            return self.db.get_user_sessions(user_id)
        except Exception as e:
            logger.error(f"Error getting user sessions for {user_id}: {str(e)}")
            return []

    def provide_session_to_user(self, user_id: int, user_name: str) -> str:
        """Create and return a new session ID for the user."""
        try:
            return self._get_or_create_session(user_id, user_name)
        except Exception as e:
            logger.error(f"Error creating session for user {user_id}: {str(e)}")
            return ""
    
    def get_message_history(self, session_id: str, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """Get complete message history for a session with pagination."""
        try:
            offset = (page - 1) * per_page
            messages = self.db.get_message_history(session_id, limit=per_page, offset=offset)
            total_count = self.db.get_message_count(session_id)
            has_more = offset + per_page < total_count
            
            return {
                "messages": messages,
                "total_messages": total_count,
                "page": page,
                "per_page": per_page,
                "has_more": has_more
            }
        except Exception as e:
            logger.error(f"Error getting message history for {session_id}: {str(e)}")
            return {
                "messages": [],
                "total_messages": 0,
                "page": page,
                "per_page": per_page,
                "has_more": False
            }

    def get_recent_messages(self, session_id: str, count: int = 10) -> List[Dict]:
        """Get recent messages for context."""
        try:
            return self.db.get_recent_messages(session_id, count)
        except Exception as e:
            logger.error(f"Error getting recent messages for {session_id}: {str(e)}")
            return []
    
    def chat(self, 
             user_id: int, 
             user_name: str, 
             message: str, 
             session_id: str = None) -> Response:
        """Process a chat message and return AI response along with session ID."""
        try:
            if not session_id:
               raise ValueError("Session ID is required for chat.")
           
            session_info = self.db.get_session_info(session_id)    
            if not session_info:
               raise ValueError("Invalid session ID provided.")
            # Check if session metadata contains correct user_id
            metadata = session_info.get("metadata", {})
            if metadata.get("user_id") != user_id:
               raise ValueError("Session does not belong to the user.")   
            
            logger.info(f"Processing chat for user {user_id} in session {session_id}")
            response = self.ai_agent.chat(
                user_id=user_id,
                user_name=user_name,
                message=message,
                session_id=session_id
            )
            
            self._store_message(
                user_id=user_id,
                user_name=user_name,
                session_id=session_id,
                user_message=message,
                ai_message=response.message if isinstance(response.message, str) else ''.join(response.message),
                safety_alert=response.safety_alert,
                escalate=response.escalate,
                recommendations=response.recommendations
            );
           
            return response
       
        except Exception as e:
            logger.error(f"Error processing chat for user {user_id} in session {session_id}: {str(e)}")
            return Response(
                message="Sorry, something went wrong while processing your message.",
                recommendations=[],
                escalate=False,
                safety_alert="none"
            )
    
    def chat_stream(self, 
             user_id: int, 
             user_name: str, 
             message: str, 
             session_id: str = None,
             stream_delay: float = 0.0) -> Any:
        """Process a chat message and return AI response along with session ID."""
        import time
        try:
            if not session_id:
               raise ValueError("Session ID is required for chat.")
           
            logger.info(f"Processing chat for user {user_id} in session {session_id}")
        
            response: Response = self.chat(user_id=user_id,
                user_name=user_name,
                message=message,
                session_id=session_id
            )
           
            for item in response.message:
               yield item
               time.sleep(stream_delay)
            
            yield response
                  
           
        except Exception as e:
            logger.error(f"Error processing chat for user {user_id} in session {session_id}: {str(e)}")
            # Yield error message character by character, then error response
            error_message = "Sorry, something went wrong while processing your message."
            for char in error_message:
                yield char
                time.sleep(stream_delay)
            
            yield Response(
                message=error_message,
                recommendations=[],
                escalate=False,
                safety_alert="none"
            )
            