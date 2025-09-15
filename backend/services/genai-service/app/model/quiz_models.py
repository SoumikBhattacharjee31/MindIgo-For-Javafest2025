from typing import List, Literal, Optional, Dict
from pydantic import BaseModel, Field

class Quiz(BaseModel):
    question: str
    type: Literal["descriptive", "mcq", "scale"]
    options: Optional[List[str]] = None
    scale_min: Optional[int] = None  # For Likert scale questions
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
class QuizRequest(BaseModel):
    file_path: str
    num_questions: int = 5
    question_types: List[Literal["descriptive", "mcq"]] = ["mcq", "descriptive"]
    difficulty: Literal["easy", "medium", "hard"] = "medium"

class QuizEvaluationRequest(BaseModel):
    quiz: List[Quiz]
    answers: List[str]
    file_path: str

class QuizEvaluationResult(BaseModel):
    question: str
    user_answer: str
    correct_answer: str
    is_correct: bool
    explanation: str
    score: float  # 0-1 scale

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
