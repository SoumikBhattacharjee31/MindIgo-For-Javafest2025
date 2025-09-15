from langchain_chroma import Chroma
from app.model.gemini import get_gemini_embedding_model
from app.config.logger_config import get_logger

logger = get_logger(__name__)
_vector_store = None

def get_chroma() -> Chroma:
    """Get database instance (singleton pattern)."""
    global _vector_store
    if _vector_store is None:
        import os
        dirname = os.path.dirname(__file__)
        
        embeddings = get_gemini_embedding_model()
        _vector_store = Chroma(
            collection_name="mindigo_collection",
            embedding_function=embeddings,
            persist_directory=os.path.join(dirname, "chroma_langchain_db"),  # Where to save data locally, remove if not necessary
        )
        logger.info("Initialized new Chroma vector store")
    return _vector_store