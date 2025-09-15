from langgraph.graph import START, END, StateGraph
from langgraph.graph import MessagesState
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.mongodb import MongoDBSaver
from typing import List, Literal, Optional
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
from langgraph.graph.message import add_messages
import numpy as np
from pydantic import BaseModel
from random import choice
from pymongo import MongoClient

from app.model.text_classifier_predictor import TextClassifierPredictor
from app.model.paragraph_preprocessor import ParagraphPreprocessor
from app.config.logger_config import get_logger
from app.model.model_gen import get_gemini_model
from app.tools.chat_agent_tools import get_mood_history, get_recommended_doctors, get_recommended_songs, get_breathing_exercise_data
import json

logger = get_logger(__name__)

class State(MessagesState):
    user_id: int
    user_name: str
    session_id: str
    preprocessed_result: List[str] | None = None
    clean_text: str | None = None
    predicted_category: str | None = None
    prediction_confidence: float | None = None
    has_crisis: bool | None = None
    needs_creative_response: bool = False
    tool_calls_made: bool = False

class Recommendation(BaseModel):
    type: Literal["song", "doctor", "breathing_exercise", "emergency_contact", "mood_insight"]
    title: str
    reason: str
    urgency: Literal["low", "medium", "high", "immediate"] = "low"
    
class Response(BaseModel):
    message: str
    recommendations: List[Recommendation] = []
    escalate: bool = False
    safety_alert: str = "none"

