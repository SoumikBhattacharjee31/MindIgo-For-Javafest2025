from langchain_core.tools import tool
from typing import List, Dict, Any
from app.util import get_mood, get_song, get_doctor
from app.config import get_logger
logger = get_logger(__name__)

@tool
def get_mood_history(user_id: int, days: int = 7) -> List[Dict[str, Any]]:
    """
    Tool: Retrieve Mood History
    Purpose:
        Fetches a user's emotional states over a given time period 
        from the mental health database. Useful when analyzing 
        long-term patterns, spotting mood swings, or understanding 
        emotional triggers.

    Parameters:
        - user_id (int): Unique ID of the user.
        - days (int): Number of past days to retrieve. Default is 7.

    Returns:
        A list of moods, each containing:
        {
            "mood": str,             # e.g., "happy", "sad", "terrible"
            "date": str,             # YYYY-MM-DD
            "reason": str,           # short cause for mood
            "description": str       # optional longer explanation
        }
    """
    logger.info(f"Fetching mood history for user {user_id} over the past {days} days.")
    return get_mood(user_id=user_id, days=days)


@tool
def get_recommended_songs(mood_category: str, count: int = 5) -> List[Dict[str, str]]:
    """
    Tool: Recommend Songs
    Purpose:
        Suggests songs tailored to the user’s current emotional state. 
        Use this to provide uplifting, calming, or motivational 
        music when the user might benefit from listening to music.

    Parameters:
        - mood_category (str): Emotional theme of songs.
          Possible categories: "uplifting", "calming", "motivational".
        - count (int): Number of songs to fetch. Default is 5.

    Returns:
        A list of songs, each containing:
        {
            "title": str,    # song name
            "artist": str,   # performer/composer
            "reason": str    # why this song may help
        }
    """
    logger.info(f"Fetching {count} '{mood_category}' songs.")
    return get_song(mood_category=mood_category, count=count)


@tool
def get_recommended_doctors(specialty: str = "mental_health") -> List[Dict[str, Any]]:
    """
    Tool: Recommend Mental Health Professionals
    Purpose:
        Provides a list of qualified doctors, therapists, or 
        psychologists who specialize in mental health support. 
        Useful when the user needs professional help or if the 
        conversation suggests escalation.

    Parameters:
        - specialty (str): Type of specialist. Default is "mental_health".

    Returns:
        A list of professionals, each containing:
        {
            "name": str,                 # e.g., "Dr. Sarah Johnson"
            "specialty": str,            # e.g., "Clinical Psychology"
            "rating": float,             # average rating (0.0 - 5.0)
            "accepts_insurance": bool    # whether they accept insurance
        }
    """
    logger.info(f"Fetching recommended doctors for specialty: {specialty}")
    return get_doctor(specialty=specialty)
