import re
import string
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
import nltk
from nltk.tokenize import sent_tokenize
from app.config.logger_config import get_logger

logger = get_logger(__name__)


class PreprocessingConfig(BaseModel):
    """Configuration for text preprocessing"""
    remove_extra_whitespace: bool = Field(True, description="Remove extra whitespace and normalize")
    remove_special_chars: bool = Field(True, description="Remove special characters except basic punctuation")
    remove_numbers: bool = Field(False, description="Remove all numbers")
    remove_urls: bool = Field(True, description="Remove URLs and web addresses")
    remove_emails: bool = Field(True, description="Remove email addresses")
    remove_mentions: bool = Field(True, description="Remove @mentions and #hashtags")
    preserve_sentence_punctuation: bool = Field(True, description="Keep sentence-ending punctuation")
    min_sentence_length: int = Field(5, ge=1, description="Minimum character length for sentences")
    max_sentence_length: int = Field(1000, ge=10, description="Maximum character length for sentences")
    
    @validator('max_sentence_length')
    def validate_max_length(cls, v, values):
        if 'min_sentence_length' in values and v <= values['min_sentence_length']:
            raise ValueError("max_sentence_length must be greater than min_sentence_length")
        return v


class PreprocessingResult(BaseModel):
    """Result of text preprocessing"""
    original_text: str = Field(..., description="Original input text")
    cleaned_text: str = Field(..., description="Text after cleaning")
    sentences: List[str] = Field(..., description="List of extracted sentences")
    sentence_count: int = Field(..., ge=0, description="Number of sentences found")
    characters_removed: int = Field(..., ge=0, description="Number of characters removed during cleaning")
    empty_sentences_filtered: int = Field(..., ge=0, description="Number of empty sentences filtered out")


def initialize_nltk_sent_tokenize() -> None:
    """Initialize NLTK sentence tokenizer data"""
    try:
        nltk.data.find('tokenizers/punkt')
        logger.info("NLTK sentence tokenizer data already available")
    except LookupError:
        logger.info("Downloading NLTK sentence tokenizer data...")
        try:
            nltk.download('punkt', quiet=True)
            nltk.download('punkt_tab', quiet=True)
            logger.info("NLTK sentence tokenizer data downloaded successfully!")
        except Exception as e:
            logger.error(f"Failed to download NLTK data: {str(e)}")
            raise


