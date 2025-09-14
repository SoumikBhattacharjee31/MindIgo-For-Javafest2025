import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
import string
import re
import joblib
import os
from collections import Counter
from typing import List, Dict, Optional, Any
import numpy as np
from pydantic import BaseModel, Field, validator

from app.config.logger_config import get_logger

logger = get_logger(__name__)


class PredictionResult(BaseModel):
    """Pydantic model for prediction results"""
    sentence: str = Field(..., description="Original input sentence")
    predicted_label: int = Field(..., ge=0, le=3, description="Predicted label (0-3)")
    predicted_category: str = Field(..., description="Predicted category name")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Prediction confidence score")
    consensus: bool = Field(..., description="Whether all preprocessing methods agreed")
    message: Optional[str] = Field(None, description="Additional information or warnings")
    
    @validator('predicted_category')
    def validate_category(cls, v):
        valid_categories = {'normal', 'greet', 'language', 'kill'}
        if v not in valid_categories:
            raise ValueError(f"Category must be one of {valid_categories}")
        return v


class DetailedPredictionResult(PredictionResult):
    """Extended prediction result with detailed information"""
    processed_versions: List[str] = Field(..., description="All processed text versions")
    all_predictions: List[int] = Field(..., description="Predictions from all preprocessing methods")
    all_confidences: List[float] = Field(..., description="Confidence scores from all methods")
    prediction_votes: Dict[int, int] = Field(..., description="Vote count for each prediction")


class ModelInfo(BaseModel):
    """Model information"""
    model_path: str = Field(..., description="Path to the model file")
    model_type: str = Field(..., description="Type of the ML model")
    categories: Dict[int, str] = Field(..., description="Label mapping")
    preprocessing_strategies: List[str] = Field(..., description="Available preprocessing strategies")


def initialize_nltk() -> None:
    """Initialize NLTK data with proper logging"""
    try:
        nltk.data.find('tokenizers/punkt')
        nltk.data.find('corpora/stopwords')
        nltk.data.find('corpora/wordnet')
        logger.info("NLTK data already available")
    except LookupError:
        logger.info("Downloading required NLTK data...")
        try:
            nltk.download('punkt', quiet=True)
            nltk.download('punkt_tab', quiet=True)
            nltk.download('stopwords', quiet=True)
            nltk.download('wordnet', quiet=True)
            logger.info("NLTK data downloaded successfully!")
        except Exception as e:
            logger.error(f"Failed to download NLTK data: {str(e)}")
            raise


class AdvancedTextPreprocessor:
    """Advanced text preprocessing with multiple strategies"""
    
    def __init__(self):
        try:
            self.lemmatizer = WordNetLemmatizer()
            self.stop_words = set(stopwords.words('english'))
            logger.info("Text preprocessor initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize text preprocessor: {str(e)}")
            raise
        
    def basic_clean(self, text: str) -> str:
        """Basic cleaning: lowercase, remove punctuation"""
        if not isinstance(text, str):
            logger.warning(f"Invalid input type for basic_clean: {type(text)}")
            text = str(text)
            
        text = text.lower()
        text = text.translate(str.maketrans('', '', string.punctuation))
        cleaned = ' '.join(text.split())
        
        logger.debug(f"Basic clean: '{text[:50]}...' -> '{cleaned[:50]}...'")
        return cleaned
    
    def advanced_clean(self, text: str) -> str:
        """Advanced cleaning with lemmatization"""
        try:
            text = self.basic_clean(text)
            tokens = word_tokenize(text, language='english')
            tokens = [
                self.lemmatizer.lemmatize(token) 
                for token in tokens 
                if token not in self.stop_words and len(token) > 2
            ]
            result = ' '.join(tokens)
            logger.debug(f"Advanced clean resulted in {len(tokens)} tokens")
            return result
        except Exception as e:
            logger.warning(f"Advanced cleaning failed, falling back to basic clean: {str(e)}")
            return self.basic_clean(text)
    
    def preserve_important_words(self, text: str) -> str:
        """Preserve potentially important words for classification"""
        try:
            text = text.lower()
            text = re.sub(r'[^a-zA-Z\s]', '', text)
            tokens = word_tokenize(text, language='english')
            tokens = [
                self.lemmatizer.lemmatize(token) 
                for token in tokens 
                if len(token) > 1
            ]
            result = ' '.join(tokens)
            logger.debug(f"Preserve important words resulted in {len(tokens)} tokens")
            return result
        except Exception as e:
            logger.warning(f"Preserve important words failed, falling back to basic clean: {str(e)}")
            return self.basic_clean(text)


