"""
Simple test to verify database integration with GeminiChatService
"""
import asyncio
import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.service.gemini_chat_service import GeminiChatService
from app.db import get_database

def test_database_integration():
    """Test basic database operations."""
    print("🧪 Testing database integration...")
    
    try:
        # Initialize service
        service = GeminiChatService()
        
        # Test database connection
        db = get_database()
        print("✅ Database connection established")
        
        # Test message storage
        session_id = "test_session_123"
        user_id = 1
        user_name = "Test User"
        
        # Store a test message
        message_id = db.store_message(
            session_id=session_id,
            user_id=user_id,
            user_name=user_name,
            user_message="Hello, I'm feeling a bit anxious today",
            ai_response="I understand that you're feeling anxious. That's completely normal and I'm here to help.",
            metadata={"test": True, "safety_score": 1}
        )
        print(f"✅ Message stored with ID: {message_id}")
        
        # Test message retrieval
        history = db.get_message_history(session_id)
        print(f"✅ Retrieved {len(history)} messages from history")
        
        if history:
            latest = history[-1]
            print(f"   Latest message: {latest['user_message'][:50]}...")
            print(f"   Latest response: {latest['ai_response'][:50]}...")
        
        # Test session info
        session_info = db.get_session_info(session_id)
        print(f"✅ Session info retrieved: {session_info is not None}")
        
        # Clean up
        service.close()
        print("✅ Database integration test completed successfully!")
        
    except Exception as e:
        print(f"❌ Database integration test failed: {str(e)}")
        import traceback
        traceback.print_exc()

def test_simple_chat():
    """Test a simple chat interaction."""
    print("\n💬 Testing simple chat interaction...")
    
    try:
        service = GeminiChatService()
        
        # Test chat
        response = service.chat(
            message="Hi there!",
            user_id=1,
            user_name="Test User"
        )
        
        print(f"✅ Chat response received: {response['message'][:100]}...")
        print(f"   Session ID: {response['session_id']}")
        print(f"   Escalate: {response['escalate']}")
        
        # Test message history retrieval
        session_id = response['session_id']
        history = service.get_message_history(session_id)
        print(f"✅ Message history contains {len(history)} messages")
        
        service.close()
        print("✅ Simple chat test completed successfully!")
        
    except Exception as e:
        print(f"❌ Simple chat test failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 Starting MindIgo Database Integration Tests...\n")
    
    test_database_integration()
    test_simple_chat()
    
    print("\n🎉 All tests completed!")
