from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langgraph.checkpoint.mongodb import MongoDBSaver
from langgraph.graph import START, END, StateGraph
from langgraph.prebuilt import ToolNode
from typing import List, Optional, Dict, Any
import asyncio
import re
from pymongo import MongoClient

from app.config import get_logger
from app.util import SessionManager
from app.model import get_chat_model
from app.tools import get_mood_history, get_recommended_doctors, get_recommended_songs
from .helper import *

logger = get_logger(__name__)

class GeminiChatService:
    def __init__(self, mongo_uri: str = "mongodb://mindigo:1234@localhost:27017/", **kwargs):
        """
        Initialize the GeminiChatService with configurable components.
        
        Args:
            mongo_uri: MongoDB connection URI
            **kwargs: Additional keyword arguments for model initialization
        """
        try:
            # MongoDB setup
            self.mongo_client = MongoClient(mongo_uri)
            self.checkpointer = MongoDBSaver(
                client=self.mongo_client,
                db_name="mindigo_checkpoints"
            )
            self.session_manager = SessionManager(self.mongo_client)
            
            # Configurable models - can be overridden via subclassing or init params
            self.models = self._get_models(**kwargs)
            
            # Task classifier model
            self.task_classifier = get_chat_model("gemini", model_name="gemini-1.5-flash", **kwargs)
            
            # Configurable tools
            self.tools = self._get_tools()
            
            # Configurable crisis keywords - can be extended or modified
            self.crisis_keywords = self._get_crisis_keywords()
            
            # System message - fetched from external helper
            self.system_message = get_system_message()
            
            # Build the graph
            self.app = self._build_graph()
            
            logger.info("GeminiChatService initialized successfully")
        except Exception as e:
            logger.error(f"Initialization error: {str(e)}")
            raise

    def _get_models(self, **kwargs) -> Dict[str, Any]:
        """Get configurable models. Can be overridden for customization."""
        return {
            "simple": get_chat_model("gemini", model_name="gemini-1.5-flash", **kwargs),
            "moderate": get_chat_model("gemini", model_name="gemini-2.0-flash", **kwargs), 
            "complex": get_chat_model("gemini", model_name="gemini-2.5-flash", **kwargs)
        }

    def _get_tools(self) -> List:
        """Get configurable tools. Can be overridden to add/remove tools."""
        return [get_recommended_doctors, get_mood_history, get_recommended_songs]

    def _get_crisis_keywords(self) -> Dict[str, List[str]]:
        """Get configurable crisis keywords. Can be overridden for customization."""
        return {
            'suicide': ['suicide', 'kill myself', 'end my life', 'want to die', 'better off dead', 'not worth living'],
            'self_harm': ['cut myself', 'hurt myself', 'self harm', 'pain helps', 'deserve pain'],
            'violence': ['hurt others', 'kill them', 'make them pay', 'they deserve to die'],
            'severe_crisis': ['ending it all', 'final solution', 'goodbye forever', 'last time', 'cant go on']
        }

    def _classify_task_complexity(self, message: str, state: State) -> TaskComplexity:
        """Classify the complexity of the incoming message."""
        try:
            # Simple patterns that can be handled quickly
            simple_patterns = [
                r'\b(hi|hello|hey|good\s+morning|good\s+evening)\b',
                r'\bhow\s+are\s+you\b',
                r'\bthank\s+you\b',
                r'\bthanks\b',
                r'\bgoodbye|bye\b',
                r'\bokay|ok\b'
            ]
            
            # Crisis patterns require immediate complex processing
            crisis_patterns = [re.escape(kw) for keywords in self.crisis_keywords.values() for kw in keywords]
            
            message_lower = message.lower()
            
            # Check for crisis - always complex
            if any(re.search(pattern, message_lower) for pattern in crisis_patterns):
                logger.info("Crisis indicators detected in task classification")
                return TaskComplexity(
                    level="complex",
                    reasoning="Crisis indicators detected - requires full safety assessment",
                    use_tools=True,
                    requires_history=True
                )
            
            # Check for simple greetings/acknowledgments
            if any(re.search(pattern, message_lower) for pattern in simple_patterns) and len(message.split()) <= 5:
                return TaskComplexity(
                    level="simple",
                    reasoning="Simple greeting or acknowledgment",
                    use_tools=False,
                    requires_history=False
                )
            
            # Check for tool-requiring keywords
            tool_keywords = [
                'doctor', 'therapist', 'professional help', 'music', 'songs', 'history', 'mood history', 'recommend'
            ]
            
            if any(keyword in message_lower for keyword in tool_keywords):
                return TaskComplexity(
                    level="complex",
                    reasoning="Request requires tool usage for recommendations",
                    use_tools=True,
                    requires_history=True
                )
            
            # Check message length and emotional complexity
            word_count = len(message.split())
            emotional_keywords = [
                'depressed', 'anxious', 'worried', 'scared', 'angry', 'frustrated', 'hopeless',
                'overwhelmed', 'stressed', 'panic', 'fear', 'sad', 'lonely', 'confused'
            ]
            
            has_emotional_content = any(keyword in message_lower for keyword in emotional_keywords)
            
            if word_count > 50 or has_emotional_content:
                return TaskComplexity(
                    level="moderate",
                    reasoning="Moderate emotional content or length requires careful processing",
                    use_tools=False,
                    requires_history=True
                )
            
            return TaskComplexity(
                level="simple",
                reasoning="Short message with no complex indicators",
                use_tools=False,
                requires_history=False
            )
        except Exception as e:
            logger.error(f"Error in task classification: {str(e)}")
            # Fallback to moderate
            return TaskComplexity(
                level="moderate",
                reasoning="Fallback due to classification error",
                use_tools=False,
                requires_history=True
            )

    def _detect_crisis_indicators(self, message: str, state: State) -> SafetyAlert:
        """Detect potential crisis situations in user messages."""
        try:
            message_lower = message.lower()
            triggers = []
            crisis_level = "none"
            immediate_action = False
            emergency_msg = None
            
            # Check for crisis keywords
            for category, keywords in self.crisis_keywords.items():
                for keyword in keywords:
                    if keyword in message_lower:
                        triggers.append(f"{category}: {keyword}")
                        
            # Determine crisis level based on triggers
            if any('suicide' in t or 'severe_crisis' in t for t in triggers):
                crisis_level = "crisis"
                immediate_action = True
                emergency_msg = "CRISIS DETECTED: User may be expressing suicidal thoughts. Immediate professional intervention recommended."
                
            elif any('self_harm' in t or 'violence' in t for t in triggers):
                crisis_level = "warning"
                immediate_action = True
                emergency_msg = "WARNING: User may be expressing self-harm or violence. Professional help strongly recommended."
                
            elif len(triggers) > 0:
                crisis_level = "concern"
                
            # Check for mood pattern deterioration
            if hasattr(state, 'safety_score') and state.safety_score >= 3:
                crisis_level = "warning" if crisis_level == "none" else crisis_level
                    
            logger.info(f"Crisis detection: level={crisis_level}, triggers={triggers}")
            return SafetyAlert(
                level=crisis_level,
                triggers=triggers,
                immediate_action_required=immediate_action,
                emergency_message=emergency_msg
            )
        except Exception as e:
            logger.error(f"Error in crisis detection: {str(e)}")
            return SafetyAlert(level="none", triggers=[], immediate_action_required=False)

    def _prep(self, state: State):
        """Prepare the conversation with system message and task classification."""
        try:
            user_message = state['messages'][-1].content if state['messages'] else ""
            
            # Classify task complexity
            complexity = self._classify_task_complexity(user_message, state)
            state["task_complexity"] = complexity
            
            if len(state['messages']) == 1:
                sys_msg = SystemMessage(content=self.system_message)
                return {"messages": [sys_msg] + state['messages'], "task_complexity": complexity}
            return {"task_complexity": complexity}
        except Exception as e:
            logger.error(f"Error in prep node: {str(e)}")
            return state

    def _route_by_complexity(self, state: State):
        """Route based on task complexity."""
        try:
            complexity = state.get("task_complexity")
            if not complexity:
                logger.warning("No task complexity found, defaulting to moderate_chat")
                return "moderate_chat"
                
            if complexity.level == "simple":
                return "simple_chat"
            elif complexity.use_tools:
                return "complex_chat"
            else:
                return "moderate_chat"
        except Exception as e:
            logger.error(f"Error in routing by complexity: {str(e)}")
            return "moderate_chat"

    def _simple_chat(self, state: State):
        """Handle simple messages with lightweight processing."""
        try:
            model = self.models["simple"]
            
            # For simple responses, use minimal context
            recent_messages = state["messages"][-3:] if len(state["messages"]) > 3 else state["messages"]
            response = model.invoke(recent_messages)
            
            return {"messages": state["messages"] + [response]}
        except Exception as e:
            logger.error(f"Error in simple_chat: {str(e)}")
            return state

    def _moderate_chat(self, state: State):
        """Handle moderate complexity messages."""
        try:
            model = self.models["moderate"]
            response = model.invoke(state["messages"])
            return {"messages": state["messages"] + [response]}
        except Exception as e:
            logger.error(f"Error in moderate_chat: {str(e)}")
            return state

    def _complex_chat(self, state: State):
        """Handle complex messages that may need tools."""
        try:
            model = self.models["complex"]
            model_with_tools = model.bind_tools(self.tools)
            response = model_with_tools.invoke(state["messages"])
            return {"messages": state["messages"] + [response]}
        except Exception as e:
            logger.error(f"Error in complex_chat: {str(e)}")
            return state

    def _route_after_chat(self, state: State):
        """Route after initial chat response."""
        try:
            last_msg = state["messages"][-1]
            
            # Check if tools were called
            if hasattr(last_msg, 'tool_calls') and last_msg.tool_calls:
                return "tools"
            
            # Always do safety check
            return "safety_check"
        except Exception as e:
            logger.error(f"Error in route_after_chat: {str(e)}")
            return "safety_check"

    def _safety_check(self, state: State):
        """Enhanced safety check with session tracking."""
        try:
            user_message = ""
            for msg in reversed(state["messages"]):
                if isinstance(msg, HumanMessage):
                    user_message = msg.content
                    break
                    
            safety_alert = self._detect_crisis_indicators(user_message, state)
            
            # Update safety score
            new_safety_score = state.get("safety_score", 0)
            if safety_alert.level in ["concern", "warning"]:
                new_safety_score += 1
            elif safety_alert.level == "crisis":
                new_safety_score = 5  # Maximum concern level
            
            # Update session with safety information
            if hasattr(state, 'session_id') and state.get('session_id'):
                self.session_manager.update_session(
                    state['session_id'],
                    {
                        'safety_score': new_safety_score,
                        'last_safety_alert': safety_alert.dict()
                    }
                )
                
            return {
                "messages": state["messages"], 
                "safety_score": new_safety_score,
                "safety_alert": safety_alert
            }
        except Exception as e:
            logger.error(f"Error in safety_check: {str(e)}")
            return state

    def _respond(self, state: State):
        """Generate final structured response."""
        try:
            complexity = state.get("task_complexity", TaskComplexity(level="moderate", reasoning="default"))
            model = self.models[complexity.level]
            structured_model = model.with_structured_output(Response)
            safety_alert = state.get("safety_alert", SafetyAlert(level="none"))

            logger.info(f"User Name: {state['user_name']}")
            logger.info(f"Generating response with complexity {complexity.level} - {complexity.reasoning}")
            logger.info(f"safety alert {safety_alert.level} and Safety triggers: {safety_alert.triggers} and Safety score: {state.get('safety_score', 0)}")
            
            prompt = get_final_prompt(state, complexity, safety_alert)

            output: Response = structured_model.invoke(prompt)
            output.safety_alert = safety_alert
            output.escalate = safety_alert.immediate_action_required
            
            final_msg = AIMessage(
                content=output.message,
                additional_kwargs={"structured": output.dict()}
            )
            return {"messages": state["messages"] + [final_msg]}
            
        except Exception as e:
            logger.error(f"Error in respond node: {str(e)}")
            fallback_response = Response(
                message=f"Hi {state['user_name']}, I'm here to listen and support you. How are you feeling right now?",
                safety_alert=safety_alert,
                escalate=safety_alert.immediate_action_required
            )
            
            final_msg = AIMessage(
                content=fallback_response.message,
                additional_kwargs={"structured": fallback_response.dict()}
            )
            return {"messages": state["messages"] + [final_msg]}

    def _build_graph(self):
        """Build the enhanced workflow graph with task routing."""
        try:
            workflow = StateGraph(state_schema=State)
            
            # Add all nodes
            workflow.add_node("prep", self._prep)
            workflow.add_node("simple_chat", self._simple_chat)
            workflow.add_node("moderate_chat", self._moderate_chat)  
            workflow.add_node("complex_chat", self._complex_chat)
            workflow.add_node("tools", ToolNode(self.tools))
            workflow.add_node("safety_check", self._safety_check)
            workflow.add_node("respond", self._respond)
            
            # Build the workflow
            workflow.add_edge(START, "prep")
            workflow.add_conditional_edges(
                "prep", 
                self._route_by_complexity,
                {
                    "simple_chat": "simple_chat",
                    "moderate_chat": "moderate_chat", 
                    "complex_chat": "complex_chat"
                }
            )
            
            # All chat nodes route through the same conditional logic
            workflow.add_conditional_edges(
                "simple_chat",
                self._route_after_chat,
                {"tools": "tools", "safety_check": "safety_check"}
            )
            workflow.add_conditional_edges(
                "moderate_chat", 
                self._route_after_chat,
                {"tools": "tools", "safety_check": "safety_check"}
            )
            workflow.add_conditional_edges(
                "complex_chat",
                self._route_after_chat, 
                {"tools": "tools", "safety_check": "safety_check"}
            )
            
            workflow.add_edge("tools", "safety_check")
            workflow.add_edge("safety_check", "respond")
            workflow.add_edge("respond", END)
            
            return workflow.compile(checkpointer=self.checkpointer)
        except Exception as e:
            logger.error(f"Error building graph: {str(e)}")
            raise

    def get_session(self, session_id: str) -> Optional[Dict]:
        """Retrieve session information."""
        try:
            return self.session_manager.get_session(session_id)
        except Exception as e:
            logger.error(f"Error getting session {session_id}: {str(e)}")
            return None

    def get_user_sessions(self, user_id: int) -> List[Dict]:
        """Get all sessions for a user."""
        try:
            return self.session_manager.get_user_sessions(user_id)
        except Exception as e:
            logger.error(f"Error getting user sessions for {user_id}: {str(e)}")
            return []

    def chat(self, message: str, 
             user_id: int, 
             user_name: str,
             session_id: str = None) -> Dict[str, Any]:
        """Enhanced chat interface with session management."""
        try:
            # Get or create session
            final_session_id = self.session_manager.get_or_create_session(
                user_id, user_name, session_id
            )
            
            config = {"configurable": {"thread_id": final_session_id}}
            
            # Get session data for safety score
            session_data = self.session_manager.get_session(final_session_id)
            initial_safety_score = session_data.get('safety_score', 0) if session_data else 0
            
            initial_state = {
                "messages": [HumanMessage(content=message)], 
                "user_id": user_id,
                "user_name": user_name,
                "session_id": final_session_id,
                "safety_score": initial_safety_score
            }
            
            final_state = self.app.invoke(initial_state, config)
            
            # Extract structured data from the last message
            last_message = final_state["messages"][-1]
            structured_data = last_message.additional_kwargs.get("structured", {})
            
            # Log safety concerns for monitoring
            safety_alert = structured_data.get("safety_alert", {})
            if safety_alert.get("level") in ["warning", "crisis"]:
                logger.warning(f"🚨 SAFETY ALERT for user {user_id}: {safety_alert}")
            
            # Update session with the conversation
            self.session_manager.update_session(final_session_id, {
                'safety_score': final_state.get('safety_score', initial_safety_score),
                'last_message': message,
                'last_response': last_message.content
            })
            
            return {
                "message": last_message.content,
                "mood": structured_data.get("mood"),
                "recommendations": structured_data.get("recommendations", []),
                "escalate": structured_data.get("escalate", False),
                "safety_alert": safety_alert,
                "session_id": final_session_id,
                "task_complexity": final_state.get("task_complexity", {}).dict() if final_state.get("task_complexity") else None
            }
        except Exception as e:
            logger.error(f"Error in chat method: {str(e)}")
            return {
                "message": "An error occurred. Please try again.",
                "mood": None,
                "recommendations": [],
                "escalate": False,
                "safety_alert": {},
                "session_id": session_id,
                "task_complexity": None
            }

    async def chat_stream(self, message: str, 
                          user_id: int, 
                          user_name: str,
                          session_id: str = None):
        """Enhanced streaming with session management and task routing."""
        try:
            # Get or create session
            final_session_id = self.session_manager.get_or_create_session(
                user_id, user_name, session_id
            )
            
            # Quick complexity assessment for streaming strategy
            dummy_state = State(user_id=user_id, user_name=user_name, session_id=final_session_id)
            complexity = self._classify_task_complexity(message, dummy_state)
            safety_alert = self._detect_crisis_indicators(message, dummy_state)
            
            if safety_alert.immediate_action_required:
                # Crisis - provide immediate response
                crisis_response = get_crisis_response(user_name)
                
                for char in crisis_response:
                    yield char
                    await asyncio.sleep(0.02)
                return
            
            # For non-crisis situations, process normally but with optimized delay based on complexity
            config = {"configurable": {"thread_id": final_session_id}}
            
            session_data = self.session_manager.get_session(final_session_id)
            initial_safety_score = session_data.get('safety_score', 0) if session_data else 0
            
            initial_state = {
                "messages": [HumanMessage(content=message)],
                "user_id": user_id,
                "user_name": user_name,
                "session_id": final_session_id,
                "safety_score": initial_safety_score
            }

            final_state = self.app.invoke(initial_state, config)
            last_message = final_state["messages"][-1]
            
            if isinstance(last_message, AIMessage) and last_message.content:
                # Adjust streaming speed based on complexity
                delay = {
                    "simple": 0.005,    # Very fast for simple responses
                    "moderate": 0.01,   # Normal speed  
                    "complex": 0.015    # Slightly slower for complex responses
                }.get(complexity.level, 0.01)
                
                for char in last_message.content:
                    yield char
                    await asyncio.sleep(delay)
            
            # Update session
            self.session_manager.update_session(final_session_id, {
                'safety_score': final_state.get('safety_score', initial_safety_score),
                'last_message': message,
                'last_response': last_message.content
            })
            
        except Exception as e:
            logger.error(f"Error in chat_stream: {str(e)}")
            fallback_msg = f"Hi {user_name}, I'm here to support you. Let's talk about how you're feeling."
            for char in fallback_msg:
                yield char
                await asyncio.sleep(0.01)
    
    def provide_session_to_user(self,user_id: int, user_name: str) -> str:
        """Create and return a new session ID for the user."""
        try:
            return self.session_manager.create_session(user_id, user_name)
        except Exception as e:
            logger.error(f"Error creating session for user {user_id}: {str(e)}")
            return ""

    def close(self):
        """Close database connections."""
        try:
            if hasattr(self, 'mongo_client'):
                self.mongo_client.close()
                logger.info("MongoDB connection closed")
        except Exception as e:
            logger.error(f"Error closing connections: {str(e)}")