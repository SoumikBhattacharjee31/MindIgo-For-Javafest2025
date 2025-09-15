from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from app.model.gemini import get_gemini_chat_model
from app.model.quiz_models import GraphState, Quiz, QuizRequest, MentalHealthRequest
from app.model.pdf_processor import PDFProcessor
from app.model.retriever import DocumentRetriever
from app.model.query_optimizer import QueryOptimizer
from app.config.logger_config import get_logger
import json

logger = get_logger(__name__)

class QuizGeneratorGraph:
    def __init__(self):
        self.pdf_processor = PDFProcessor()
        self.retriever = DocumentRetriever()
        self.query_optimizer = QueryOptimizer()
        self.llm = get_gemini_chat_model()
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the quiz generation graph."""
        workflow = StateGraph(GraphState)
        
        # Add nodes
        workflow.add_node("process_pdf", self.process_pdf_node)
        workflow.add_node("check_embeddings", self.check_embeddings_node)
        workflow.add_node("generate_embeddings", self.generate_embeddings_node)
        workflow.add_node("retrieve_documents", self.retrieve_documents_node)
        workflow.add_node("generate_quiz", self.generate_quiz_node)
        
        # Add edges
        workflow.set_entry_point("process_pdf")
        workflow.add_edge("process_pdf", "check_embeddings")
        workflow.add_conditional_edges(
            "check_embeddings",
            self.should_generate_embeddings,
            {
                "generate": "generate_embeddings",
                "skip": "retrieve_documents"
            }
        )
        workflow.add_edge("generate_embeddings", "retrieve_documents")
        workflow.add_edge("retrieve_documents", "generate_quiz")
        workflow.add_edge("generate_quiz", END)
        
        return workflow.compile()
    
    def process_pdf_node(self, state: GraphState) -> Dict[str, Any]:
        """Process PDF file."""
        try:
            content, chunks, file_hash = self.pdf_processor.load_and_process_pdf(
                state.file_path
            )
            return {
                "file_content": content,
                "chunks": chunks,
                "file_hash": file_hash
            }
        except Exception as e:
            logger.error(f"PDF processing failed: {e}")
            return {"error": str(e)}
    
    def check_embeddings_node(self, state: GraphState) -> Dict[str, Any]:
        """Check if embeddings already exist."""
        try:
            embeddings_exist = self.retriever.check_embeddings_exist(state.file_hash)
            return {"embeddings_exist": embeddings_exist}
        except Exception as e:
            logger.error(f"Embeddings check failed: {e}")
            return {"embeddings_exist": False}
    
    def generate_embeddings_node(self, state: GraphState) -> Dict[str, Any]:
        """Generate embeddings for document chunks."""
        try:
            self.retriever.add_documents(
                state.chunks, 
                state.file_hash, 
                state.file_path
            )
            return {"embeddings_exist": True}
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return {"error": str(e)}
    
    def retrieve_documents_node(self, state: GraphState) -> Dict[str, Any]:
        """Retrieve relevant documents."""
        try:
            # Use mental health request if available, otherwise fall back to quiz request
            request = state.mental_health_request or state.quiz_request
            optimized_query = self.query_optimizer.optimize_quiz_generation_query(request)
            retrieved_docs = self.retriever.retrieve_relevant_docs(
                optimized_query, 
                state.file_hash
            )
            return {"retrieved_docs": retrieved_docs}
        except Exception as e:
            logger.error(f"Document retrieval failed: {e}")
            return {"error": str(e)}
    
    def generate_quiz_node(self, state: GraphState) -> Dict[str, Any]:
        """Generate quiz questions - either academic or mental health assessment."""
        try:
            context = "\n\n".join(state.retrieved_docs)
            
            # Check if this is a mental health assessment request
            if state.mental_health_request:
                return self._generate_mental_health_assessment(context, state.mental_health_request)
            else:
                return self._generate_academic_quiz(context, state.quiz_request)
            
        except Exception as e:
            logger.error(f"Quiz generation failed: {e}")
            return {"error": str(e)}
    
    def _generate_mental_health_assessment(self, context: str, request: MentalHealthRequest) -> Dict[str, Any]:
        """Generate mental health assessment questions based on psychiatric research."""
        prompt = f"""
        Based on the following psychiatric research context, generate {request.num_questions} mental health assessment questions.

        Context:
        {context}

        Requirements:
        - Generate questions of types: {', '.join(request.question_types)}
        - Focus on assessment areas: {', '.join(request.assessment_areas)}
        - Questions should help evaluate mental state, not test knowledge
        - Use validated scales and approaches from the research
        - For scale questions, use appropriate Likert scales (1-5 or 1-7)
        - For MCQ, provide response options that indicate different mental states
        - For descriptive, ask open-ended questions about feelings, experiences, behaviors

        IMPORTANT: Return ONLY valid JSON in this exact format, no additional text:
        [
            {{
                "question": "Over the past two weeks, how often have you felt down, depressed, or hopeless?",
                "type": "scale",
                "options": null,
                "scale_min": 1,
                "scale_max": 5,
                "scale_labels": {{"1": "Never", "2": "Several days", "3": "More than half the days", "4": "Nearly every day", "5": "Always"}}
            }},
            {{
                "question": "How would you describe your current stress level?",
                "type": "mcq",
                "options": ["Very low", "Low", "Moderate", "High", "Very high"],
                "scale_min": null,
                "scale_max": null,
                "scale_labels": null
            }},
            {{
                "question": "Describe a recent situation that made you feel anxious and how you coped with it.",
                "type": "descriptive",
                "options": null,
                "scale_min": null,
                "scale_max": null,
                "scale_labels": null
            }}
        ]

        Generate questions that will help assess mental health status based on the research findings.
        """
        
        response = self.llm.invoke(prompt)
        return self._parse_quiz_response(response)
    
    def _generate_academic_quiz(self, context: str, request: QuizRequest) -> Dict[str, Any]:
        """Generate traditional academic quiz questions."""
        prompt = f"""
        Based on the following context from a mental health research paper, generate {request.num_questions} quiz questions.

        Context:
        {context}

        Requirements:
        - Generate questions of types: {', '.join(request.question_types)}
        - Difficulty level: {request.difficulty}
        - Focus on key concepts, methodologies, findings, and applications
        - For MCQ questions, provide 4 options with only one correct answer
        - For descriptive questions, set options to null

        IMPORTANT: Return ONLY valid JSON in this exact format, no additional text:
        [
            {{
                "question": "Question text here",
                "type": "mcq",
                "options": ["option1", "option2", "option3", "option4"],
                "scale_min": null,
                "scale_max": null,
                "scale_labels": null
            }},
            {{
                "question": "Question text here", 
                "type": "descriptive",
                "options": null,
                "scale_min": null,
                "scale_max": null,
                "scale_labels": null
            }}
        ]

        Generate diverse, high-quality questions that test understanding of the material.
        """
        
        response = self.llm.invoke(prompt)
        return self._parse_quiz_response(response)
    
    def _parse_quiz_response(self, response) -> Dict[str, Any]:
        """Parse and validate quiz response."""
        # Clean and parse JSON response
        response_text = response.content.strip()
        logger.info(f"Raw response: {response_text[:200]}...")  # Log first 200 chars
        
        # Try to extract JSON from response if it's wrapped in markdown or text
        if "```json" in response_text:
            start = response_text.find("```json") + 7
            end = response_text.find("```", start)
            response_text = response_text[start:end].strip()
        elif "[" in response_text:
            start = response_text.find("[")
            end = response_text.rfind("]") + 1
            response_text = response_text[start:end].strip()
        
        try:
            quiz_data = json.loads(response_text)
            quiz = [Quiz(**item) for item in quiz_data]
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
            logger.error(f"Response text: {response_text}")
            raise Exception(f"Invalid JSON response from model: {e}")
        
        return {"quiz": quiz}
    
    def should_generate_embeddings(self, state: GraphState) -> str:
        """Decide whether to generate embeddings."""
        return "skip" if state.embeddings_exist else "generate"
    
    def generate_quiz(self, request: QuizRequest) -> List[Quiz]:
        """Main method to generate quiz."""
        initial_state = GraphState(
            file_path=request.file_path,
            quiz_request=request
        )
        
        result = self.graph.invoke(initial_state)
        
        if result.get("error"):
            raise Exception(f"Quiz generation failed: {result['error']}")
        
        return result["quiz"]
    
    def generate_mental_health_assessment(self, request: MentalHealthRequest) -> List[Quiz]:
        """Main method to generate mental health assessment."""
        initial_state = GraphState(
            file_path=request.file_path,
            mental_health_request=request
        )
        
        result = self.graph.invoke(initial_state)
        
        if result.get("error"):
            raise Exception(f"Mental health assessment generation failed: {result['error']}")
        
        return result["quiz"]

