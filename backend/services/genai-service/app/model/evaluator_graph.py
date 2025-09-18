from typing import Dict, Any, List
from langgraph.graph import StateGraph, END

from app.model.gemini import get_gemini_chat_model
from app.model.quiz_models import (
    GraphState, QuizEvaluationRequest, QuizEvaluationResult,
    MentalHealthEvaluationRequest, MentalHealthEvaluationResult,
    MentalHealthAnalysis, MentalHealthIndicator, MoodAnalysis, MoodIndicator
)
from app.model.pdf_processor import PDFProcessor
from app.model.retriever import DocumentRetriever
from app.model.query_optimizer import QueryOptimizer
from app.config.logger_config import get_logger
import json

logger = get_logger(__name__)

class QuizEvaluatorGraph:
    def __init__(self):
        self.pdf_processor = PDFProcessor()
        self.retriever = DocumentRetriever()
        self.query_optimizer = QueryOptimizer()
        self.llm = get_gemini_chat_model()
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the quiz evaluation graph."""
        workflow = StateGraph(GraphState)
        
        workflow.add_node("get_file_hash", self.get_file_hash_node)
        workflow.add_node("retrieve_documents", self.retrieve_documents_node)
        workflow.add_node("evaluate_quiz", self.evaluate_quiz_node)
        workflow.add_node("analyze_mental_health", self.analyze_mental_health_node)
        
        workflow.set_entry_point("get_file_hash")
        workflow.add_edge("get_file_hash", "retrieve_documents")
        workflow.add_conditional_edges(
            "retrieve_documents",
            self.should_analyze_mental_health,
            {
                "mental_health": "analyze_mental_health",
                "academic": "evaluate_quiz"
            }
        )
        workflow.add_edge("evaluate_quiz", END)
        workflow.add_edge("analyze_mental_health", END)
        
        return workflow.compile()
    
    def get_file_hash_node(self, state: GraphState) -> Dict[str, Any]:
        """Get file hash for the evaluation file."""
        try:
            file_hash = self.pdf_processor.get_file_hash(state.file_path)
            return {"file_hash": file_hash}
        except Exception as e:
            logger.error(f"File hash generation failed: {e}")
            return {"error": str(e)}
    
    def retrieve_documents_node(self, state: GraphState) -> Dict[str, Any]:
        """Retrieve relevant documents for evaluation."""
        try:
            # Use appropriate request type for query optimization
            request = state.mental_health_evaluation_request or state.evaluation_request
            if hasattr(request, 'quiz'):
                optimized_query = self.query_optimizer.optimize_evaluation_query(request.quiz)
            else:
                optimized_query = "mental health assessment evaluation"
            
            retrieved_docs = self.retriever.retrieve_relevant_docs(
                optimized_query, 
                state.file_hash,
                k=10  # More documents for evaluation
            )
            return {"retrieved_docs": retrieved_docs}
        except Exception as e:
            logger.error(f"Document retrieval failed: {e}")
            return {"error": str(e)}
    
    def evaluate_quiz_node(self, state: GraphState) -> Dict[str, Any]:
        """Evaluate quiz answers."""
        try:
            context = "\n\n".join(state.retrieved_docs)
            evaluation_results = []
            
            for i, (quiz_item, user_answer) in enumerate(
                zip(state.evaluation_request.quiz, state.evaluation_request.answers)
            ):
                prompt = f"""
                Based on the following context, evaluate the user's answer to this question:

                Context:
                {context}

                Question: {quiz_item.question}
                Question Type: {quiz_item.type}
                {"Options: " + str(quiz_item.options) if quiz_item.options else ""}
                User's Answer: {user_answer}

                IMPORTANT: Return ONLY valid JSON in this exact format, no additional text:
                {{
                    "correct_answer": "The correct answer or explanation",
                    "is_correct": true,
                    "explanation": "Detailed explanation of why the answer is correct or incorrect",
                    "score": 0.8
                }}

                For MCQ: Check if the user selected the correct option.
                For Descriptive: Evaluate based on accuracy, completeness, and understanding.
                Score should be between 0.0 and 1.0.
                """
                
                response = self.llm.invoke(prompt)
                
                # Clean and parse JSON response
                response_text = response.content.strip()
                logger.info(f"Evaluation response: {response_text[:200]}...")
                
                # Try to extract JSON from response if it's wrapped in markdown or text
                if "```json" in response_text:
                    start = response_text.find("```json") + 7
                    end = response_text.find("```", start)
                    response_text = response_text[start:end].strip()
                elif "{" in response_text:
                    start = response_text.find("{")
                    end = response_text.rfind("}") + 1
                    response_text = response_text[start:end].strip()
                
                try:
                    eval_data = json.loads(response_text)
                    
                    # Ensure required fields exist with defaults
                    eval_data.setdefault("correct_answer", "Unable to determine")
                    eval_data.setdefault("is_correct", False)
                    eval_data.setdefault("explanation", "Evaluation completed")
                    eval_data.setdefault("score", 0.0)
                    
                    # Validate score is within bounds
                    score = eval_data.get("score", 0.0)
                    if not isinstance(score, (int, float)) or score < 0 or score > 1:
                        eval_data["score"] = 0.5  # Default middle score
                        
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse evaluation JSON: {e}")
                    logger.error(f"Response text: {response_text}")
                    # Provide fallback evaluation
                    eval_data = {
                        "correct_answer": "Unable to determine correct answer",
                        "is_correct": False,
                        "explanation": "Evaluation failed due to parsing error",
                        "score": 0.0
                    }
                
                result = QuizEvaluationResult(
                    question=quiz_item.question,
                    user_answer=user_answer,
                    correct_answer=eval_data["correct_answer"],
                    is_correct=eval_data["is_correct"],
                    explanation=eval_data["explanation"],
                    score=eval_data["score"]
                )
                
                evaluation_results.append(result)
            
            return {"evaluation_results": evaluation_results}
            
        except Exception as e:
            logger.error(f"Quiz evaluation failed: {e}")
            return {"error": str(e)}
    
    def analyze_mental_health_node(self, state: GraphState) -> Dict[str, Any]:
        """Analyze mental health based on assessment responses."""
        try:
            context = "\n\n".join(state.retrieved_docs)
            request = state.mental_health_evaluation_request
            
            # Compile all responses for comprehensive analysis
            all_responses = []
            for i, (quiz_item, user_answer) in enumerate(zip(request.quiz, request.answers)):
                all_responses.append(f"Q{i+1}: {quiz_item.question}")
                all_responses.append(f"Answer: {user_answer}")
                if quiz_item.type == "scale" and quiz_item.scale_labels:
                    try:
                        scale_val = int(user_answer)
                        if scale_val in quiz_item.scale_labels:
                            all_responses.append(f"Scale meaning: {quiz_item.scale_labels[scale_val]}")
                    except (ValueError, KeyError):
                        pass
                all_responses.append("---")
            
            responses_text = "\n".join(all_responses)
            
            # Use structured output with the LLM
            structured_llm = self.llm.with_structured_output(MoodAnalysis)
            
            prompt = f"""
            You are a clinical psychologist analyzing mental health assessment responses based on validated psychiatric research.

            Research Context:
            {context}

            Assessment Responses:
            {responses_text}

            Based on the responses and the psychiatric research provided, conduct a comprehensive mood analysis.

            CRITICAL INSTRUCTIONS:
            - For each mood_indicator, the "level" field must be EXACTLY one of: "very_low", "low", "mild", "moderate", "high", "very_high", "severe", "critical", "extreme"
            - Analyze key dimensions: Anxiety & Stress, Depression Risk, Impaired Mental Functioning, Well-being (Positive Mental Health), Social Functioning
            - Provide evidence-based interpretations using the research context
            - Be professional, empathetic, and actionable in recommendations
            
            LEVEL MAPPING GUIDE for mood_indicators:
            - "very_low": Minimal to no symptoms
            - "low": Slight symptoms, within normal range
            - "mild": Noticeable but manageable symptoms
            - "moderate": Moderate symptoms requiring attention
            - "high": Significant symptoms needing intervention  
            - "very_high": Severe symptoms requiring professional help
            - "severe": Critical symptoms requiring immediate intervention
            - "critical": Emergency-level symptoms requiring urgent care
            - "extreme": Life-threatening symptoms requiring immediate emergency response
            
            For mood_stability, use: "stable", "fluctuating", or "unstable"
            For risk_level, use: "low", "moderate", "high", or "critical"
            """
            
            try:
                # Use structured output to avoid JSON parsing issues
                mood_analysis = structured_llm.invoke(prompt)
                
                # Validate and normalize any potential issues
                def normalize_mood_level(level_str: str) -> str:
                    """Normalize mood level values to valid options."""
                    level_lower = level_str.lower().strip()
                    
                    # Direct mappings - expanded range
                    valid_levels = ["very_low", "low", "mild", "moderate", "high", "very_high", "severe", "critical", "extreme"]
                    if level_lower in valid_levels:
                        return level_lower
                    
                    # Map common variations
                    level_mappings = {
                        "very high": "very_high",
                        "very_high": "very_high",
                        "significant": "high",
                        "elevated": "high",
                        "concerning": "moderate",
                        "slight": "mild",
                        "minimal": "low",
                        "normal": "low",
                        "stable": "low"
                    }
                    
                    # Check for partial matches
                    for key, value in level_mappings.items():
                        if key in level_lower:
                            return value
                    
                    # Default fallback
                    logger.warning(f"Unknown mood level value '{level_str}', defaulting to 'moderate'")
                    return "moderate"
                
                # Normalize any invalid level values in mood indicators
                for indicator in mood_analysis.mood_indicators:
                    original_level = indicator.level
                    normalized_level = normalize_mood_level(original_level)
                    if original_level != normalized_level:
                        logger.info(f"Normalized mood level '{original_level}' to '{normalized_level}'")
                        indicator.level = normalized_level
                
                # Create evaluation results with mood analysis
                mental_health_results = []
                for i, (quiz_item, user_answer) in enumerate(zip(request.quiz, request.answers)):
                    # Find relevant indicator for this question
                    relevant_indicator = None
                    if mood_analysis.mood_indicators:
                        question_lower = quiz_item.question.lower()
                        for ind in mood_analysis.mood_indicators:
                            if any(keyword in question_lower for keyword in 
                                  ["depress", "sad", "unhappy"]) and any(d_keyword in ind.dimension.lower() for d_keyword in ["depression", "depress"]):
                                relevant_indicator = ind
                                break
                            elif any(keyword in question_lower for keyword in 
                                    ["anxi", "worry", "nervous", "strain"]) and any(a_keyword in ind.dimension.lower() for a_keyword in ["anxiety", "stress"]):
                                relevant_indicator = ind
                                break
                            elif any(keyword in question_lower for keyword in 
                                    ["stress", "strain", "pressure"]) and "stress" in ind.dimension.lower():
                                relevant_indicator = ind
                                break
                        
                        # Fallback to first indicator if no match found
                        if not relevant_indicator:
                            relevant_indicator = mood_analysis.mood_indicators[0]
                    
                    # Generate interpretation
                    interpretation = "Response indicates normal range"
                    if relevant_indicator:
                        interpretation = f"Response suggests {relevant_indicator.level} level in {relevant_indicator.dimension}: {relevant_indicator.description}"
                    
                    # Get high-risk indicators
                    high_risk_indicators = [ind.dimension for ind in mood_analysis.mood_indicators 
                                          if ind.level in ["high", "very_high"]]
                    
                    # Create compatible result using mood analysis - both models now use same level values
                    result = MentalHealthEvaluationResult(
                        question=quiz_item.question,
                        user_answer=user_answer,
                        psychological_interpretation=interpretation,
                        mental_health_indicators=high_risk_indicators,
                        analysis=MentalHealthAnalysis(
                            overall_assessment=mood_analysis.overall_mood_state,
                            indicators=[MentalHealthIndicator(
                                dimension=ind.dimension,
                                level=ind.level,  # No conversion needed now
                                confidence=ind.confidence,
                                description=ind.description,
                                contributing_factors=ind.contributing_factors
                            ) for ind in mood_analysis.mood_indicators],
                            recommendations=mood_analysis.recommendations,
                            professional_consultation_advised=mood_analysis.professional_help_suggested,
                            risk_factors=[f"Risk level: {mood_analysis.risk_level}", f"Mood stability: {mood_analysis.mood_stability}"],
                            protective_factors=["Seeking mental health assessment"],
                            detailed_analysis=mood_analysis.detailed_interpretation
                        )
                    )
                    mental_health_results.append(result)
                
                # Return mood analysis format for the service
                return {
                    "mental_health_results": mental_health_results,
                    "mood_analysis": mood_analysis  # Add this for the service to use
                }
                
            except Exception as e:
                logger.error(f"Structured output failed: {e}")
                # Fallback with manual creation
                fallback_mood_analysis = MoodAnalysis(
                    overall_mood_state="Assessment completed with limited analysis due to technical constraints",
                    mood_indicators=[
                        MoodIndicator(
                            dimension="General Assessment",
                            level="moderate",
                            confidence=0.5,
                            description="Unable to complete detailed analysis due to technical error",
                            contributing_factors=["Technical error"]
                        )
                    ],
                    dominant_emotions=["concern"],
                    mood_stability="fluctuating",
                    risk_level="moderate",
                    recommendations=["Seek professional consultation for comprehensive assessment"],
                    professional_help_suggested=True,
                    detailed_interpretation="Analysis could not be completed due to technical error. Please consult with a mental health professional for proper assessment."
                )
                
                # Create fallback results
                mental_health_results = []
                for quiz_item, user_answer in zip(request.quiz, request.answers):
                    result = MentalHealthEvaluationResult(
                        question=quiz_item.question,
                        user_answer=user_answer,
                        psychological_interpretation="Assessment incomplete due to technical error",
                        mental_health_indicators=["Technical Error"],
                        analysis=MentalHealthAnalysis(
                            overall_assessment=fallback_mood_analysis.overall_mood_state,
                            indicators=[MentalHealthIndicator(
                                dimension=ind.dimension,
                                level=ind.level,  # No conversion needed
                                confidence=ind.confidence,
                                description=ind.description,
                                contributing_factors=ind.contributing_factors
                            ) for ind in fallback_mood_analysis.mood_indicators],
                            recommendations=fallback_mood_analysis.recommendations,
                            professional_consultation_advised=fallback_mood_analysis.professional_help_suggested,
                            risk_factors=["Assessment incomplete"],
                            protective_factors=["Seeking help through assessment"],
                            detailed_analysis=fallback_mood_analysis.detailed_interpretation
                        )
                    )
                    mental_health_results.append(result)
                
                return {
                    "mental_health_results": mental_health_results,
                    "mood_analysis": fallback_mood_analysis
                }
            
        except Exception as e:
            logger.error(f"Mental health analysis failed: {e}")
            # Always provide a fallback to prevent total failure
            fallback_mood_analysis = MoodAnalysis(
                overall_mood_state="Assessment could not be completed due to system error",
                mood_indicators=[
                    MoodIndicator(
                        dimension="System Error",
                        level="moderate",
                        confidence=0.1,
                        description="Technical error prevented proper analysis",
                        contributing_factors=["System error", "Technical malfunction"]
                    )
                ],
                dominant_emotions=["uncertainty"],
                mood_stability="unstable",
                risk_level="moderate",
                recommendations=["Please retry the assessment", "Consider seeking professional consultation"],
                professional_help_suggested=True,
                detailed_interpretation="The assessment could not be completed due to a technical error. Please try again or consult with a mental health professional."
            )
            
            # Create fallback results
            mental_health_results = []
            if hasattr(request, 'quiz') and hasattr(request, 'answers'):
                for quiz_item, user_answer in zip(request.quiz, request.answers):
                    result = MentalHealthEvaluationResult(
                        question=quiz_item.question,
                        user_answer=user_answer,
                        psychological_interpretation="Analysis unavailable due to system error",
                        mental_health_indicators=["System Error"],
                        analysis=MentalHealthAnalysis(
                            overall_assessment=fallback_mood_analysis.overall_mood_state,
                            indicators=[MentalHealthIndicator(
                                dimension="System Error",
                                level="moderate",
                                confidence=0.1,
                                description="Technical error prevented proper analysis",
                                contributing_factors=["System error", "Technical malfunction"]
                            )],
                            recommendations=fallback_mood_analysis.recommendations,
                            professional_consultation_advised=fallback_mood_analysis.professional_help_suggested,
                            risk_factors=["Assessment incomplete"],
                            protective_factors=["Attempting mental health assessment"],
                            detailed_analysis=fallback_mood_analysis.detailed_interpretation
                        )
                    )
                    mental_health_results.append(result)
            else:
                # Minimal fallback if request structure is also broken
                mental_health_results = [MentalHealthEvaluationResult(
                    question="System Error",
                    user_answer="N/A",
                    psychological_interpretation="System error prevented analysis",
                    mental_health_indicators=["System Error"],
                    analysis=MentalHealthAnalysis(
                        overall_assessment="System error",
                        indicators=[],
                        recommendations=["Retry assessment"],
                        professional_consultation_advised=True,
                        risk_factors=["System error"],
                        protective_factors=[],
                        detailed_analysis="System error occurred"
                    )
                )]
            
            return {
                "mental_health_results": mental_health_results,
                "mood_analysis": fallback_mood_analysis
            }
    
    def should_analyze_mental_health(self, state: GraphState) -> str:
        """Decide whether to perform mental health analysis or academic evaluation."""
        return "mental_health" if state.mental_health_evaluation_request else "academic"
    
    def evaluate_quiz(self, request: QuizEvaluationRequest) -> List[QuizEvaluationResult]:
        """Main method to evaluate quiz."""
        initial_state = GraphState(
            file_path=request.file_path,
            evaluation_request=request
        )
        
        result = self.graph.invoke(initial_state)
        
        if result.get("error"):
            raise Exception(f"Quiz evaluation failed: {result['error']}")
        
        return result["evaluation_results"]
    
    def evaluate_mental_health(self, request: MentalHealthEvaluationRequest) -> List[MentalHealthEvaluationResult]:
        """Main method to evaluate mental health assessment."""
        initial_state = GraphState(
            file_path=request.file_path,
            mental_health_evaluation_request=request
        )
        
        result = self.graph.invoke(initial_state)
        
        if result.get("error"):
            raise Exception(f"Mental health evaluation failed: {result['error']}")
        
        # Return just the mental health results list as expected by the service
        return result["mental_health_results"]
