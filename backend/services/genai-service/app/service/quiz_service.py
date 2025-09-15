from typing import List
from app.model.quiz_models import Quiz, QuizRequest, QuizEvaluationRequest, QuizEvaluationResult
from app.model.generator_graph import QuizGeneratorGraph
from app.model.evaluator_graph import QuizEvaluatorGraph
from app.config.logger_config import get_logger

logger = get_logger(__name__)

class QuizService:
    def __init__(self):
        self.generator = QuizGeneratorGraph()
        self.evaluator = QuizEvaluatorGraph()
    
    def generate_quiz(self, request: QuizRequest) -> List[Quiz]:
        """Generate quiz from PDF file."""
        try:
            logger.info(f"Generating quiz from file: {request.file_path}")
            quiz = self.generator.generate_quiz(request)
            logger.info(f"Successfully generated {len(quiz)} questions")
            return quiz
        except Exception as e:
            logger.error(f"Quiz generation failed: {e}")
            raise
    
    def evaluate_quiz(self, request: QuizEvaluationRequest) -> List[QuizEvaluationResult]:
        """Evaluate quiz answers."""
        try:
            logger.info(f"Evaluating quiz with {len(request.answers)} answers")
            results = self.evaluator.evaluate_quiz(request)
            
            # Calculate overall statistics
            total_score = sum(r.score for r in results)
            avg_score = total_score / len(results) if results else 0
            correct_count = sum(1 for r in results if r.is_correct)
            
            logger.info(f"Evaluation complete: {correct_count}/{len(results)} correct, avg score: {avg_score:.2f}")
            return results
        except Exception as e:
            logger.error(f"Quiz evaluation failed: {e}")
            raise

