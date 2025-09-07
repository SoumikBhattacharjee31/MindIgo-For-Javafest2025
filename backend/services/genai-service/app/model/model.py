from .gemini import get_gemini_chat_model
from langchain_core.language_models.chat_models import BaseChatModel

def get_chat_model(base_model: str, **kwargs) -> BaseChatModel:
    if base_model == "gemini":
        return get_gemini_chat_model(**kwargs)
    else:
        raise ValueError(f"Unsupported model: {base_model}")