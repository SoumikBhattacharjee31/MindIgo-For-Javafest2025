from pydantic import BaseModel

class ChatRequest(BaseModel):
    prompt: str
    session_id: str | None = None
    
class ChatResponse(BaseModel):
    res: str
    recommendations: list | None = []