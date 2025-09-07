#/app/config/settings.py
import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    SERVER_PORT: int = 8000
    CONFIG_SERVER_URL: str="http://localhost:8888"
    APP_NAME: str="genai-service"
    EUREKA_SERVER_URL: str="http://localhost:8761/eureka/"
    EUREKA_HOSTNAME: str ="localhost"
    EUREKA_SERVER_PORT: int = 8761
    CONTAINER_MODE: bool = os.getenv("CONTAINER_MODE", "false").lower() == "true"
    LANGSMITH_API_KEY: str

def load_remote_config_with_requests():
    return Settings(
        OPENAI_API_KEY=os.getenv("OPENAI_API_KEY", ""),
        GEMINI_API_KEY=os.getenv("GEMINI_API_KEY", ""),
        SERVER_PORT=int(os.getenv("SERVER_PORT", 8000)),
        CONFIG_SERVER_URL=os.getenv("CONFIG_SERVER_URL", "http://localhost:8888"),
        APP_NAME=os.getenv("APP_NAME", "genai-service"),
        EUREKA_SERVER_URL=os.getenv("EUREKA_SERVER_URL", "http://localhost:8761/eureka/"),
        EUREKA_HOSTNAME=os.getenv("EUREKA_HOSTNAME", "localhost"),
        EUREKA_SERVER_PORT=int(os.getenv("EUREKA_SERVER_PORT", 8761)),
        LANGSMITH_API_KEY=os.getenv("LANGSMITH_API_KEY",""),
    )

settings = load_remote_config_with_requests()