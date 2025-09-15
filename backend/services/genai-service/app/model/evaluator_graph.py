from typing import Dict, Any, List
from langgraph.graph import StateGraph, END

from app.model.gemini import get_gemini_chat_model
from app.model.quiz_models import (
    GraphState, QuizEvaluationRequest, QuizEvaluationResult,
    MentalHealthEvaluationRequest, MentalHealthEvaluationResult,
    MentalHealthAnalysis, MentalHealthIndicator
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
        
        # Add nodes
        workflow.add_node("get_file_hash", self.get_file_hash_node)
        workflow.add_node("retrieve_documents", self.retrieve_documents_node)
        workflow.add_node("evaluate_quiz", self.evaluate_quiz_node)
        workflow.add_node("analyze_mental_health", self.analyze_mental_health_node)
        
        # Add edges
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
            
            prompt = f"""
            You are a clinical psychologist analyzing mental health assessment responses based on validated psychiatric research.

            Research Context:
            {context}

            Assessment Responses:
            {responses_text}

            Based on the responses and the psychiatric research provided, conduct a comprehensive mental health analysis.

            IMPORTANT: Return ONLY valid JSON in this exact format:
            {{
                "overall_assessment": "Brief overall mental health status summary",
                "indicators": [
                    {{
                        "dimension": "Depression Risk",
                        "level": "low/mild/moderate/high/severe", 
                        "confidence": 0.8,
                        "description": "Description of findings for this dimension",
                        "contributing_factors": ["factor1", "factor2"]
                    }}
                ],
                "recommendations": ["recommendation1", "recommendation2"],
                "professional_consultation_advised": true,
                "risk_factors": ["risk1", "risk2"],
                "protective_factors": ["protective1", "protective2"],
                "detailed_analysis": "Comprehensive analysis of mental state based on responses"
            }}

            Analyze key dimensions: depression, anxiety, stress, wellbeing, social functioning.
            Provide evidence-based interpretations using the research context.
            Be professional, empathetic, and actionable in recommendations.
            """
            
            response = self.llm.invoke(prompt)
            
            # Clean and parse JSON response
            response_text = response.content.strip()
            logger.info(f"Mental health analysis response: {response_text[:200]}...")
            
            # Try to extract JSON from response
            if "```json" in response_text:
                start = response_text.find("```json") + 7
                end = response_text.find("```", start)
                response_text = response_text[start:end].strip()
            elif "{" in response_text:
                start = response_text.find("{")
                end = response_text.rfind("}") + 1
                response_text = response_text[start:end].strip()
            
            try:
                analysis_data = json.loads(response_text)
                
                # Convert to structured objects
                indicators = [MentalHealthIndicator(**ind) for ind in analysis_data["indicators"]]
                analysis = MentalHealthAnalysis(
                    overall_assessment=analysis_data["overall_assessment"],
                    indicators=indicators,
                    recommendations=analysis_data["recommendations"],
                    professional_consultation_advised=analysis_data["professional_consultation_advised"],
                    risk_factors=analysis_data["risk_factors"],
                    protective_factors=analysis_data["protective_factors"],
                    detailed_analysis=analysis_data["detailed_analysis"]
                )
                
                # Create evaluation results for each question with psychological interpretation
                mental_health_results = []
                for i, (quiz_item, user_answer) in enumerate(zip(request.quiz, request.answers)):
                    result = MentalHealthEvaluationResult(
                        question=quiz_item.question,
                        user_answer=user_answer,
                        psychological_interpretation=f"Response indicates {analysis.indicators[min(i, len(analysis.indicators)-1)].description if analysis.indicators else 'normal range'}",
                        mental_health_indicators=[ind.dimension for ind in analysis.indicators if ind.level in ["moderate", "high", "severe"]],
                        analysis=analysis
                    )
                    mental_health_results.append(result)
                
                return {"mental_health_results": mental_health_results}
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse mental health analysis JSON: {e}")
                logger.error(f"Response text: {response_text}")
                # Provide fallback analysis
                fallback_analysis = MentalHealthAnalysis(
                    overall_assessment="Unable to complete comprehensive analysis due to parsing error",
                    indicators=[],
                    recommendations=["Seek professional consultation for proper assessment"],
                    professional_consultation_advised=True,
                    risk_factors=["Assessment parsing error"],
                    protective_factors=[],
                    detailed_analysis="Analysis failed due to technical error"
                )
                return {"mental_health_results": [MentalHealthEvaluationResult(
                    question="Assessment Error",
                    user_answer="",
                    psychological_interpretation="Technical error in analysis",
                    mental_health_indicators=[],
                    analysis=fallback_analysis
                )]}
            
        except Exception as e:
            logger.error(f"Mental health analysis failed: {e}")
            return {"error": str(e)}
    
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
        
        return result["mental_health_results"]
