import json
import os
from datetime import datetime
from typing import Dict, Any
from app.dto.response_models import Response

class ConversationLogger:
    """Clean logging system for user messages and agent responses"""
    
    def __init__(self, log_file_path: str = "conversation_logs.json"):
        self.log_file_path = log_file_path
        self.ensure_log_file_exists()
    
    def ensure_log_file_exists(self):
        """Create log file if it doesn't exist"""
        if not os.path.exists(self.log_file_path):
            with open(self.log_file_path, 'w', encoding='utf-8') as f:
                json.dump([], f)
    
    def log_conversation(self, user_id: int, user_name: str, session_id: str, 
                        user_message: str, agent_response: Response):
        """Log a conversation exchange"""
        
        # Create clean log entry
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id,
            "user_name": user_name,
            "session_id": session_id,
            "user_message": user_message,
            "agent_response": {
                "message": agent_response.message,
                "recommendations": [
                    {
                        "type": rec.type,
                        "title": rec.title,
                        "reason": rec.reason,
                        "urgency": rec.urgency
                    } for rec in agent_response.recommendations
                ],
                "escalate": agent_response.escalate,
                "safety_alert": agent_response.safety_alert
            },
            "recommendation_count": len(agent_response.recommendations),
            "crisis_escalated": agent_response.escalate
        }
        
        # Read existing logs
        try:
            with open(self.log_file_path, 'r', encoding='utf-8') as f:
                logs = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            logs = []
        
        # Add new entry
        logs.append(log_entry)
        
        # Write back to file
        with open(self.log_file_path, 'w', encoding='utf-8') as f:
            json.dump(logs, f, indent=2, ensure_ascii=False)
    
    def get_recent_conversations(self, limit: int = 50) -> list:
        """Get recent conversation logs"""
        try:
            with open(self.log_file_path, 'r', encoding='utf-8') as f:
                logs = json.load(f)
            return logs[-limit:] if len(logs) > limit else logs
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    
    def get_user_conversations(self, user_id: int, limit: int = 20) -> list:
        """Get conversations for a specific user"""
        try:
            with open(self.log_file_path, 'r', encoding='utf-8') as f:
                logs = json.load(f)
            user_logs = [log for log in logs if log.get("user_id") == user_id]
            return user_logs[-limit:] if len(user_logs) > limit else user_logs
        except (json.JSONDecodeError, FileNotFoundError):
            return []