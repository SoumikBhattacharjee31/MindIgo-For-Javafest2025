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


def close_chroma():
    """Close Chroma vector store connection."""
    global _vector_store
    if _vector_store is not None:
        try:
            # Chroma doesn't have an explicit close method, but we can reset the instance
            # This allows proper cleanup on application shutdown
            _vector_store = None
            logger.info("Chroma vector store closed.")
        except Exception as e:
            logger.error(f"Error closing Chroma vector store: {e}")


def initialize_chroma():
    """Initialize Chroma vector store."""
    try:
        get_chroma()
        logger.info("Chroma vector store initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing Chroma vector store: {e}")
        raise