class TextClassifierPredictor:
    """Advanced text classifier with multiple preprocessing strategies and confidence estimation"""
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the predictor with a saved model.
        
        Args:
            model_path (str, optional): Path to the saved model file
        """
        dirname = os.path.dirname(__file__)
        self.model_path = model_path or os.path.join(dirname, './pretrained/ultimate_text_classifier.joblib')
        self.model = None
        self.preprocessor = None
        self.label_names = {0: 'normal', 1: 'greet', 2: 'language', 3: 'kill'}
        
        logger.info(f"Initializing TextClassifierPredictor with model path: {self.model_path}")
        
        # Initialize NLTK and preprocessor
        initialize_nltk()
        self.preprocessor = AdvancedTextPreprocessor()
        
        # Load the model
        self._load_model()
        
        logger.info("TextClassifierPredictor initialized successfully")
    
    def _load_model(self) -> None:
        """Load the trained model from disk"""
        if not os.path.exists(self.model_path):
            error_msg = f"Model file '{self.model_path}' not found!"
            logger.error(error_msg)
            raise FileNotFoundError(error_msg)
        
        try:
            self.model = joblib.load(self.model_path)
            logger.info(f"Model loaded successfully from '{self.model_path}'")
            logger.info(f"Model type: {type(self.model).__name__}")
        except Exception as e:
            error_msg = f"Error loading model: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
    
    def predict_with_confidence(self, sentence: str, return_details: bool = False) -> Dict[str, Any]:
        """
        Predict the category of a sentence with confidence estimation.
        
        Args:
            sentence (str): Input sentence to classify
            return_details (bool): Whether to return detailed prediction info
            
        Returns:
            dict: Prediction results with confidence and category
        """
        logger.debug(f"Predicting category for sentence: '{sentence[:100]}...'")
        
        if not sentence or not sentence.strip():
            logger.warning("Empty input sentence provided")
            result = PredictionResult(
                sentence=sentence,
                predicted_label=0,
                predicted_category='normal',
                confidence=0.0,
                consensus=False,
                message='Empty input - defaulted to normal'
            )
            return result.dict()
        
        # Preprocess sentence using multiple strategies
        processed_versions = []
        original_sentence = sentence
        
        try:
            basic_processed = self.preprocessor.basic_clean(sentence)
            advanced_processed = self.preprocessor.advanced_clean(sentence)
            preserved_processed = self.preprocessor.preserve_important_words(sentence)
            
            # Only use non-empty processed versions
            for processed in [basic_processed, advanced_processed, preserved_processed]:
                if processed and processed.strip():
                    processed_versions.append(processed)
            
            logger.debug(f"Generated {len(processed_versions)} processed versions")
            
        except Exception as e:
            logger.error(f"Error in preprocessing: {str(e)}")
            processed_versions = [sentence.lower()]  # Fallback
        
        if not processed_versions:
            logger.warning("Could not process input sentence")
            result = PredictionResult(
                sentence=original_sentence,
                predicted_label=0,
                predicted_category='normal',
                confidence=0.0,
                consensus=False,
                message='Could not process input - defaulted to normal'
            )
            return result.dict()
        
        # Get predictions from all preprocessing versions
        predictions = []
        confidences = []
        
        for i, processed in enumerate(processed_versions):
            try:
                pred = self.model.predict([processed])[0]
                predictions.append(pred)
                
                # Try to get confidence score
                confidence = self._get_confidence(processed)
                confidences.append(confidence)
                
                logger.debug(f"Preprocessing method {i}: prediction={pred}, confidence={confidence:.3f}")
                
            except Exception as e:
                logger.warning(f"Error in prediction for processed text {i}: {str(e)}")
                continue
        
        if not predictions:
            logger.error("All prediction attempts failed")
            result = PredictionResult(
                sentence=original_sentence,
                predicted_label=0,
                predicted_category='normal',
                confidence=0.0,
                consensus=False,
                message='Prediction failed - defaulted to normal'
            )
            return result.dict()
        
        # Use majority vote for final prediction
        prediction_counts = Counter(predictions)
        final_prediction = prediction_counts.most_common(1)[0][0]
        consensus = len(set(predictions)) == 1
        avg_confidence = np.mean(confidences) if confidences else 0.5
        
        # Adjust confidence based on consensus
        if consensus:
            final_confidence = avg_confidence
        else:
            # Reduce confidence if there's no consensus
            final_confidence = avg_confidence * 0.8
        
        logger.info(
            f"Final prediction: {final_prediction} ({self.label_names[final_prediction]}) "
            f"with confidence {final_confidence:.3f}, consensus: {consensus}"
        )
        
        # Create result based on return_details flag
        if return_details:
            result = DetailedPredictionResult(
                sentence=original_sentence,
                predicted_label=int(final_prediction),
                predicted_category=self.label_names[final_prediction],
                confidence=float(final_confidence),
                consensus=consensus,
                processed_versions=processed_versions,
                all_predictions=predictions,
                all_confidences=confidences,
                prediction_votes=dict(prediction_counts)
            )
        else:
            result = PredictionResult(
                sentence=original_sentence,
                predicted_label=int(final_prediction),
                predicted_category=self.label_names[final_prediction],
                confidence=float(final_confidence),
                consensus=consensus
            )
        
        return result.dict()
    
    def _get_confidence(self, processed_text: str) -> float:
        """Get confidence score for a prediction"""
        try:
            if hasattr(self.model, 'predict_proba'):
                proba = self.model.predict_proba([processed_text])[0]
                confidence = float(np.max(proba))
                logger.debug(f"Using predict_proba: confidence={confidence:.3f}")
                return confidence
            elif hasattr(self.model, 'decision_function'):
                decision = self.model.decision_function([processed_text])
                if decision.ndim > 1:
                    score = np.max(np.abs(decision[0]))
                else:
                    score = np.abs(decision[0])  # Changed to handle binary case properly
                confidence = 1 / (1 + np.exp(-score))  # Normalize using sigmoid
                logger.debug(f"Using decision_function: raw_score={score:.3f}, confidence={confidence:.3f}")
                return confidence
            else:
                logger.debug("Using default confidence for models without probability")
                return 0.75  # Default confidence for models without probability
        except Exception as e:
            logger.warning(f"Error getting confidence: {str(e)}")
            return 0.5  # Fallback confidence
    
    def predict_batch(self, sentences: List[str]) -> List[Dict[str, Any]]:
        """Predict categories for multiple sentences"""
        logger.info(f"Starting batch prediction for {len(sentences)} sentences")
        
        results = []
        for i, sentence in enumerate(sentences):
            try:
                result = self.predict_with_confidence(sentence)
                results.append(result)
                logger.debug(f"Batch prediction {i+1}/{len(sentences)} completed")
            except Exception as e:
                logger.error(f"Error in batch prediction for sentence {i}: {str(e)}")
                # Add error result
                error_result = PredictionResult(
                    sentence=sentence,
                    predicted_label=0,
                    predicted_category='normal',
                    confidence=0.0,
                    consensus=False,
                    message=f'Error in prediction: {str(e)}'
                )
                results.append(error_result.dict())
        
        logger.info(f"Batch prediction completed: {len(results)} results")
        return results
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        info = ModelInfo(
            model_path=self.model_path,
            model_type=type(self.model).__name__ if self.model else "Unknown",
            categories=self.label_names,
            preprocessing_strategies=['basic_clean', 'advanced_clean', 'preserve_important_words']
        )
        
        logger.info(f"Model info requested: {info.model_type}")
        return info.dict()