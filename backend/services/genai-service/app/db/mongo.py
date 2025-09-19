from pymongo import MongoClient
from typing import List, Dict, Optional
from datetime import datetime
from app.config.logger_config import get_logger
from app.config.settings import settings

logger = get_logger(__name__)

class MindIgoDatabase:
    """Simple MongoDB database handler for MindIgo chat service."""
    
    def __init__(self, mongo_uri: str = "mongodb://mindigo:1234@localhost:27017/"):
        """Initialize MongoDB connection."""
        try:
            logger.info(f"Connecting to MongoDB at: {mongo_uri}")
            self.client = MongoClient(mongo_uri)
            self.db = self.client.mindigo_chat
            
            self.messages = self.db.messages
            self.sessions = self.db.sessions
            
            # Test the connection
            self.client.server_info()
            logger.info("MongoDB connection test successful")
            
            self._create_indexes()
            logger.info("MongoDB database initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize MongoDB with URI {mongo_uri}: {str(e)}")
            raise
    
    def _create_indexes(self):
        """Create database indexes for better performance."""
        try:
            self.messages.create_index([("session_id", 1), ("timestamp", 1)])
            self.sessions.create_index([("user_id", 1)])
            logger.info("Database indexes created successfully")
        except Exception as e:
            logger.error(f"Failed to create indexes: {str(e)}")
            # Don't raise here as indexes are not critical for basic functionality
            # The application can still work without indexes
    
    def store_message(self, session_id: str, user_id: int, user_name: str, 
                     user_message: str, ai_response: str, 
                     metadata: Dict = None) -> str:
        """Store a complete message exchange."""
        try:
            message_doc = {
                "session_id": session_id,
                "user_id": user_id,
                "user_name": user_name,
                "user_message": user_message,
                "ai_response": ai_response,
                "timestamp": datetime.now(),
                "metadata": metadata or {}
            }
            
            result = self.messages.insert_one(message_doc)
            
            # Update session last activity and ensure user_id is at top level
            self.sessions.update_one(
                {"session_id": session_id},
                {
                    "$set": {
                        "user_id": user_id,  # Ensure user_id is at top level
                        "last_activity": datetime.now(),
                        "last_message": user_message,
                        "last_response": ai_response
                    }
                },
                upsert=True
            )
            
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Failed to store message: {str(e)}")
            return ""
    
    def get_message_history(self, session_id: str, limit: int = 50, offset: int = 0) -> List[Dict]:
        """Get message history for a session with pagination."""
        try:
            messages = list(
                self.messages.find(
                    {"session_id": session_id}
                ).sort("timestamp", 1).skip(offset).limit(limit)
            )
            
            for msg in messages:
                msg["_id"] = str(msg["_id"])
            
            return messages
            
        except Exception as e:
            logger.error(f"Failed to get message history: {str(e)}")
            return []

    def get_recent_messages(self, session_id: str, count: int = 5) -> List[Dict]:
        """Get recent messages for context in streaming."""
        try:
            messages = list(
                self.messages.find(
                    {"session_id": session_id}
                ).sort("timestamp", -1).limit(count)
            )
            
            messages.reverse()
            
            for msg in messages:
                msg["_id"] = str(msg["_id"])
            
            return messages
            
        except Exception as e:
            logger.error(f"Failed to get recent messages: {str(e)}")
            return []

    def get_message_count(self, session_id: str) -> int:
        """Get total message count for a session."""
        try:
            return self.messages.count_documents({"session_id": session_id})
        except Exception as e:
            logger.error(f"Failed to get message count: {str(e)}")
            return 0
    
    def get_recent_messages(self, session_id: str, count: int = 10) -> List[Dict]:
        """Get recent messages for context."""
        try:
            messages = list(
                self.messages.find(
                    {"session_id": session_id}
                ).sort("timestamp", -1).limit(count)
            )
            
            # Reverse to get chronological order
            messages.reverse()
            
            # Convert ObjectId to string
            for msg in messages:
                msg["_id"] = str(msg["_id"])
            
            return messages
            
        except Exception as e:
            logger.error(f"Failed to get recent messages: {str(e)}")
            return []
    
    def update_session_metadata(self, session_id: str, metadata: Dict):
        """Update session metadata."""
        try:
            # Store user_id at top level for easier querying
            update_data = {
                "metadata": metadata,
                "last_activity": datetime.now()
            }
            
            # If metadata contains user_id, also store it at top level
            if "user_id" in metadata:
                update_data["user_id"] = metadata["user_id"]
                
            self.sessions.update_one(
                {"session_id": session_id},
                {"$set": update_data},
                upsert=True
            )
        except Exception as e:
            logger.error(f"Failed to update session metadata: {str(e)}")
    
    def get_session_info(self, session_id: str) -> Optional[Dict]:
        """Get session information."""
        try:
            session = self.sessions.find_one({"session_id": session_id})
            if session:
                session["_id"] = str(session["_id"])
            return session
        except Exception as e:
            logger.error(f"Failed to get session info: {str(e)}")
            return None
    
    def get_user_sessions(self, user_id: int, limit: int = 20) -> List[Dict]:
        """Get all sessions for a user."""
        try:
            sessions = list(
                self.sessions.find(
                    {"user_id": user_id}
                ).sort("last_activity", -1).limit(limit)
            )
            
            # Convert ObjectId to string
            for session in sessions:
                session["_id"] = str(session["_id"])
            
            return sessions
            
        except Exception as e:
            logger.error(f"Failed to get user sessions: {str(e)}")
            return []
    
    def close(self):
        """Close database connection."""
        try:
            self.client.close()
            logger.info("MongoDB connection closed")
        except Exception as e:
            logger.error(f"Error closing MongoDB connection: {str(e)}")

_db_instance = None

def get_database(mongo_uri: str = None) -> MindIgoDatabase:
    """Get database instance (singleton pattern)."""
    global _db_instance
    if _db_instance is None:
        # Use provided URI or fall back to settings
        uri = mongo_uri or settings.MONGO_URI
        _db_instance = MindIgoDatabase(uri)
    return _db_instance

def close_database():
    """Close database connection."""
    global _db_instance
    if _db_instance is not None:
        _db_instance.close()
        _db_instance = None