class ParagraphPreprocessor:
    """
    Advanced paragraph preprocessor that cleans text and splits into sentences.
    
    Features:
    - Removes unnecessary characters while preserving sentence structure
    - Configurable cleaning options
    - Splits paragraphs into clean sentences
    - Filters out invalid sentences
    - Detailed logging and result tracking
    """
    
    def __init__(self, config: Optional[PreprocessingConfig] = None):
        """
        Initialize the paragraph preprocessor.
        
        Args:
            config (PreprocessingConfig, optional): Preprocessing configuration
        """
        self.config = config or PreprocessingConfig()
        
        # Initialize NLTK
        initialize_nltk_sent_tokenize()
        
        # Define regex patterns for cleaning
        self._compile_patterns()
        
        logger.info("ParagraphPreprocessor initialized successfully")
        logger.debug(f"Configuration: {self.config.dict()}")
    
    def _compile_patterns(self) -> None:
        """Compile regex patterns for text cleaning"""
        self.patterns = {
            'urls': re.compile(
                r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
                r'|www\.(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
            ),
            'emails': re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
            'mentions': re.compile(r'[@#]\w+'),
            'numbers': re.compile(r'\b\d+\b'),
            'extra_whitespace': re.compile(r'\s+'),
            'special_chars': re.compile(r'[^\w\s.!?;:,\'\"-]'),  # Keep basic punctuation
            'multiple_punctuation': re.compile(r'([.!?]){2,}'),  # Multiple sentence endings
        }
        
        logger.debug("Regex patterns compiled successfully")
    
    def clean_text(self, text: str) -> str:
        """
        Clean the input text according to configuration.
        
        Args:
            text (str): Input text to clean
            
        Returns:
            str: Cleaned text
        """
        if not isinstance(text, str):
            logger.warning(f"Invalid input type: {type(text)}, converting to string")
            text = str(text)
        
        if not text.strip():
            logger.warning("Empty input text provided")
            return ""
        
        original_length = len(text)
        cleaned = text
        
        logger.debug(f"Starting text cleaning for {original_length} characters")
        
        # Remove URLs
        if self.config.remove_urls:
            cleaned = self.patterns['urls'].sub('', cleaned)
            logger.debug("URLs removed")
        
        # Remove emails
        if self.config.remove_emails:
            cleaned = self.patterns['emails'].sub('', cleaned)
            logger.debug("Emails removed")
        
        # Remove mentions and hashtags
        if self.config.remove_mentions:
            cleaned = self.patterns['mentions'].sub('', cleaned)
            logger.debug("Mentions and hashtags removed")
        
        # Remove numbers
        if self.config.remove_numbers:
            cleaned = self.patterns['numbers'].sub('', cleaned)
            logger.debug("Numbers removed")
        
        # Remove special characters
        if self.config.remove_special_chars:
            cleaned = self.patterns['special_chars'].sub('', cleaned)
            logger.debug("Special characters removed")
        
        # Clean up multiple punctuation
        cleaned = self.patterns['multiple_punctuation'].sub(r'\1', cleaned)
        
        # Remove extra whitespace
        if self.config.remove_extra_whitespace:
            cleaned = self.patterns['extra_whitespace'].sub(' ', cleaned)
            cleaned = cleaned.strip()
            logger.debug("Extra whitespace removed")
        
        characters_removed = original_length - len(cleaned)
        logger.debug(f"Text cleaning completed: {characters_removed} characters removed")
        
        return cleaned
    
    def split_into_sentences(self, text: str) -> List[str]:
        """
        Split cleaned text into sentences.
        
        Args:
            text (str): Cleaned text to split
            
        Returns:
            List[str]: List of sentences
        """
        if not text.strip():
            logger.warning("Empty text provided for sentence splitting")
            return []
        
        try:
            # Use NLTK's sentence tokenizer
            sentences = sent_tokenize(text)
            logger.debug(f"Initial sentence split produced {len(sentences)} sentences")
            
            # Clean and filter sentences
            cleaned_sentences = []
            empty_filtered = 0
            
            for sentence in sentences:
                # Clean individual sentence
                sentence = sentence.strip()
                
                # Skip empty sentences
                if not sentence:
                    empty_filtered += 1
                    continue
                
                # Apply length filters
                if len(sentence) < self.config.min_sentence_length:
                    empty_filtered += 1
                    logger.debug(f"Sentence too short ({len(sentence)} chars): '{sentence[:50]}...'")
                    continue
                
                if len(sentence) > self.config.max_sentence_length:
                    # Truncate long sentences
                    sentence = sentence[:self.config.max_sentence_length].strip()
                    logger.debug(f"Sentence truncated to {self.config.max_sentence_length} characters")
                
                cleaned_sentences.append(sentence)
            
            logger.info(f"Sentence splitting completed: {len(cleaned_sentences)} valid sentences, {empty_filtered} filtered out")
            return cleaned_sentences
            
        except Exception as e:
            logger.error(f"Error in sentence splitting: {str(e)}")
            # Fallback: simple split on sentence endings
            fallback_sentences = re.split(r'[.!?]+', text)
            fallback_sentences = [s.strip() for s in fallback_sentences if s.strip()]
            logger.warning(f"Using fallback sentence splitting: {len(fallback_sentences)} sentences")
            return fallback_sentences
    
    def process_paragraph(self, paragraph: str) -> PreprocessingResult:
        """
        Process a paragraph: clean text and split into sentences.
        
        Args:
            paragraph (str): Input paragraph to process
            
        Returns:
            PreprocessingResult: Complete processing result
        """
        logger.info("Starting paragraph processing")
        
        if not isinstance(paragraph, str):
            logger.warning(f"Invalid input type: {type(paragraph)}")
            paragraph = str(paragraph)
        
        original_text = paragraph
        original_length = len(original_text)
        
        # Clean the text
        cleaned_text = self.clean_text(paragraph)
        characters_removed = original_length - len(cleaned_text)
        
        # Split into sentences
        sentences = self.split_into_sentences(cleaned_text)
        empty_sentences_filtered = 0  # This is calculated in split_into_sentences
        
        # Create result
        result = PreprocessingResult(
            original_text=original_text,
            cleaned_text=cleaned_text,
            sentences=sentences,
            sentence_count=len(sentences),
            characters_removed=characters_removed,
            empty_sentences_filtered=empty_sentences_filtered
        )
        
        logger.info(
            f"Paragraph processing completed: {result.sentence_count} sentences extracted, "
            f"{result.characters_removed} characters removed"
        )
        
        return result
    
    def process_multiple_paragraphs(self, paragraphs: List[str]) -> List[PreprocessingResult]:
        """
        Process multiple paragraphs.
        
        Args:
            paragraphs (List[str]): List of paragraphs to process
            
        Returns:
            List[PreprocessingResult]: List of processing results
        """
        logger.info(f"Starting batch processing for {len(paragraphs)} paragraphs")
        
        results = []
        for i, paragraph in enumerate(paragraphs):
            try:
                result = self.process_paragraph(paragraph)
                results.append(result)
                logger.debug(f"Batch processing {i+1}/{len(paragraphs)} completed")
            except Exception as e:
                logger.error(f"Error processing paragraph {i}: {str(e)}")
                # Create error result
                error_result = PreprocessingResult(
                    original_text=str(paragraph),
                    cleaned_text="",
                    sentences=[],
                    sentence_count=0,
                    characters_removed=0,
                    empty_sentences_filtered=0
                )
                results.append(error_result)
        
        logger.info(f"Batch processing completed: {len(results)} results")
        return results
    
    def get_sentences_only(self, paragraph: str) -> List[str]:
        """
        Convenience method to get only the list of sentences.
        
        Args:
            paragraph (str): Input paragraph
            
        Returns:
            List[str]: List of cleaned sentences
        """
        result = self.process_paragraph(paragraph)
        return result.sentences
    
    def update_config(self, **kwargs) -> None:
        """
        Update preprocessing configuration.
        
        Args:
            **kwargs: Configuration parameters to update
        """
        try:
            # Create new config with updated values
            config_dict = self.config.dict()
            config_dict.update(kwargs)
            self.config = PreprocessingConfig(**config_dict)
            
            logger.info(f"Configuration updated: {kwargs}")
            
        except Exception as e:
            logger.error(f"Error updating configuration: {str(e)}")
            raise ValueError(f"Invalid configuration update: {str(e)}")
    
    def get_config(self) -> Dict[str, Any]:
        """Get current configuration"""
        return self.config.dict()


# Convenience functions for quick usage
def clean_paragraph_to_sentences(
    paragraph: str, 
    config: Optional[PreprocessingConfig] = None
) -> List[str]:
    """
    Quick function to clean a paragraph and return sentences.
    
    Args:
        paragraph (str): Input paragraph
        config (PreprocessingConfig, optional): Custom configuration
        
    Returns:
        List[str]: List of cleaned sentences
    """
    preprocessor = ParagraphPreprocessor(config)
    return preprocessor.get_sentences_only(paragraph)


def batch_clean_paragraphs_to_sentences(
    paragraphs: List[str],
    config: Optional[PreprocessingConfig] = None
) -> List[List[str]]:
    """
    Quick function to process multiple paragraphs and return lists of sentences.
    
    Args:
        paragraphs (List[str]): List of input paragraphs
        config (PreprocessingConfig, optional): Custom configuration
        
    Returns:
        List[List[str]]: List of sentence lists for each paragraph
    """
    preprocessor = ParagraphPreprocessor(config)
    results = preprocessor.process_multiple_paragraphs(paragraphs)
    return [result.sentences for result in results]