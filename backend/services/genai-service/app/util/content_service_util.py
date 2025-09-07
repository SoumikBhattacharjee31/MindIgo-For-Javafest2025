from typing import List, Dict, Any

import json

with open('D://Mindigo/MindIgo-For-Javafest2025/backend/services/genai-service/app/util/mock_moods.json') as json_data:
    mood_data = json.load(json_data)
    json_data.close()
    
with open('D://Mindigo/MindIgo-For-Javafest2025/backend/services/genai-service/app/util/mock_songs.json') as json_data:
    song_data = json.load(json_data)
    json_data.close()
    
def get_mood(user_id: int = 1, days: int = 7) -> List[Dict[str,Any]]:
    """Fetch mood data from content service"""
    return mood_data[-7:]

def get_song(mood_category: str , count: int = 5) -> List[Dict[str, str]]:
    """Get recommended songs based on mood"""
    return song_data.get(mood_category, song_data["uplifting"])[:5]