from app.model.generator_graph import QuizGeneratorGraph
from app.model.evaluator_graph import QuizEvaluatorGraph
from app.model.quiz_models import QuizRequest, Quiz, QuizEvaluationRequest
import os

# Initialize generators
quiz_generator = QuizGeneratorGraph()
quiz_evaluator = QuizEvaluatorGraph()

# Test PDF file path (assuming it's in root directory)
pdf_path = "Psychiatric Ment Health Nurs - 2017 - Roldán‐Merino - Reliability and validity of the Positive Mental Health Questionnaire.pdf"  # Replace with actual PDF filename

def test_quiz_generation():
    """Test quiz generation from PDF"""
    print("Testing quiz generation...")
    
    quiz_request = QuizRequest(
        file_path=pdf_path,
        num_questions=5,
        difficulty="medium",
        question_types=["mcq", "descriptive"]
    )
    
    try:
        quiz = quiz_generator.generate_quiz(quiz_request)
        print(f"Generated {len(quiz)} questions:")
        for i, q in enumerate(quiz, 1):
            print(f"{i}. {q.question} (Type: {q.type})")
            if q.options:
                for j, option in enumerate(q.options, ord('A')):
                    print(f"   {chr(j)}. {option}")
        return quiz
    except Exception as e:
        print(f"Quiz generation failed: {e}")
        return None

def test_quiz_evaluation():
    """Test quiz evaluation"""
    print("\nTesting quiz evaluation...")
    
    # First generate a quiz
    quiz_request = QuizRequest(
        file_path=pdf_path,
        num_questions=3,
        difficulty="easy",
        question_types=["mcq", "descriptive"]
    )
    
    try:
        quiz = quiz_generator.generate_quiz(quiz_request)
        
        # Sample answers (you would normally get these from user input)
        sample_answers = []
        for q in quiz:
            if q.type == "mcq":
                sample_answers.append("A")  # Sample MCQ answer
            else:
                sample_answers.append("This is a sample descriptive answer.")
        
        # Create evaluation request
        eval_request = QuizEvaluationRequest(
            file_path=pdf_path,
            quiz=quiz,
            answers=sample_answers
        )
        
        # Evaluate quiz
        results = quiz_evaluator.evaluate_quiz(eval_request)
        
        print(f"Evaluation completed for {len(results)} questions:")
        total_score = 0
        for i, result in enumerate(results, 1):
            print(f"\n{i}. Question: {result.question}")
            print(f"   User Answer: {result.user_answer}")
            print(f"   Correct Answer: {result.correct_answer}")
            print(f"   Is Correct: {result.is_correct}")
            print(f"   Score: {result.score}")
            print(f"   Explanation: {result.explanation}")
            total_score += result.score
        
        print(f"\nTotal Score: {total_score}/{len(results)} ({(total_score/len(results)*100):.1f}%)")
        
    except Exception as e:
        print(f"Quiz evaluation failed: {e}")

def test_different_difficulty_levels():
    """Test quiz generation with different difficulty levels"""
    print("\nTesting different difficulty levels...")
    
    difficulties = ["easy", "medium", "hard"]
    
    for difficulty in difficulties:
        print(f"\nGenerating {difficulty} quiz...")
        quiz_request = QuizRequest(
            file_path=pdf_path,
            num_questions=2,
            difficulty=difficulty,
            question_types=["mcq"]
        )
        
        try:
            quiz = quiz_generator.generate_quiz(quiz_request)
            print(f"{difficulty.capitalize()} questions:")
            for i, q in enumerate(quiz, 1):
                print(f"{i}. {q.question}")
        except Exception as e:
            print(f"Failed to generate {difficulty} quiz: {e}")

def test_different_question_types():
    """Test quiz generation with different question types"""
    print("\nTesting different question types...")
    
    # Test MCQ only
    mcq_request = QuizRequest(
        file_path=pdf_path,
        num_questions=2,
        difficulty="medium",
        question_types=["mcq"]
    )
    
    # Test Descriptive only
    desc_request = QuizRequest(
        file_path=pdf_path,
        num_questions=2,
        difficulty="medium",
        question_types=["descriptive"]
    )
    
    try:
        print("MCQ Questions:")
        mcq_quiz = quiz_generator.generate_quiz(mcq_request)
        for i, q in enumerate(mcq_quiz, 1):
            print(f"{i}. {q.question} (Options: {len(q.options) if q.options else 0})")
        
        print("\nDescriptive Questions:")
        desc_quiz = quiz_generator.generate_quiz(desc_request)
        for i, q in enumerate(desc_quiz, 1):
            print(f"{i}. {q.question} (Options: {q.options})")
    
    except Exception as e:
        print(f"Question type test failed: {e}")

def run_all_tests():
    """Run all test cases"""
    if not os.path.exists(pdf_path):
        print(f"PDF file '{pdf_path}' not found in root directory. Please add a PDF file.")
        return
    
    print("Starting Quiz Generator and Evaluator Tests")
    print("=" * 50)
    
    # Test quiz generation
    quiz = test_quiz_generation()
    
    # Test quiz evaluation
    test_quiz_evaluation()
    
    # Test different difficulty levels
    test_different_difficulty_levels()
    
    # Test different question types
    test_different_question_types()
    
    print("\n" + "=" * 50)
    print("All tests completed!")

if __name__ == "__main__":
    run_all_tests()