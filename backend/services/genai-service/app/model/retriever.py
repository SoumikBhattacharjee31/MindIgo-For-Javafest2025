from typing import List
from app.db.chroma import get_chroma
from app.config.logger_config import get_logger

logger = get_logger(__name__)

class DocumentRetriever:
    def __init__(self):
        self.vector_store = get_chroma()
    
    def check_embeddings_exist(self, file_hash: str) -> bool:
        """Check if embeddings for this file already exist."""
        try:
            # Query with the file hash to see if documents exist
            results = self.vector_store.similarity_search(
                query="test", 
                k=1,
                filter={"file_hash": file_hash}
            )
            return len(results) > 0
        except Exception as e:
            logger.warning(f"Error checking embeddings: {e}")
            return False
    
    def add_documents(self, chunks: List[str], file_hash: str, file_path: str):
        """Add document chunks to vector store."""
        try:
            # Add metadata to each chunk
            metadatas = [
                {
                    "file_hash": file_hash,
                    "file_path": file_path,
                    "chunk_index": i
                } 
                for i in range(len(chunks))
            ]
            
            self.vector_store.add_texts(
                texts=chunks,
                metadatas=metadatas
            )
            logger.info(f"Added {len(chunks)} chunks to vector store")
            
        except Exception as e:
            logger.error(f"Error adding documents: {e}")
            raise
    
    def retrieve_relevant_docs(self, query: str, file_hash: str, k: int = 5) -> List[str]:
        """Retrieve relevant documents for a specific file."""
        try:
            results = self.vector_store.similarity_search(
                query=query,
                k=k,
                filter={"file_hash": file_hash}
            )
            return [doc.page_content for doc in results]
        except Exception as e:
            logger.error(f"Error retrieving documents: {e}")
            raise
