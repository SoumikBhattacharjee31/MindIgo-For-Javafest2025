from langchain.chat_models import init_chat_model
from langchain_core.language_models.chat_models import BaseChatModel
from app.config.settings import settings
from os import environ
from app.config.logger_config import get_logger
from langchain_google_genai import GoogleGenerativeAIEmbeddings

logger = get_logger(__name__)

environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY
environ["LANGSMITH_API_KEY"] = settings.LANGSMITH_API_KEY
environ["LANGSMITH_TRACING"] = "true"

def get_gemini_chat_model(
    model_name: str = "gemini-2.5-flash",
    temperature: float = 0,
    max_retries: int = 3,
) -> BaseChatModel:
    """Initialize and return a Gemini chat model."""
    logger.info(f"Initializing Gemini chat model: {model_name}")
    return init_chat_model(
        model=model_name,
        temperature=temperature,
        max_retries=max_retries,
        model_provider="google_genai",
    )
    
def get_gemini_embedding_model(model_name: str = "models/gemini-embedding-001") -> GoogleGenerativeAIEmbeddings:
    """Initialize and return a Gemini embedding model."""
    logger.info(f"Initializing Gemini embedding model: {model_name}")
    return GoogleGenerativeAIEmbeddings(model=model_name)