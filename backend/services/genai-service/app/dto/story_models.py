from pydantic import BaseModel
from typing import List, Optional


class VoiceSettings(BaseModel):
    stability: float = 0.5
    similarity_boost: float = 0.75
    style: float = 0.0
    use_speaker_boost: bool = True

class Voice(BaseModel):
    voice_id: str
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    preview_url: Optional[str] = None
    available_for_tiers: Optional[List[str]] = None
    settings: Optional[VoiceSettings] = None

class VoicesResponse(BaseModel):
    voices: List[Voice]

class TTSRequest(BaseModel):
    voice_id: str
    text: str
    voice_settings: Optional[VoiceSettings] = None
    output_format: str = "mp3_44100_128"