from app.model.gemini import get_gemini_chat_model
from langchain_core.language_models.chat_models import BaseChatModel

def get_chat_model(base_model: str, **kwargs) -> BaseChatModel:
    if base_model == "gemini":
        return get_gemini_chat_model(**kwargs)
    else:
        raise ValueError(f"Unsupported model: {base_model}")
    
def get_gemini_model(model_type: str = "lite", **kwargs) -> BaseChatModel:
    model_names = {
        "lite": "gemini-1.5-flash-lite",      
        "flash_lite": "gemini-2.0-flash-lite", 
        "flash": "gemini-2.5-flash-lite",          
        "flash_pro": "gemini-2.5-flash"        
    }
    model_name = model_names.get(model_type)
    if not model_name:
        raise ValueError(f"Unsupported Gemini model type: {model_type}")
    return get_gemini_chat_model(model_name=model_name, **kwargs)