class MindigoAIAgent: 
    def __init__(self, mongo_client: Optional[MongoClient] = None):
        try:
            self.predictor = TextClassifierPredictor()
        except Exception as e:
            logger.error(f"Failed to initialize predictor: {str(e)}")
        
        self.preprocessor = ParagraphPreprocessor()
        self.threshold = 0.80
        
        # Setup checkpointer based on mongo_client availability
        if mongo_client:
            self.checkpointer = MongoDBSaver(mongo_client, "mindigo_checkpoints")
            logger.info("Using MongoDB checkpointer")
        else:
            self.checkpointer = MemorySaver()
            logger.info("Using Memory checkpointer")
        
        # Define all available tools
        self.available_tools = [get_mood_history, get_recommended_doctors, get_recommended_songs, get_breathing_exercise_data]
        self.tool_node = ToolNode(self.available_tools)
        
        # Crisis-specific tools (limited for immediate response)
        self.crisis_tools = [get_recommended_doctors, get_recommended_songs]
        self.crisis_tool_node = ToolNode(self.crisis_tools)
        
        self.app = self._build_graph()
    
    def _load_conversation_history(self, state: State) -> State:
        """Load and clean previous conversation history - keep only human and final AI messages"""
        # Skip history loading for now to eliminate the error
        # The conversation context will be maintained naturally through the checkpointer
        # during the actual graph execution
        logger.debug("Skipping explicit history loading - relying on natural checkpointer behavior")
        return state
    
    def _get_system_prompt(self, state: State) -> str:
        """Simple system prompt without context bleeding"""
        user_name = state.get("user_name", "User")
        user_id = state.get("user_id", "unknown")
        
        return f"""You are Mindigo, a compassionate mental health AI assistant for {user_name} (ID: {user_id}).

AVAILABLE TOOLS:
- get_mood_history: Get user's mood patterns and insights (use when user asks about mood analysis, mood insights, mood patterns, how they've been feeling, mood tracking, emotional state analysis)
- get_recommended_doctors: Find mental health professionals (use for crisis situations or when user requests professional help)
- get_recommended_songs: Suggest mood-appropriate music (use when user asks for music recommendations, songs, or audio therapy)
- get_breathing_exercise_data: Get personalized breathing exercises (use when user mentions stress, anxiety, panic, or requests breathing exercises)

CRITICAL: When calling tools, use the EXACT user_id {user_id} for this user.

CORE PRINCIPLES:
- Use tools when they can provide helpful, personalized information
- Provide specific recommendations and insights when possible
- Keep responses warm but informative

CRISIS INDICATORS: suicidal thoughts, self-harm, immediate danger
- Immediately call get_recommended_doctors
- Set escalate=true, safety_alert="crisis"

IMPORTANT: Be proactive in using tools to provide personalized help and insights."""

    def _preprocess_input(self, state: State) -> State:
        """Preprocess user input and load context"""
        # First load conversation history
        state = self._load_conversation_history(state)
        
        # Then preprocess current message
        text = state["messages"][-1].content
        processed_paragraph = self.preprocessor.process_paragraph(text)
        state["preprocessed_result"] = processed_paragraph.sentences
        state["clean_text"] = processed_paragraph.cleaned_text
        return state

    def _retrieve_sentiment(self, state: State) -> State:
        """Get sentiment analysis with crisis detection"""
        LABEL_IMPORTANCE = {'kill': 4, 'language': 3, 'normal': 2, 'greet': 1}
        
        if state["preprocessed_result"]:
            sentences = state["preprocessed_result"]
        else:
            text = state["messages"][-1].content
            sentences = self.preprocessor.get_sentences_only(text)
    
        if not sentences:
            state["predicted_category"] = 'normal'
            state["prediction_confidence"] = 0.0
            return state

        categories = []
        confidences = []

        for sentence in sentences:
            result = self.predictor.predict_with_confidence(sentence)
            categories.append(result['predicted_category'])
            confidences.append(result['confidence'])
        
        category_to_conf = {}
        for cat, conf in zip(categories, confidences):
            category_to_conf.setdefault(cat, []).append(conf)

        category_scores = {}
        for cat, conf_list in category_to_conf.items():
            avg_conf = sum(conf_list) / len(conf_list)
            score = LABEL_IMPORTANCE.get(cat, 0) * avg_conf
            category_scores[cat] = score

        ultimate_category = max(category_scores, key=lambda k: category_scores[k])
        ultimate_confidence = np.mean(category_to_conf[ultimate_category]).item()

        logger.info(f"Predicted Category: {ultimate_category}, Confidence: {ultimate_confidence:.3f}")
        state["predicted_category"] = ultimate_category
        state["prediction_confidence"] = ultimate_confidence
        return state
    
    def _route_handler(self, state: State) -> str:
        """Route to appropriate handler based on sentiment and context"""
        prediction_confidence = state.get("prediction_confidence", 0.0)
        predicted_category = state.get("predicted_category", "normal")
        
        # Check if this is a first greeting (no context)
        has_context = len([m for m in state["messages"][:-1] if isinstance(m, (HumanMessage, AIMessage))]) > 0
        
        if predicted_category == "greet" and prediction_confidence >= self.threshold and not has_context:
            return "greet_handler"
        
        if predicted_category == "kill" and prediction_confidence >= self.threshold:
            return "crisis_handler"
        
        return "general_handler"

    def _greet_handler(self, state: State) -> State:
        """Handle initial greetings only"""
        user_name = state.get("user_name", "there")
        
        greetings = [
            f"Hi {user_name}! I'm Mindigo, here to support you. How are you feeling today?",
            f"Hello {user_name}! Good to see you. What's on your mind right now?",
            f"Hey {user_name}! I'm glad you're here. How can I help you today?",
        ]
        
        greet_message = choice(greetings)
        response = Response(
            message=greet_message, 
            recommendations=[], 
            escalate=False, 
            safety_alert="none"
        )
        
        state["messages"] = add_messages(
            state["messages"], 
            AIMessage(content=json.dumps(response.model_dump()))
        )
        return state
    
    def _crisis_handler(self, state: State) -> State:
        """Handle crisis situations"""
        user_name = state.get("user_name", "User")
        user_message = state.get("clean_text", state["messages"][-1].content)
        
        logger.info(f"🚨 CRISIS HANDLER activated for {user_name}")
        
        # Mark this as a crisis situation
        state["has_crisis"] = True
        state["tool_calls_made"] = True
        
        crisis_prompt = f"""CRISIS ALERT: {user_name} needs immediate help: "{user_message}"

You must:
1. Call get_recommended_doctors for professional help
2. Call get_recommended_songs with "calming" mood  
3. Provide empathetic support with emergency contacts (999)"""

        crisis_model = get_gemini_model(model_type="flash_lite", temperature=0.2).bind_tools(self.crisis_tools)
        
        try:
            crisis_response = crisis_model.invoke([
                SystemMessage(content=self._get_system_prompt(state)),
                HumanMessage(content=crisis_prompt)
            ])
            state["messages"] = add_messages(state["messages"], crisis_response)
        except Exception as e:
            logger.error(f"Error in crisis handler: {e}")
            fallback_msg = AIMessage(content=f"{user_name}, I'm here to help. Please call 999 immediately.")
            state["messages"] = add_messages(state["messages"], fallback_msg)
        
        return state
    
    def _general_handler(self, state: State) -> State:
        """Simple general handler - no context bleeding"""
        user_message = state.get("clean_text", state["messages"][-1].content)
        
        # Smart prompt for better tool usage
        prompt = f"""User message: "{user_message}"

Analyze this request and determine which tools would be helpful:

WHEN TO USE TOOLS:
- Mood analysis/insights/patterns/tracking → get_mood_history
- Music/song recommendations → get_recommended_songs  
- Stress/anxiety/breathing help → get_breathing_exercise_data
- Mental health professional help → get_recommended_doctors
- Crisis/self-harm/suicidal thoughts → get_recommended_doctors (URGENT)

For this message, determine if any tools would provide valuable personalized information to help the user.
If yes, call the appropriate tools first, then provide a comprehensive response.
For creative requests (stories, scenarios), indicate "CREATIVE_MODE_NEEDED" in your response."""

        general_model = get_gemini_model(model_type="flash", temperature=0.4).bind_tools(self.available_tools)
        
        try:
            general_response = general_model.invoke([
                SystemMessage(content=self._get_system_prompt(state)),
                HumanMessage(content=prompt)
            ])
            
            state["messages"] = add_messages(state["messages"], general_response)
            
            if hasattr(general_response, 'tool_calls') and general_response.tool_calls:
                state["tool_calls_made"] = True
            
            if hasattr(general_response, 'content') and "creative_mode_needed" in general_response.content.lower():
                state["needs_creative_response"] = True
            
        except Exception as e:
            logger.error(f"Error in general handler: {e}")
            user_name = state.get("user_name", "User")
            fallback_msg = AIMessage(content=f"I understand, {user_name}. Let me help you with that.")
            state["messages"] = add_messages(state["messages"], fallback_msg)
        
        return state
    
    def _creative_handler(self, state: State) -> State:
        """Handle creative requests simply"""
        user_name = state.get("user_name", "User")
        user_message = state.get("clean_text", state["messages"][-1].content)
        
        # Extract any tool data from recent messages
        tool_data = []
        for msg in state["messages"]:
            if isinstance(msg, ToolMessage):
                tool_data.append(f"Tool: {msg.name} - {msg.content}")
        
        tool_context = "\n".join(tool_data) if tool_data else "No specific tool data available."
        
        creative_prompt = f"""Create a creative response for {user_name}'s request: "{user_message}"

Available data from recent tools: {tool_context}

Provide an engaging, creative response that uses any available tool data naturally."""

        creative_model = get_gemini_model(model_type="flash_pro", temperature=0.8)
        
        try:
            creative_response = creative_model.invoke([
                SystemMessage(content=self._get_system_prompt(state)),
                HumanMessage(content=creative_prompt)
            ])
            state["messages"] = add_messages(state["messages"], creative_response)
        except Exception as e:
            logger.error(f"Error in creative handler: {e}")
            fallback_msg = AIMessage(content=f"I appreciate your creativity, {user_name}. Let me think about that...")
            state["messages"] = add_messages(state["messages"], fallback_msg)
        
        return state
    
    def _cleanup_messages(self, state: State) -> State:
        """Clean up messages to keep only human and final AI responses"""
        clean_messages = []
        
        for msg in state["messages"]:
            if isinstance(msg, HumanMessage):
                clean_messages.append(msg)
            elif isinstance(msg, AIMessage) and not hasattr(msg, 'tool_calls'):
                # Only keep final AI responses (structured JSON responses)
                try:
                    json.loads(msg.content)  # Verify it's a final structured response
                    clean_messages.append(msg)
                except:
                    pass  # Skip non-final responses
        
        state["messages"] = clean_messages
        logger.info(f"Cleaned messages: kept {len(clean_messages)} out of {len(state['messages'])} messages")
        return state

    def _needs_tools(self, state: State) -> str:
        """Check if we need to call tools"""
        last_message = state["messages"][-1]
        if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
            return "crisis_tools"
        return "final_response"
    
    def _needs_general_tools(self, state: State) -> str:
        """Check if general handler needs tools"""
        last_message = state["messages"][-1]
        if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
            return "general_tools"
        return "check_creative"
    
    def _check_creative_needed(self, state: State) -> str:
        """Check if creative handling is needed"""
        if state.get("needs_creative_response", False):
            return "creative_handler"
        return "final_response"
    
    def _generate_final_response(self, state: State) -> State:
        """Generate final structured response"""
        user_name = state.get("user_name", "User")
        predicted_category = state.get("predicted_category", "normal")
        confidence = state.get("prediction_confidence", 0.0)
        
        # Get recent tool data if any
        tool_data = []
        for msg in state["messages"]:  # Look at all messages, not just last 10
            if isinstance(msg, ToolMessage):
                # Don't truncate tool data - we need full context for proper analysis
                tool_data.append(f"Tool: {msg.name} - {msg.content}")
        
        tool_context = "\n".join(tool_data) if tool_data else "No tool data available."
        
        # Get the conversation for context
        conversation_msgs = []
        for msg in state["messages"]:
            if isinstance(msg, HumanMessage):
                conversation_msgs.append(f"Human: {msg.content}")
            elif isinstance(msg, AIMessage) and not hasattr(msg, 'tool_calls'):
                conversation_msgs.append(f"Assistant: {msg.content[:200]}")
        
        recent_conversation = "\n".join(conversation_msgs[-4:])  # Last 2 exchanges
        
        # Check for crisis situation from multiple sources
        is_crisis = (predicted_category == "kill" and confidence >= self.threshold) or state.get("has_crisis", False)
        
        if is_crisis:
            response_prompt = f"""Create CRISIS response JSON for {user_name}:
Conversation: {recent_conversation}

TOOL DATA WITH CRISIS RESOURCES:
{tool_context}

CRITICAL CRISIS RESPONSE REQUIREMENTS:
1. MANDATORY: Set escalate=true, safety_alert="crisis"
2. Extract specific doctor names and contact details from tool data
3. Create emergency recommendations with exact details from tools

SPECIFIC EXTRACTION RULES:
- IF doctor data present: Use actual doctor names like "Dr. Sarah Johnson - Mental Health Specialist"  
- IF song data present: Use actual calming song titles like "Weightless by Marconi Union"
- Always include emergency contact: "type": "emergency_contact", "title": "Call 999 Immediately"

Example format:
"recommendations": [
  {{"type": "emergency_contact", "title": "Call 999 Immediately", "urgency": "immediate"}},
  {{"type": "doctor", "title": "Dr. [ActualName] - [Specialty]", "urgency": "high"}},
  {{"type": "song", "title": "[ActualSongTitle]", "urgency": "medium"}}
]

Use empathetic message acknowledging their pain and directing to immediate professional help.
Return JSON with escalate=true, safety_alert="crisis", and specific resource recommendations."""
        else:
            response_prompt = f"""Create a helpful response JSON for {user_name} based on their request and available tool data.

User's original request: {state.get('clean_text', 'Not available')}
Recent conversation: {recent_conversation}

TOOL DATA ANALYSIS:
{tool_context}

CRITICAL INSTRUCTIONS:
You MUST extract specific details from the tool data above and use them in your recommendations.

IF tool data contains doctor information:
- Extract doctor names, specialties, and contact details
- Create "doctor" type recommendations with actual doctor names as titles
- Example: "type": "doctor", "title": "Dr. Sarah Johnson - Psychiatrist"

IF tool data contains song information:
- Extract song titles, artists, and reasons 
- Create "song" type recommendations with actual song titles as titles
- Example: "type": "song", "title": "Weightless by Marconi Union"

IF tool data contains mood history:
- Extract specific mood entries, dates, and patterns
- Create "mood_insight" type recommendations with actual findings
- Example: "type": "mood_insight", "title": "Recent mood pattern: 4 'terrible' days this week"

IF tool data contains breathing exercises:
- Extract specific technique names and instructions
- Create "breathing_exercise" type recommendations with actual technique names
- Example: "type": "breathing_exercise", "title": "Box Breathing (4-4-4-4)"

NEVER create generic recommendations. ALWAYS use the specific data from tools.
Set escalate=false, safety_alert="none" for non-crisis situations.

Return response in JSON format with detailed recommendations using actual tool data."""

        response_model = get_gemini_model(model_type="flash_lite").with_structured_output(Response)
        
        try:
            logger.info(f"📊 Final response prompt length: {len(response_prompt)} chars")
            logger.info(f"🔧 Tool context preview: {tool_context[:200]}...")
            
            structured_response = response_model.invoke(response_prompt)
            
            logger.info(f"✅ Structured response generated successfully")
            logger.info(f"📝 Message: {structured_response.message[:100]}...")
            logger.info(f"🎯 Recommendations count: {len(structured_response.recommendations)}")
            for i, rec in enumerate(structured_response.recommendations):
                logger.info(f"   {i+1}. {rec.type}: {rec.title}")
                
            response_content = json.dumps(structured_response.model_dump())
        except Exception as e:
            logger.error(f"Error generating structured response: {e}")
            logger.error(f"Response prompt was: {response_prompt[:500]}...")
            fallback_response = Response(
                message=f"I'm here to help you, {user_name}. How can I support you?",
                recommendations=[],
                escalate=is_crisis,
                safety_alert="crisis" if is_crisis else "none"
            )
            response_content = json.dumps(fallback_response.model_dump())
        
        state["messages"] = add_messages(state["messages"], AIMessage(content=response_content))
        return state
    
    def _build_graph(self):
        """Build the workflow graph"""
        workflow = StateGraph(State)
        
        # Add nodes
        workflow.add_node("preprocess", self._preprocess_input)
        workflow.add_node("sentiment", self._retrieve_sentiment)
        workflow.add_node("greet_handler", self._greet_handler)
        workflow.add_node("crisis_handler", self._crisis_handler)
        workflow.add_node("general_handler", self._general_handler)
        workflow.add_node("creative_handler", self._creative_handler)
        workflow.add_node("crisis_tools", self.crisis_tool_node)
        workflow.add_node("general_tools", self.tool_node)
        workflow.add_node("check_creative", lambda state: state)
        workflow.add_node("final_response", self._generate_final_response)
        workflow.add_node("cleanup", self._cleanup_messages)
        
        # Define edges
        workflow.add_edge(START, "preprocess")
        workflow.add_edge("preprocess", "sentiment")
        
        workflow.add_conditional_edges(
            source="sentiment",
            path=self._route_handler,
            path_map={
                "greet_handler": "greet_handler",
                "crisis_handler": "crisis_handler", 
                "general_handler": "general_handler"
            }
        )
        
        workflow.add_edge("greet_handler", "cleanup")
        
        workflow.add_conditional_edges(
            source="crisis_handler",
            path=self._needs_tools,
            path_map={
                "crisis_tools": "crisis_tools",
                "final_response": "final_response"
            }
        )
        
        workflow.add_edge("crisis_tools", "final_response")
        
        workflow.add_conditional_edges(
            source="general_handler",
            path=self._needs_general_tools,
            path_map={
                "general_tools": "general_tools",
                "check_creative": "check_creative"
            }
        )
        
        workflow.add_edge("general_tools", "check_creative")
        
        workflow.add_conditional_edges(
            source="check_creative",
            path=self._check_creative_needed,
            path_map={
                "creative_handler": "creative_handler",
                "final_response": "final_response"
            }
        )
        
        workflow.add_edge("creative_handler", "final_response")
        workflow.add_edge("final_response", "cleanup")
        workflow.add_edge("cleanup", END)
        
        return workflow.compile(checkpointer=self.checkpointer)
    
    def chat(self, 
             user_id: int, 
             user_name: str, 
             message: str, 
             session_id: str = None) -> Response:
        """Main chat interface with context management"""
        if not hasattr(self, 'predictor'):
            raise Exception("Predictor not initialized.")
        
        if not session_id:
            raise ValueError("Session ID is required for chat.")
        
        config = {"configurable": {"thread_id": session_id}}
        
        initial_state = {
            "messages": [HumanMessage(content=message)], 
            "user_id": user_id,
            "user_name": user_name,
            "session_id": session_id,
            "needs_creative_response": False,
            "tool_calls_made": False
        }
        
        try:
            final_state = self.app.invoke(initial_state, config=config)
            final_message = final_state.get('messages', [])[-1]
            
            if hasattr(final_message, 'content'):
                try:
                    response_data = json.loads(final_message.content)
                    response = Response(**response_data)
                    logger.info(f"Context-aware response for {user_name}: {response.message[:100]}...")
                    return response
                except json.JSONDecodeError:
                    return Response(
                        message=final_message.content,
                        recommendations=[],
                        escalate=False,
                        safety_alert="none"
                    )
            else:
                raise Exception("No content in final message")
                
        except Exception as e:
            logger.error(f"Error in chat processing: {str(e)}")
            return Response(
                message=f"I'm here to help you, {user_name}. Could you please try rephrasing that?",
                recommendations=[],
                escalate=False,
                safety_alert="none"
            )
    
    @DeprecationWarning
    def chat_legacy(self, user_id: int, user_name: str, message: str, session_id: str = None):
        """Legacy interface with context support"""
        if not hasattr(self, 'predictor'):
            raise Exception("Predictor not initialized.")
        
        if not session_id:
            raise ValueError("Session ID is required for chat.")
        
        config = {"configurable": {"thread_id": session_id}}
        
        initial_state = {
            "messages": [HumanMessage(content=message)], 
            "user_id": user_id,
            "user_name": user_name,
            "session_id": session_id,
            "needs_creative_response": False,
            "tool_calls_made": False
        }
        
        try:
            final_state = self.app.invoke(initial_state, config=config)
            return final_state
        except Exception as e:
            logger.error(f"Error in legacy chat processing: {str(e)}")
            fallback_response = Response(
                message=f"I'm here to help you, {user_name}. Could you please try rephrasing that?",
                recommendations=[],
                escalate=False,
                safety_alert="none"
            )
            return {
                "messages": [AIMessage(content=json.dumps(fallback_response.model_dump()))],
                "user_id": user_id,
                "user_name": user_name,
                "session_id": session_id
            }