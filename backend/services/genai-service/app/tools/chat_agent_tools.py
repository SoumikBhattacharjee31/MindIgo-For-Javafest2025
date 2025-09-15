from langchain_core.tools import tool
from typing import List, Dict, Any
from app.util.content_service_util import get_mood, get_song, get_breathing_exercise
from app.util.doctor_service_util import get_doctor
from app.config.logger_config import get_logger
import asyncio

logger = get_logger(__name__)

@tool
def get_mood_history(user_id: int, days: int = 7) -> List[Dict[str, Any]]:
    """
    Retrieve Mood History Tool
    -------------------------
    Fetches a user's emotional states over a given time period from the mental health database.
    Useful for analyzing long-term patterns, spotting mood swings, or understanding emotional triggers.

    Args:
        user_id (int): Unique ID of the user whose mood history is to be retrieved.
        days (int, optional): Number of past days to retrieve mood data for. Default is 7.

    Returns:
        List[Dict[str, Any]]: A list of mood records, each containing:
            - mood (str): e.g., "happy", "sad", "terrible"
            - date (str): Date in YYYY-MM-DD format
            - reason (str): Short cause for the mood
            - description (str): Optional longer explanation
    """
    logger.info(f"Fetching mood history for user {user_id} over the past {days} days.")
    
    # Use mock data for testing - simplified async handling
    try:
        # Create new event loop for this thread if needed
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        # Always use mock data for testing
        result = loop.run_until_complete(get_mood(user_id=user_id, days=days, isMock=False))
        
        logger.info(f"Successfully fetched {len(result)} mood records for user {user_id}")
        return result
    except Exception as e:
        logger.error(f"Error fetching mood history: {e}")
        # Return a fallback mock response
        return []

@tool
def get_breathing_exercise_data(user_id: int) -> List[Dict[str, str]]:
    """
    Retrieve Breathing Exercise Data Tool
    -------------------------------------
    Fetches a user's breathing exercise records from the mental health database.
    Useful for recommending relaxation techniques or tracking engagement with breathing exercises.

    Each breathing exercise record has the following structure:
        {
            "id": int,                # Unique identifier for the exercise
            "title": str,             # Name of the breathing exercise (e.g., "Box", "Long exhale")
            "description": str,      # Purpose or benefit (e.g., "Relaxation", "Sleep")
            "pattern": str,          # Breathing pattern (e.g., "4-4-4-4")
            "duration": int,         # Total duration in minutes
            "cycle": {
                "duration": int,     # Duration of one full cycle in seconds
                "task": [
                    { "order": int, "type": str, "duration": int }  # Steps: inhale/hold/exhale, order, and duration in seconds
                ]
            }
        }

    Args:
        user_id (int): Unique ID of the user whose breathing exercise data is to be retrieved.

    Returns:
        List[Dict[str, Any]]: A list of breathing exercise records as described above.
    """
    logger.info(f"Fetching breathing exercise data for user {user_id}.")
    
    # Use mock data for testing - simplified async handling
    try:
        # Create new event loop for this thread if needed
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        # Always use mock data for testing
        result = loop.run_until_complete(get_breathing_exercise(user_id=user_id, isMock=False))
        
        logger.info(f"Successfully fetched {len(result)} breathing exercises for user {user_id}")
        return result
    except Exception as e:
        logger.error(f"Error fetching breathing exercises: {e}")
        # Return a fallback mock response
        return []

@tool
def get_recommended_songs(mood_category: str, count: int = 5) -> List[Dict[str, str]]:
    """
    Recommend Songs Tool
    -------------------
    Suggests songs tailored to the user's current emotional state.
    Use this tool to provide uplifting, calming, or motivational music recommendations.

    Args:
        mood_category (str): Emotional theme of songs. Possible values: "uplifting", "calming", "motivational".
        count (int, optional): Number of songs to fetch. Default is 5.

    Returns:
        List[Dict[str, str]]: A list of songs, each containing:
            - title (str): Song name
            - artist (str): Performer or composer
            - reason (str): Why this song may help
    """
    logger.info(f"Fetching {count} '{mood_category}' songs.")
    
    try:
        # get_song function already returns mock data by default
        result = get_song(mood_category=mood_category, count=count)
        logger.info(f"Successfully fetched {len(result)} songs for {mood_category}")
        return result
    except Exception as e:
        logger.error(f"Error fetching songs: {e}")
        # Return a fallback mock response
        return [
            {
                "title": "Breathe Me",
                "artist": "Sia",
                "reason": "Helps with emotional processing and self-reflection"
            },
            {
                "title": "Weightless",
                "artist": "Marconi Union", 
                "reason": "Scientifically designed to reduce anxiety"
            }
        ]

@tool
def get_recommended_doctors(specialty: str = "mental_health") -> List[Dict[str, Any]]:
    """
    Recommend Mental Health Professionals Tool
    -----------------------------------------
    Provides a list of qualified doctors, therapists, or psychologists who specialize in mental health support.
    Useful when the user needs professional help or if the conversation suggests escalation.

    Args:
        specialty (str, optional): Type of specialist to recommend. Default is "mental_health".

    Returns:
        List[Dict[str, Any]]: A list of professionals, each containing:
            - name (str): e.g., "Dr. Sarah Johnson"
            - specialty (str): e.g., "Clinical Psychology"
            - rating (float): Average rating (0.0 - 5.0)
            - accepts_insurance (bool): Whether they accept insurance
    """
    logger.info(f"Fetching recommended doctors for specialty: {specialty}.")
    
    try:
        # Use mock data for testing - this is synchronous
        result = get_doctor(specialty=specialty, isMock=True)
        logger.info(f"Successfully fetched {len(result)} doctors for {specialty}")
        return result
    except Exception as e:
        logger.error(f"Error fetching doctors: {e}")
        # Return a fallback mock response
        return [
            {
                "name": "Dr. Sarah Johnson",
                "specialty": "Clinical Psychology",
                "rating": 4.8,
                "accepts_insurance": True,
                "contact": "555-0123",
                "location": "Downtown Mental Health Center"
            },
            {
                "name": "Dr. Michael Chen",
                "specialty": "Psychiatry", 
                "rating": 4.6,
                "accepts_insurance": True,
                "contact": "555-0124",
                "location": "City Medical Center"
            }
        ]

# Test function to verify tools work correctly
