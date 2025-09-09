from typing import List, Dict, Any
from app.config import get_logger
import json
import httpx
from datetime import datetime
from app.config import eureka_client

logger = get_logger(__name__)

# try: 
#     with open('D://Mindigo/MindIgo-For-Javafest2025/backend/services/genai-service/app/util/mock_moods.json') as json_data:
#         logger.info("Loading mood data from JSON file")
#         mood_data = json.load(json_data)
#         json_data.close()
# except Exception as e:
#     logger.error(f"Error loading mood data: {e}")
#     mood_data = []
try: 
    with open('D://Mindigo/MindIgo-For-Javafest2025/backend/services/genai-service/app/util/mock_songs.json') as json_data:
        logger.info("Loading song data from JSON file")
        song_data = json.load(json_data)
        json_data.close()
except Exception as e:
    logger.error(f"Error loading song data: {e}")
    song_data = {}

    


async def get_mood(user_id: int = 1, days: int = 7) -> List[Dict[str, Any]]:
    """Fetch mood data from assessment-service via Eureka"""

    today = datetime.now().date().isoformat()
    logger.info(f"Fetching mood data for user_id={user_id}, days={days}, today={today}")

    # Discover assessment-service
    base_url = await eureka_client.get_service_instance("ASSESSMENT-SERVICE")
    if not base_url:
        logger.error("No available instance of ASSESSMENT-SERVICE")
        return []

    url = f"{base_url}/api/v1/assessment/mood/get-mood?days={days}&today={today}"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers={
                    "X-User-Id": str(user_id),
                    "X-User-Role": "user",
                    "Content-Type": "application/json",
                },
                timeout=10.0
            )

        if response.status_code == 200:
            mood_data = response.json()
            logger.info(f"Fetched {len(mood_data)} moods for user_id={user_id}")
            return mood_data
        else:
            logger.error(f"Error fetching mood data: {response.status_code} - {response.text}")
            return []

    except Exception as e:
        logger.error(f"Exception fetching mood data: {e}")
        return []
    
def get_song(mood_category: str , count: int = 5) -> List[Dict[str, str]]:
    """Get recommended songs based on mood"""
    logger.info(f"Fetching songs for mood_category: {mood_category}, count: {count}")
    return song_data.get(mood_category, song_data["uplifting"])[:5]