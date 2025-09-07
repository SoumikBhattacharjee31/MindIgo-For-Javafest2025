from pydantic import BaseModel

class ChatRequest(BaseModel):
    prompt: str
    thread_id: str | None = None
    
class ChatResponse(BaseModel):
    res: str
    recommendations: list | None = []