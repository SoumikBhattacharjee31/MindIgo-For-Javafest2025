from .gemini import get_gemini_chat_model
from langchain_core.language_models.chat_models import BaseChatModel

def get_chat_model(model_name: str, **kwargs) -> BaseChatModel:
    if model_name == "gemini":
        return get_gemini_chat_model(**kwargs)
    else:
        raise ValueError(f"Unsupported model: {model_name}")