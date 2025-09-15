import hashlib
import os
from typing import List, Tuple
import PyPDF2
import requests
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.config.logger_config import get_logger

logger = get_logger(__name__)

class PDFProcessor:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
    
    def get_file_hash(self, file_path: str) -> str:
        """Generate a hash for the file to track embeddings."""
        if file_path.startswith('http'):
            return hashlib.md5(file_path.encode()).hexdigest()
        else:
            with open(file_path, 'rb') as f:
                content = f.read()
                return hashlib.md5(content).hexdigest()
    
    def load_pdf_from_url(self, url: str) -> str:
        """Load PDF from URL."""
        try:
            response = requests.get(url)
            response.raise_for_status()
            
            temp_path = f"temp_{hashlib.md5(url.encode()).hexdigest()}.pdf"
            with open(temp_path, 'wb') as f:
                f.write(response.content)
            
            content = self.load_pdf_from_file(temp_path)
            
            os.remove(temp_path)
            return content
            
        except Exception as e:
            logger.error(f"Error loading PDF from URL {url}: {e}")
            raise
    
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
    
    def load_and_process_pdf(self, file_path: str) -> Tuple[str, List[str], str]:
        """Load PDF and return content, chunks, and file hash."""
        try:
            if file_path.startswith('http'):
                content = self.load_pdf_from_url(file_path)
            else:
                content = self.load_pdf_from_file(file_path)
            
            file_hash = self.get_file_hash(file_path)
            
            chunks = self.text_splitter.split_text(content)
            
            logger.info(f"Processed PDF: {len(chunks)} chunks created")
            return content, chunks, file_hash
            
        except Exception as e:
            logger.error(f"Error processing PDF {file_path}: {e}")
            raise
