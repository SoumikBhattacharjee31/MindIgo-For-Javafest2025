# app/config/settings.py
from pydantic_settings import BaseSettings
from app.config.logger_config import get_logger

logger = get_logger(__name__)

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    GENAI_SERVICE_PORT: int = 8100
    APP_NAME: str = "genai-service"
    EUREKA_SERVER_URL: str = "http://localhost:8761/eureka"
    EUREKA_HOSTNAME: str = "localhost"
    EUREKA_SERVER_PORT: int = 8761
    LANGSMITH_API_KEY: str = ""
    MONGO_URI: str = "mongodb://mindigo:1234@localhost:27017/"
    HEALTH_CHECK_INTERVAL: int = 30  # seconds
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "Mindigo"
    DB_USERNAME: str = "mindigo"
    DB_PASSWORD: str = "1234"
    ELEVENLABS_API_KEY: str
    ELEVENLABS_BASE_URL: str ="https://api.elevenlabs.io"
    ELEVENLABS_MODEL_ID: str ="eleven_multilingual_v2"
    ELEVENLABS_VOICE_FILENAME: str="voices.json"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

def load_remote_config_with_requests():
    logger.info("Loading remote configuration...")
    return Settings()  # 👈 cleaner, Pydantic handles env vars & defaults

settings = load_remote_config_with_requests()
