from app.model.generator_graph import QuizGeneratorGraph
from app.model.evaluator_graph import QuizEvaluatorGraph
from app.model.quiz_models import (
    QuizRequest, MentalHealthRequest, MentalHealthEvaluationRequest,
    QuizEvaluationRequest
)
import os

# Initialize generators
quiz_generator = QuizGeneratorGraph()
quiz_evaluator = QuizEvaluatorGraph()

# Test PDF file path (assuming it's in root directory)
pdf_path = "Psychiatric Ment Health Nurs - 2017 - Roldán‐Merino - Reliability and validity of the Positive Mental Health Questionnaire.pdf"

def test_mental_health_assessment_generation():
    """Test mental health assessment question generation"""
    print("Testing mental health assessment generation...")
    
    mental_health_request = MentalHealthRequest(
        file_path=pdf_path,
        num_questions=8,
        question_types=["scale", "mcq", "descriptive"],
        assessment_areas=["mood", "anxiety", "stress", "wellbeing", "social_functioning"]
    )
    
    try:
        assessment = quiz_generator.generate_mental_health_assessment(mental_health_request)
        print(f"Generated {len(assessment)} mental health assessment questions:")
        
        for i, q in enumerate(assessment, 1):
            print(f"\n{i}. {q.question}")
            print(f"   Type: {q.type}")
            
            if q.type == "mcq" and q.options:
                for j, option in enumerate(q.options, ord('A')):
                    print(f"   {chr(j)}. {option}")
            elif q.type == "scale" and q.scale_labels:
                print(f"   Scale: {q.scale_min} to {q.scale_max}")
                for scale_val, label in q.scale_labels.items():
                    print(f"   {scale_val}: {label}")
        
        return assessment
    except Exception as e:
        print(f"Mental health assessment generation failed: {e}")
        return None

def test_mental_health_evaluation():
    """Test mental health assessment evaluation with psychological analysis"""
    print("\n" + "="*60)
    print("Testing mental health assessment evaluation...")
    
    # First generate a mental health assessment
    mental_health_request = MentalHealthRequest(
        file_path=pdf_path,
        num_questions=5,
        question_types=["scale", "mcq", "descriptive"],
        assessment_areas=["mood", "anxiety", "stress", "wellbeing"]
    )
    
    try:
        assessment = quiz_generator.generate_mental_health_assessment(mental_health_request)
        
        # Simulate realistic responses for mental health assessment
        sample_answers = []
        for q in assessment:
            if q.type == "scale":
                # Simulate moderate stress/anxiety responses
                sample_answers.append("3")  # Middle of scale
            elif q.type == "mcq":
                # Pick second option (often represents mild symptoms)
                sample_answers.append("B")
            else:  # descriptive
                sample_answers.append("I sometimes feel overwhelmed when dealing with work stress, but I try to manage it through exercise and talking with friends.")
        
        # Create evaluation request
        eval_request = MentalHealthEvaluationRequest(
            file_path=pdf_path,
            quiz=assessment,
            answers=sample_answers,
            user_demographics={"age": "25-35", "gender": "prefer_not_to_say"}
        )
        
        # Evaluate mental health
        results = quiz_evaluator.evaluate_mental_health(eval_request)
        
        print(f"\nMental Health Assessment Results:")
        print("="*60)
        
        if results:
            # Get the comprehensive analysis from the first result
            analysis = results[0].analysis
            
            print(f"Overall Assessment: {analysis.overall_assessment}\n")
            
            print("Mental Health Indicators:")
            for indicator in analysis.indicators:
                print(f"- {indicator.dimension}: {indicator.level.upper()} (Confidence: {indicator.confidence:.1%})")
                print(f"  {indicator.description}")
                if indicator.contributing_factors:
                    print(f"  Contributing factors: {', '.join(indicator.contributing_factors)}")
                print()
            
            print("Recommendations:")
            for i, rec in enumerate(analysis.recommendations, 1):
                print(f"{i}. {rec}")
            print()
            
            if analysis.risk_factors:
                print(f"Risk Factors: {', '.join(analysis.risk_factors)}")
            
            if analysis.protective_factors:
                print(f"Protective Factors: {', '.join(analysis.protective_factors)}")
            
            print(f"\nProfessional Consultation Advised: {'Yes' if analysis.professional_consultation_advised else 'No'}")
            
            print(f"\nDetailed Analysis:")
            print(analysis.detailed_analysis)
            
            print("\n" + "="*60)
            print("Individual Question Interpretations:")
            for i, result in enumerate(results, 1):
                print(f"\n{i}. Question: {result.question}")
                print(f"   Your Answer: {result.user_answer}")
                print(f"   Psychological Interpretation: {result.psychological_interpretation}")
                if result.mental_health_indicators:
                    print(f"   Flagged Indicators: {', '.join(result.mental_health_indicators)}")
        
    except Exception as e:
        print(f"Mental health evaluation failed: {e}")

