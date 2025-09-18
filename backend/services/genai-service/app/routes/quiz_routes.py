from fastapi import APIRouter, Header, HTTPException, status
from app.dto.api_response_class import APIResponseClass
from app.model.quiz_models import GenerateQuizRequest, GenerateQuizResponse, EvaluateMoodRequest, EvaluateMoodResponse
from app.service.quiz_service import QuizService
from typing import Annotated, Optional
from app.config.logger_config import get_logger

router = APIRouter()
quiz_service = QuizService()
logger = get_logger(__name__)


def validate_admin_role(user_role: Optional[str]) -> None:
    """
    Validate that the user has admin role.
    Raises HTTPException if not admin.
    """
    if not user_role or (user_role.lower() != "admin" and user_role.lower() != "administrator"):
        logger.warning(f"Access denied: User role '{user_role}' is not admin")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin role required."
        )

# def validate_user_role(user_role: Optional[str]) -> None:
#     """
#     Validate that the user has user role.
#     Raises HTTPException if not user.
#     """
#     if not user_role or (user_role.lower() != "user"):
#         logger.warning(f"Access denied: User role '{user_role}' is not user")
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Access denied. User role required."
#         )


@router.post("/generate")
def generate_quiz(
    request: GenerateQuizRequest,
    x_user_role: Annotated[Optional[str], Header(alias="X-User-Role")] = None
) -> APIResponseClass:
    """
    Generate a mental health assessment quiz from a PDF file.
    Requires admin role.
    """
    try:
        validate_admin_role(x_user_role)
        
        logger.info(f"Admin user generating quiz for file: {request.file_url}")
        
        if not request.file_url or not request.file_url.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File URL is required and cannot be empty"
            )
        
        if request.num_questions < 1 or request.num_questions > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Number of questions must be between 1 and 50"
            )
        
        if not request.question_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one question type must be specified"
            )
        
        if not request.assessment_areas:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one assessment area must be specified"
            )
        
        # Generate quiz
        result = quiz_service.generate_quiz(request)
        
        logger.info(f"Successfully generated quiz with {len(result.quizzes)} questions for file_id: {result.file_id}")
        
        return APIResponseClass(
            success=True,
            message="Quiz generated successfully",
            data=result
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions (validation errors, auth errors)
        raise
    except ValueError as e:
        logger.error(f"Validation error in generate_quiz: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid request: {str(e)}"
        )
    except FileNotFoundError as e:
        logger.error(f"File not found in generate_quiz: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF file could not be found or accessed"
        )
    except ConnectionError as e:
        logger.error(f"Connection error in generate_quiz: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to download PDF file. Please check the URL and try again."
        )
    except Exception as e:
        logger.error(f"Unexpected error in generate_quiz: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error occurred while generating quiz"
        )


@router.post("/evaluate")
def evaluate_mood(
    request: EvaluateMoodRequest,
    x_user_role: Annotated[Optional[str], Header(alias="X-User-Role")] = None
) -> APIResponseClass:
    """
    Evaluate mood based on quiz answers.
    Requires admin role.
    """
    try:
        # Validate user role
        validate_admin_role(x_user_role)

        logger.info(f"User evaluating mood for file_id: {request.file_id}")

        # Validate request parameters
        if not request.file_id or request.file_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valid file_id is required"
            )
        
        if not request.quizzes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quiz questions are required for mood evaluation"
            )
        
        if not request.answers:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Answers are required for mood evaluation"
            )
        
        if len(request.answers) != len(request.quizzes):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Number of answers ({len(request.answers)}) must match number of questions ({len(request.quizzes)})"
            )
        
        # Check for minimum required answers
        min_required_answers = 3
        if len(request.answers) < min_required_answers:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"At least {min_required_answers} answers are required for reliable mood evaluation"
            )
        
        # Evaluate mood
        result = quiz_service.evaluate_mood(request)
        
        logger.info(f"Successfully evaluated mood for file_id: {request.file_id}, reliability: {result.assessment_reliability}")
        
        return APIResponseClass(
            success=True,
            message="Mood evaluation completed successfully",
            data=result
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error in evaluate_mood: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid request: {str(e)}"
        )
    except FileNotFoundError as e:
        logger.error(f"File not found in evaluate_mood: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated file not found. Please regenerate the quiz."
        )
    except Exception as e:
        logger.error(f"Unexpected error in evaluate_mood: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error occurred while evaluating mood"
        )