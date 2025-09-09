# from google import genai
# from app.config.settings import settings
# import os
# from dotenv import load_dotenv

# load_dotenv()
# print(os.environ['GEMINI_API_KEY'])

# # The client gets the API key from the environment variable `GEMINI_API_KEY`.
# client = genai.Client(api_key=os.environ['GEMINI_API_KEY'])

# response = client.models.generate_content(
#     model="gemini-2.5-flash", contents="Explain how AI works in a few words"
# )
# print(response.text)


# print(settings.GEMINI_API_KEY)
# print(settings.SERVER_PORT)

# client = genai.Client(api_key=settings.GEMINI_API_KEY)

# response = client.models.generate_content(
#     model="gemini-2.5-flash", contents="Explain how AI works in a few words"
# )
# print(response.text)

# client = genai.Client(api_key=settings.GEMINI_API_KEY)

# result = client.models.embed_content(
#         model="gemini-embedding-001",
#         contents="What is the meaning of life?")

# [embedding] = result.embeddings

# print(embedding.values)

# print(settings.GEMINI_API_KEY)

# from app.model import get_chat_model

# chat_model = get_chat_model("gemini")

# print(chat_model.invoke("Devil May Cry"))

# from app.service import GeminiChatService

# gemini = GeminiChatService()

# from uuid import uuid4

# thread_id = "abc123"
# print(thread_id)

# gemini.chat("Hi. I am Somik", thread_id=thread_id)

# gemini.chat("What's my name?",thread_id=thread_id)

# thread_id2 = "abc234"
# print(thread_id2)

# gemini.chat("Hi. I am Dante", thread_id=thread_id2)

# gemini.chat("What's my name?",thread_id=thread_id2)

# gemini.chat("What's my name?",thread_id=thread_id)

# from app.util import get_mood, get_song, get_doctor

# print(get_mood(user_id=1, days=7))
# print(get_song(mood_category="calming"))
# print(get_doctor())

# from uuid import uuid4

# thread_id = str(uuid4())
# print(thread_id)

# from app.service import GeminiChatService
# gemini = GeminiChatService()
# app = gemini.app
# # # print(gemini.chat("Feeling Anxious", thread_id=thread_id, user_id=1, user_name="Somik"))
# from langchain_core.runnables.graph import MermaidDrawMethod

# png_bytes = app.get_graph().draw_mermaid_png(draw_method=MermaidDrawMethod.API)

# with open("graph.png", "wb") as f:
#     f.write(png_bytes)

# session_id = gemini.provide_session_to_user(1,"Somik")

# print(gemini.chat("Hi",user_id=1,session_id=session_id,user_name="Somik"))

# print(gemini.chat("I don't wanna die",user_id=1,session_id=session_id,user_name="Somik"))

# print(gemini.chat("I want to hurt myself",user_id=1,session_id=session_id,user_name="Somik"))
# # Save to a file

# from pymongo import MongoClient

# client = MongoClient("mongodb://mindigo:1234@localhost:27017/")

# db = client["mindigo_checkpoints"]
# db.create_collection("test_collection")
# print("Connected to MongoDB!")

from datetime import datetime
print(datetime.now().date().isoformat())