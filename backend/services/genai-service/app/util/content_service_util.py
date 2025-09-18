from typing import List, Dict, Any
from app.config.logger_config import get_logger
import json
import httpx
from datetime import datetime
from app.config.eureka_client import eureka_client

logger = get_logger(__name__)

import os
dirname = os.path.dirname(__file__)

try: 
    with open(os.path.join(dirname, 'mock_moods.json')) as json_data:
        logger.info("Loading mock mood data from JSON file")
        mock_mood_data = json.load(json_data)
        json_data.close()
except Exception as e:
    logger.error(f"Error loading mock mood data: {e}")
    mock_mood_data = []
    
try: 
    with open(os.path.join(dirname, 'mock_breathing.json')) as json_data:
        logger.info("Loading mock breathing data from JSON file")
        mock_breathing_exercises = json.load(json_data)
        json_data.close()
except Exception as e:
    logger.error(f"Error loading mock breathing data: {e}")
    mock_breathing_exercises = []

    
try: 
    with open(os.path.join(dirname, 'mock_songs.json')) as json_data:
        logger.info("Loading song data from JSON file")
        song_data = json.load(json_data)
        json_data.close()
except Exception as e:
    logger.error(f"Error loading song data: {e}")
    song_data = {}

    

async def get_mood(user_id: int = 1, days: int = 7, isMock: bool = True) -> List[Dict[str, Any]]:
    """Fetch mood data from assessment-service via Eureka or return mock data"""
    
    if isMock:
        logger.info(f"Returning mock mood data for user_id={user_id}, days={days}")
        return mock_mood_data

    today = datetime.now().date().isoformat()
    logger.info(f"Fetching mood data from service for user_id={user_id}, days={days}, today={today}")

    # Discover content-service
    base_url = await eureka_client.get_service_instance("CONTENT-SERVICE")
    if not base_url:
        logger.error("No available instance of CONTENT-SERVICE")
        return []

    url = f"{base_url}/api/v1/content/mood/get-mood?days={days}&today={today}"

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
    
    
async def get_breathing_exercise(user_id: int = 1, isMock: bool = True) -> List[Dict[str, Any]]:
    """Fetch breathing exercise data from content-service via Eureka or return mock data"""
    
    if isMock:
        logger.info(f"Returning mock breathing exercise data for user_id={user_id}")
        return mock_breathing_exercises

    today = datetime.now().date().isoformat()
    logger.info(f"Fetching breathing exercise data from service for user_id={user_id}")

    # Discover content-service
    base_url = await eureka_client.get_service_instance("CONTENT-SERVICE")
    if not base_url:
        logger.error("No available instance of CONTENT-SERVICE")
        return []

    url = f"{base_url}/api/v1/content/breathing"

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
            breathing_data = response.json()
            logger.info(f"Fetched {len(breathing_data)} breathing exercise data for user_id={user_id}")
            return breathing_data
        else:
            logger.error(f"Error fetching breathing exercise data: {response.status_code} - {response.text}")
            return []

    except Exception as e:
        logger.error(f"Exception fetching breathing exercise data: {e}")
        return []
    
def get_song(mood_category: str , count: int = 5) -> List[Dict[str, str]]:
    """Get recommended songs based on mood"""
    logger.info(f"Fetching songs for mood_category: {mood_category}, count: {count}")
    return song_data.get(mood_category, song_data["uplifting"])[:5]