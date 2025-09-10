from typing import List, Dict, Any
from app.config import get_logger
import json

logger = get_logger(__name__)

try: 
    with open('D://Mindigo/MindIgo-For-Javafest2025/backend/services/genai-service/app/util/mock_doctor.json') as json_data:
        logger.info("Loading doctor data from JSON file")
        doctor_data = json.load(json_data)
        json_data.close()
except Exception as e:
    logger.error(f"Error loading doctor data: {e}")
    doctor_data = []
    
def get_doctor(specialty: str = "mental_health") -> List[Dict[str, Any]]:
    """Get list of recommended mental health professionals"""
    logger.info(f"Fetching doctors for specialty: {specialty}")
    return doctor_data