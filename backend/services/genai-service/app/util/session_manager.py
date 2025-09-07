from typing import List, Optional, Dict
from datetime import datetime
from pymongo import MongoClient
import hashlib

class SessionManager:
    """Manages user sessions and retrieval from MongoDB"""
    
    def __init__(self, mongo_client: MongoClient):
        self.client = mongo_client
        self.db = self.client.mindigo_sessions
        self.sessions = self.db.sessions
        
    def create_session(self, user_id: int, user_name: str, session_data: Dict = None) -> str:
        """Create a new session"""
        session_id = self._generate_session_id(user_id)
        
        session_doc = {
            "_id": session_id,
            "user_id": user_id,
            "user_name": user_name,
            "created_at": datetime.utcnow(),
            "last_activity": datetime.utcnow(),
            "safety_score": 0,
            "session_data": session_data or {}
        }
        
        self.sessions.replace_one(
            {"_id": session_id}, 
            session_doc, 
            upsert=True
        )
        
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Retrieve session by ID"""
        return self.sessions.find_one({"_id": session_id})
    
    def get_user_sessions(self, user_id: int) -> List[Dict]:
        """Get all sessions for a user"""
        return list(self.sessions.find(
            {"user_id": user_id}
        ).sort("last_activity", -1))
    
    def update_session(self, session_id: str, update_data: Dict):
        """Update session data"""
        update_data["last_activity"] = datetime.utcnow()
        self.sessions.update_one(
            {"_id": session_id},
            {"$set": update_data}
        )
    
    def get_or_create_session(self, user_id: int, user_name: str, session_id: str = None) -> str:
        """Get existing session or create new one"""
        if session_id:
            session = self.get_session(session_id)
            if session:
                # Update last activity
                self.update_session(session_id, {})
                return session_id
        
        # Create new session
        return self.create_session(user_id, user_name)
    
    def _generate_session_id(self, user_id: int) -> str:
        """Generate unique session ID"""
        timestamp = datetime.now().isoformat()
        raw_id = f"{user_id}_{timestamp}"
        return hashlib.md5(raw_id.encode()).hexdigest()