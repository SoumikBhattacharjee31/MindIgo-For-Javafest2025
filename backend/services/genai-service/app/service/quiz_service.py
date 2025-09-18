from typing import List
from app.model.quiz_models import (
    Quiz, GenerateQuizRequest, GenerateQuizResponse, EvaluateMoodRequest, EvaluateMoodResponse,
    MentalHealthRequest, MentalHealthEvaluationRequest, MoodAnalysis, MoodIndicator
)
from app.model.pdf_processor import PDFProcessor
from app.model.generator_graph import QuizGeneratorGraph
from app.model.evaluator_graph import QuizEvaluatorGraph
from app.config.logger_config import get_logger
import os

logger = get_logger(__name__)

class QuizService:
    def __init__(self):
        self.pdf_processor = PDFProcessor()
        self.generator = QuizGeneratorGraph()
        self.evaluator = QuizEvaluatorGraph()
    
    def get_or_create_file(self, file_url: str) -> int:
        """
        Check if file exists in DB, download if not, return file_id.
        """
        try:
            logger.info(f"Processing file URL: {file_url}")
            
            existing_file_id = self.pdf_processor.check_file_exists_in_db(file_url)
            if existing_file_id:
                # Verify local file still exists
                local_path = self.pdf_processor.get_local_path_from_db(existing_file_id)
                if os.path.exists(local_path):
                    logger.info(f"File already exists with ID: {existing_file_id}")
                    return existing_file_id
            
            # Download and store file
            file_id, local_path = self.pdf_processor.download_and_store_file(file_url)
            logger.info(f"File downloaded and stored with ID: {file_id}")
            return file_id
            
        except Exception as e:
            logger.error(f"File processing failed: {e}")
            raise
    
    def generate_quiz(self, request: GenerateQuizRequest) -> GenerateQuizResponse:
        """
        Generate quiz using file_id, questions config, and assessment areas.
        Uses generator graph which automatically handles embeddings.
        """
        try:
            logger.info(f"Generating quiz for URL: {request.file_url}")
            
            file_id = self.get_or_create_file(request.file_url)
            
            local_path = self.pdf_processor.get_local_path_from_db(file_id)
            
            mental_health_request = MentalHealthRequest(
                file_path=local_path,
                num_questions=request.num_questions,
                question_types=request.question_types,
                assessment_areas=request.assessment_areas
            )
            
            quizzes = self.generator.generate_mental_health_assessment(mental_health_request)
            
            logger.info(f"Generated {len(quizzes)} questions for file_id: {file_id}")
            return GenerateQuizResponse(file_id=file_id, quizzes=quizzes)
            
        except Exception as e:
            logger.error(f"Quiz generation failed: {e}")
            raise
    
    def evaluate_mood(self, request: EvaluateMoodRequest) -> EvaluateMoodResponse:
        """
        Evaluate mood using quizzes + file_id, return insights.
        Uses evaluator graph for comprehensive analysis.
        """
        try:
            min_questions = 3
            if len(request.answers) < min_questions:
                raise ValueError(f"Mood evaluation requires at least {min_questions} answers. Got {len(request.answers)}")
            
            logger.info(f"Evaluating mood for file_id: {request.file_id} with {len(request.answers)} answers")
            
            local_path = self.pdf_processor.get_local_path_from_db(request.file_id)
            
            mental_health_eval_request = MentalHealthEvaluationRequest(
                file_path=local_path,
                quiz=request.quizzes,
                answers=request.answers,
                user_demographics={} 
            )
            
            evaluation_results = self.evaluator.evaluate_mental_health(mental_health_eval_request)
            
            if evaluation_results and len(evaluation_results) > 0:
                mental_health_analysis = evaluation_results[0].analysis
                
                mood_indicators = []
                for indicator in mental_health_analysis.indicators:
                    mood_indicator = MoodIndicator(
                        dimension=indicator.dimension,
                        level=indicator.level,
                        confidence=indicator.confidence,
                        description=indicator.description,
                        contributing_factors=indicator.contributing_factors
                    )
                    mood_indicators.append(mood_indicator)
                
                mood_analysis = MoodAnalysis(
                    overall_mood_state=mental_health_analysis.overall_assessment,
                    mood_indicators=mood_indicators,
                    dominant_emotions=["anxiety", "stress", "wellbeing"][:3],  # Extract from analysis or use default
                    mood_stability="stable" if mental_health_analysis.risk_factors == [] else "fluctuating",
                    risk_level="low" if not mental_health_analysis.professional_consultation_advised else "moderate",
                    recommendations=mental_health_analysis.recommendations,
                    professional_help_suggested=mental_health_analysis.professional_consultation_advised,
                    detailed_interpretation=mental_health_analysis.detailed_analysis
                )
            else:
                mood_analysis = MoodAnalysis(
                    overall_mood_state="Unable to analyze due to insufficient data",
                    mood_indicators=[],
                    dominant_emotions=["unknown"],
                    mood_stability="unclear",
                    risk_level="moderate",
                    recommendations=["Consider retaking assessment with more responses"],
                    professional_help_suggested=True,
                    detailed_interpretation="Analysis could not be completed due to insufficient response data."
                )
            
            if len(request.answers) >= 8:
                reliability = "high"
            elif len(request.answers) >= 5:
                reliability = "medium" 
            else:
                reliability = "low"
            
            logger.info(f"Mood evaluation complete for file_id: {request.file_id}, reliability: {reliability}")
            
            return EvaluateMoodResponse(
                file_id=request.file_id,
                mood_analysis=mood_analysis,
                total_questions=len(request.answers),
                assessment_reliability=reliability
            )
            
        except Exception as e:
            logger.error(f"Mood evaluation failed: {e}")
            raise
