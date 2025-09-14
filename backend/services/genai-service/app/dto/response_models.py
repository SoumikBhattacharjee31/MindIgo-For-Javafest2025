from pydantic import BaseModel
from typing import List, Literal

class Recommendation(BaseModel):
    type: Literal["song", "doctor", "breathing_exercise", "emergency_contact", "mood_insight"]
    title: str
    reason: str
    urgency: Literal["low", "medium", "high", "immediate"] = "low"
    
class Response(BaseModel):
    message: str
    recommendations: List[Recommendation] = []
    escalate: bool = False
    safety_alert: Literal["none", "mild", "crisis"] = "none"