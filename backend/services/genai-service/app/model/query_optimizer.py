from typing import List, Union
from app.model.gemini import get_gemini_chat_model
from app.config.logger_config import get_logger
from app.model.quiz_models import QuizRequest, Quiz, MentalHealthRequest

logger = get_logger(__name__)

class QueryOptimizer:
    def __init__(self):
        self.llm = get_gemini_chat_model(temperature=0.3)

    def optimize_quiz_generation_query(self, request: Union['QuizRequest', 'MentalHealthRequest']) -> str:
        """Generate optimized query for quiz generation."""
        
        if hasattr(request, 'assessment_areas'):  # MentalHealthRequest
            query_template = f"""
            Generate a comprehensive search query to retrieve relevant content for creating 
            {request.num_questions} mental health assessment questions.
            
            Requirements:
            - Question types: {', '.join(request.question_types)}
            - Assessment areas: {', '.join(request.assessment_areas)}
            - Focus on mental health assessment tools, questionnaires, and psychological evaluation methodologies
            
            Return only the optimized search query, no explanations.
            """
        else:  # QuizRequest
            query_template = f"""
            Generate a comprehensive search query to retrieve relevant content for creating 
            {request.num_questions} quiz questions about mental health questionnaires.
            
            Requirements:
            - Question types: {', '.join(request.question_types)}
            - Difficulty level: {request.difficulty}
            - Focus on mental health assessment tools, questionnaires, and methodologies
            
            Return only the optimized search query, no explanations.
            """
        
        try:
            response = self.llm.invoke(query_template)
            optimized_query = response.content.strip()
            logger.info(f"Optimized quiz generation query: {optimized_query}")
            return optimized_query
        except Exception as e:
            logger.warning(f"Query optimization failed: {e}")
            if hasattr(request, 'assessment_areas'):
                return f"mental health assessment {' '.join(request.assessment_areas)} psychological evaluation"
            else:
                return "mental health questionnaire assessment methodology validation reliability"
    
    def optimize_evaluation_query(self, quiz: List['Quiz']) -> str:
        """Generate optimized query for quiz evaluation."""
        
        questions_sample = [q.question for q in quiz[:3]]  # First 3 questions
        
        query_template = f"""
        Generate a search query to retrieve content relevant for evaluating answers to these questions:
        {questions_sample}
        
        Focus on finding authoritative content about the topics covered in these questions.
        Return only the search query.
        """
        
        try:
            response = self.llm.invoke(query_template)
            optimized_query = response.content.strip()
            logger.info(f"Optimized evaluation query: {optimized_query}")
            return optimized_query
        except Exception as e:
            logger.warning(f"Query optimization failed: {e}")
            return " ".join([q.question.split()[:5] for q in quiz])  # Fallback
