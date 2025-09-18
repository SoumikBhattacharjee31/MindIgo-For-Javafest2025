import hashlib
import os
from typing import List, Tuple, Optional
import PyPDF2
import requests
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.config.logger_config import get_logger
from app.db.postgres import get_postgres_connection

logger = get_logger(__name__)

class PDFProcessor:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        self.downloads_dir = "downloads"
        os.makedirs(self.downloads_dir, exist_ok=True)
    
    def check_file_exists_in_db(self, file_url: str) -> Optional[int]:
        """Check if file URL already exists in database and return file_id."""
        try:
            conn = get_postgres_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT file_id FROM FILE_TABLE WHERE link = %s", (file_url,))
            result = cursor.fetchone()
            cursor.close()
            return result[0] if result else None
        except Exception as e:
            logger.error(f"Error checking file in DB: {e}")
            return None
    
    def store_file_in_db(self, file_url: str, local_path: str) -> int:
        """Store file URL in database and return file_id."""
        try:
            conn = get_postgres_connection()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO FILE_TABLE (link, local_path) VALUES (%s, %s) RETURNING file_id", 
                         (file_url, local_path))
            file_id = cursor.fetchone()[0]
            conn.commit()
            cursor.close()
            logger.info(f"File stored in DB with ID: {file_id}")
            return file_id
        except Exception as e:
            logger.error(f"Error storing file in DB: {e}")
            conn.rollback()
            raise
    
    def get_local_path_from_db(self, file_id: int) -> str:
        """Get local file path from database using file_id."""
        try:
            conn = get_postgres_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT local_path FROM FILE_TABLE WHERE file_id = %s", (file_id,))
            result = cursor.fetchone()
            cursor.close()
            if result:
                return result[0]
            else:
                raise ValueError(f"File ID {file_id} not found in database")
        except Exception as e:
            logger.error(f"Error getting local path from DB: {e}")
            raise
    
    def download_and_store_file(self, file_url: str) -> Tuple[int, str]:
        """Download file from URL, store locally and in DB. Returns (file_id, local_path)."""
        try:
            # Check if already exists
            existing_file_id = self.check_file_exists_in_db(file_url)
            if existing_file_id:
                local_path = self.get_local_path_from_db(existing_file_id)
                if os.path.exists(local_path):
                    logger.info(f"File already exists with ID: {existing_file_id}")
                    return existing_file_id, local_path
            
            # Download the file
            logger.info(f"Downloading file from: {file_url}")
            response = requests.get(file_url, timeout=30)
            response.raise_for_status()
            
            # Create local filename
            file_hash = hashlib.md5(file_url.encode()).hexdigest()
            local_path = os.path.join(self.downloads_dir, f"{file_hash}.pdf")
            
            # Save file locally
            with open(local_path, 'wb') as f:
                f.write(response.content)
            
            # Store in database
            file_id = self.store_file_in_db(file_url, local_path)
            
            logger.info(f"File downloaded and stored with ID: {file_id}")
            return file_id, local_path
            
        except Exception as e:
            logger.error(f"Error downloading file from {file_url}: {e}")
            raise
    
    def get_file_hash(self, file_path: str) -> str:
        """Generate a hash for the file to track embeddings."""
        if file_path.startswith('http'):
            return hashlib.md5(file_path.encode()).hexdigest()
        else:
            with open(file_path, 'rb') as f:
                content = f.read()
                return hashlib.md5(content).hexdigest()
    
    def load_pdf_from_file(self, file_path: str) -> str:
        """Load PDF from local file."""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            logger.error(f"Error loading PDF from file {file_path}: {e}")
            raise
    
    def process_file(self, file_url: str) -> Tuple[int, str, List[str], str]:
        """Main method: Download file, process PDF, return file_id, content, chunks, and hash."""
        try:
            # Download and store file
            file_id, local_path = self.download_and_store_file(file_url)
            
            # Load PDF content
            content = self.load_pdf_from_file(local_path)
            
            # Generate chunks
            chunks = self.text_splitter.split_text(content)
            
            # Generate hash
            file_hash = self.get_file_hash(local_path)
            
            logger.info(f"Processed PDF: {len(chunks)} chunks created for file_id: {file_id}")
            return file_id, content, chunks, file_hash
            
        except Exception as e:
            logger.error(f"Error processing file {file_url}: {e}")
            raise
    
    # Legacy method for backward compatibility with generator graph
    def load_and_process_pdf(self, file_path: str) -> Tuple[str, List[str], str]:
        """Legacy method: Load PDF and return content, chunks, and file hash."""
        try:
            content = self.load_pdf_from_file(file_path)
            chunks = self.text_splitter.split_text(content)
            file_hash = self.get_file_hash(file_path)
            
            logger.info(f"Processed PDF: {len(chunks)} chunks created")
            return content, chunks, file_hash
            
        except Exception as e:
            logger.error(f"Error processing PDF {file_path}: {e}")
            raise
