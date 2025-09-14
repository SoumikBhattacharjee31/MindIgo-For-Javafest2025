from typing import List, Dict, Any
from app.config.logger_config import get_logger
import json

import os
dirname = os.path.dirname(__file__)

logger = get_logger(__name__)

try: 
    with open(os.path.join(dirname, 'mock_doctor.json')) as json_data:
        logger.info("Loading mock doctor data from JSON file")
        mock_doctor_data = json.load(json_data)
        json_data.close()
except Exception as e:
    logger.error(f"Error loading mock doctor data: {e}")
    mock_doctor_data = []
    
def get_doctor(specialty: str = "mental_health", isMock: bool = True) -> List[Dict[str, Any]]:
    """Get list of recommended mental health professionals from service or mock data"""
    
    if isMock:
        logger.info(f"Returning mock doctor data for specialty: {specialty}")
        return mock_doctor_data
    
    # TODO: Implement actual service call when doctor service is available
    logger.info(f"Fetching doctors from service for specialty: {specialty}")
    logger.warning("Doctor service not implemented yet, returning mock data")
    return mock_doctor_data