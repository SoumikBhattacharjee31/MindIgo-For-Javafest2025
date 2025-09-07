from typing import List, Dict, Any

import json

with open('D://Mindigo/MindIgo-For-Javafest2025/backend/services/genai-service/app/util/mock_doctor.json') as json_data:
    doctor_data = json.load(json_data)
    json_data.close()
    
def get_doctor(specialty: str = "mental_health") -> List[Dict[str, Any]]:
    """Get list of recommended mental health professionals"""
    return doctor_data