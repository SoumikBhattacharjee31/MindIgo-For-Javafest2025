from app.model.oversimplifier_ai_agent import MindigoAIAgent
from app.db.mongo import get_database

db = get_database()
mindigo_agent = MindigoAIAgent(mongo_client=db.client)

def test_context():
    session_id = "test-session-123"
    user_id = 1
    user_name = "TestUser"

    # Initialize session
    # db.update_session_metadata(session_id, {
    #     "user_id": user_id,
    #     "user_name": user_name,
    #     "created_at": "2024-01-01T00:00:00"
    # })

    messages = [
        "Hello",
        "Call me Steve",
        "Do you remember what I asked you earlier?",
        "What's my name again?"
    ]

    for i, msg in enumerate(messages):
        response = mindigo_agent.chat(
            message=msg,
            user_name=user_name,
            user_id=user_id,
            session_id=session_id
        )
        print(f"Message {i+1}: {msg}")
        print(f"Response: {response.message}")
        print("-" * 40)

test_context()