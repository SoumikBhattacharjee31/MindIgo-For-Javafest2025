from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.dto.response_models import Recommendation

class ChatRequest(BaseModel):
    prompt: str
    session_id: str | None = None
    

class SessionResponse(BaseModel):
    session_id: str
    user_id: int
    user_name: str
    created_at: str
    last_activity: str
    message_count: int = 0

class MessageHistoryRequest(BaseModel):
    session_id: str
    page: int = 1
    per_page: int = 20

class MessageHistoryResponse(BaseModel):
    messages: List[Dict[str, Any]]
    total_messages: int
    page: int
    per_page: int
    has_more: bool