def test_traditional_quiz_generation():
    """Test traditional academic quiz generation for comparison"""
    print("\n" + "="*60)
    print("Testing traditional academic quiz generation...")
    
    quiz_request = QuizRequest(
        file_path=pdf_path,
        num_questions=3,
        difficulty="medium",
        question_types=["mcq", "descriptive"]
    )
    
    try:
        quiz = quiz_generator.generate_quiz(quiz_request)
        print(f"Generated {len(quiz)} academic questions:")
        for i, q in enumerate(quiz, 1):
            print(f"\n{i}. {q.question} (Type: {q.type})")
            if q.options:
                for j, option in enumerate(q.options, ord('A')):
                    print(f"   {chr(j)}. {option}")
        return quiz
    except Exception as e:
        print(f"Academic quiz generation failed: {e}")
        return None

def test_comprehensive_mental_health_scenarios():
    """Test different mental health scenarios"""
    print("\n" + "="*60)
    print("Testing different mental health assessment scenarios...")
    
    scenarios = [
        {
            "name": "Anxiety-focused Assessment",
            "areas": ["anxiety", "stress", "social_functioning"],
            "questions": 4
        },
        {
            "name": "Depression Screening",
            "areas": ["mood", "wellbeing", "social_functioning"],
            "questions": 4
        },
        {
            "name": "General Wellbeing Check",
            "areas": ["mood", "anxiety", "stress", "wellbeing", "social_functioning"],
            "questions": 6
        }
    ]
    
    for scenario in scenarios:
        print(f"\n--- {scenario['name']} ---")
        
        request = MentalHealthRequest(
            file_path=pdf_path,
            num_questions=scenario['questions'],
            question_types=["scale", "mcq"],
            assessment_areas=scenario['areas']
        )
        
        try:
            assessment = quiz_generator.generate_mental_health_assessment(request)
            print(f"Generated {len(assessment)} questions focusing on: {', '.join(scenario['areas'])}")
            
            for i, q in enumerate(assessment, 1):
                print(f"{i}. {q.question} ({q.type})")
                
        except Exception as e:
            print(f"Failed to generate {scenario['name']}: {e}")

def run_all_mental_health_tests():
    """Run all mental health assessment tests"""
    if not os.path.exists(pdf_path):
        print(f"PDF file '{pdf_path}' not found in root directory. Please add the psychiatric research PDF.")
        return
    
    print("Starting Mental Health Assessment System Tests")
    print("="*60)
    
    # Test mental health assessment generation
    test_mental_health_assessment_generation()
    
    # Test mental health evaluation with psychological analysis
    test_mental_health_evaluation()
    
    # Test traditional quiz for comparison
    test_traditional_quiz_generation()
    
    # Test different scenarios
    test_comprehensive_mental_health_scenarios()
    
    print("\n" + "="*60)
    print("All mental health assessment tests completed!")
    print("="*60)

if __name__ == "__main__":
    run_all_mental_health_tests()