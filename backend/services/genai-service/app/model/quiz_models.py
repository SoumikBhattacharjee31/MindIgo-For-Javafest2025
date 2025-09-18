from typing import List, Literal, Optional, Dict
from pydantic import BaseModel, Field

class Quiz(BaseModel):
    question: str
    type: Literal["descriptive", "mcq", "scale"]
    options: Optional[List[str]] = None
    scale_min: Optional[int] = None 
    scale_max: Optional[int] = None
    scale_labels: Optional[Dict[int, str]] = None  # e.g., {1: "Never", 5: "Always"}
    
    class Config:
        extra = "forbid"

class MentalHealthRequest(BaseModel):
    file_path: str
    num_questions: int = 10
    question_types: List[Literal["descriptive", "mcq", "scale"]] = ["scale", "descriptive"]
    assessment_areas: List[str] = ["mood", "anxiety", "stress", "wellbeing", "social_functioning"]
    
class MentalHealthEvaluationRequest(BaseModel):
    quiz: List[Quiz]
    answers: List[str]
    file_path: str
    user_demographics: Optional[Dict[str, str]] = None  # age, gender, etc.

class MentalHealthIndicator(BaseModel):
    dimension: str  # e.g., "Depression Risk", "Anxiety Level", "Stress Level"
    level: Literal["low", "mild", "moderate", "high", "severe"]
    confidence: float  # 0-1 scale
    description: str
    contributing_factors: List[str]

class MentalHealthAnalysis(BaseModel):
    overall_assessment: str
    indicators: List[MentalHealthIndicator]
    recommendations: List[str]
    professional_consultation_advised: bool
    risk_factors: List[str]
    protective_factors: List[str]
    detailed_analysis: str

class MentalHealthEvaluationResult(BaseModel):
    question: str
    user_answer: str
    psychological_interpretation: str
    mental_health_indicators: List[str]
    analysis: MentalHealthAnalysis

# Keep original models for backward compatibility
# Mood analysis models (define first)
class MoodIndicator(BaseModel):
    dimension: str  # e.g., "Anxiety Level", "Depression Risk", "Stress Level", "Overall Wellbeing"
    level: Literal["very_low", "low", "mild", "moderate", "high", "very_high"]
    confidence: float  # 0-1 scale
    description: str
    contributing_factors: List[str]

class MoodAnalysis(BaseModel):
    overall_mood_state: str  # General description of mood state
    mood_indicators: List[MoodIndicator]
    dominant_emotions: List[str]  # e.g., ["anxiety", "stress", "sadness"]
    mood_stability: Literal["stable", "fluctuating", "unstable"]
    risk_level: Literal["low", "moderate", "high", "critical"]
    recommendations: List[str]
    professional_help_suggested: bool
    detailed_interpretation: str

# Simplified interface models
class GenerateQuizRequest(BaseModel):
    file_url: str
    num_questions: int = 5
    question_types: List[Literal["descriptive", "mcq", "scale"]] = ["mcq", "descriptive"]
    assessment_areas: List[str] = ["mood", "anxiety", "stress", "wellbeing", "social_functioning"]
    difficulty: Literal["easy", "medium", "hard"] = "medium"

class GenerateQuizResponse(BaseModel):
    file_id: int
    quizzes: List[Quiz]

class EvaluateMoodRequest(BaseModel):
    file_id: int
    quizzes: List[Quiz]
    answers: List[str]

class EvaluateMoodResponse(BaseModel):
    file_id: int
    mood_analysis: MoodAnalysis
    total_questions: int
    assessment_reliability: Literal["low", "medium", "high"]

# Keep original models for backward compatibility

class QuizEvaluationResult(BaseModel):
    """Changed from correctness evaluation to mood classification"""
    total_questions: int
    mood_analysis: MoodAnalysis
    individual_responses: List[str]  # Store the actual responses
    assessment_reliability: Literal["low", "medium", "high"]  # Based on number of questions
    
    class Config:
        extra = "forbid"

# Legacy models for backward compatibility with graph system
class QuizRequest(BaseModel):
    file_path: str
    num_questions: int = 5
    question_types: List[Literal["descriptive", "mcq"]] = ["mcq", "descriptive"]
    difficulty: Literal["easy", "medium", "hard"] = "medium"

class QuizEvaluationRequest(BaseModel):
    file_path: str
    quiz: List[Quiz]
    answers: List[str]

class GraphState(BaseModel):
    file_path: str
    file_content: Optional[str] = None
    chunks: Optional[List[str]] = None
    file_hash: Optional[str] = None
    embeddings_exist: bool = False
    retrieved_docs: Optional[List[str]] = None
    quiz: Optional[List[Quiz]] = None
    quiz_request: Optional[QuizRequest] = None
    mental_health_request: Optional[MentalHealthRequest] = None
    evaluation_request: Optional[QuizEvaluationRequest] = None
    mental_health_evaluation_request: Optional[MentalHealthEvaluationRequest] = None
    evaluation_results: Optional[List[QuizEvaluationResult]] = None
    mental_health_results: Optional[List[MentalHealthEvaluationResult]] = None
    error: Optional[str] = None
