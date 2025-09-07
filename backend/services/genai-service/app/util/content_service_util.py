from typing import List, Dict, Any
from app.config import get_logger
import json

logger = get_logger(__name__)

try: 
    with open('D://Mindigo/MindIgo-For-Javafest2025/backend/services/genai-service/app/util/mock_moods.json') as json_data:
        logger.info("Loading mood data from JSON file")
        mood_data = json.load(json_data)
        json_data.close()
except Exception as e:
    logger.error(f"Error loading mood data: {e}")
    mood_data = []
try: 
    with open('D://Mindigo/MindIgo-For-Javafest2025/backend/services/genai-service/app/util/mock_songs.json') as json_data:
        logger.info("Loading song data from JSON file")
        song_data = json.load(json_data)
        json_data.close()
except Exception as e:
    logger.error(f"Error loading song data: {e}")
    song_data = {}

    
def get_mood(user_id: int = 1, days: int = 7) -> List[Dict[str,Any]]:
    """Fetch mood data from content service"""
    logger.info(f"Fetching mood data for user_id: {user_id}, days: {days}")
    return mood_data[-7:]

def get_song(mood_category: str , count: int = 5) -> List[Dict[str, str]]:
    """Get recommended songs based on mood"""
    logger.info(f"Fetching songs for mood_category: {mood_category}, count: {count}")
    return song_data.get(mood_category, song_data["uplifting"])[:5]