from langgraph.graph import START, END, StateGraph
from langgraph.graph import MessagesState
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.mongodb import MongoDBSaver
from typing import Optional
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langgraph.graph.message import add_messages
from pymongo import MongoClient
import json

from app.dto.response_models import Response, Recommendation
from app.model.paragraph_preprocessor import ParagraphPreprocessor
from app.config.logger_config import get_logger
from app.model.model_gen import get_gemini_model
from app.tools.chat_agent_tools import get_mood_history, get_recommended_doctors, get_recommended_songs, get_breathing_exercise_data
# from app.util.conversation_logger import ConversationLogger

logger = get_logger(__name__)

class State(MessagesState):
    user_id: int
    user_name: str
    session_id: str
    clean_text: str = ""

class MindigoAIAgent:
    def __init__(self, mongo_client: Optional[MongoClient] = None):
        self.preprocessor = ParagraphPreprocessor()
        # self.conversation_logger = ConversationLogger()
        
        if mongo_client:
            self.checkpointer = MongoDBSaver(mongo_client, "simple_agent_checkpoints")
        else:
            self.checkpointer = MemorySaver()
        
        # Available tools
        self.tools = [get_mood_history, get_recommended_doctors, get_recommended_songs, get_breathing_exercise_data]
        self.tool_node = ToolNode(self.tools)
        
        self.app = self._build_graph()
    
    def _preprocess_input(self, state: State) -> State:
        """Clean and preprocess user input"""
        text = state["messages"][-1].content
        processed = self.preprocessor.process_paragraph(text)
        state["clean_text"] = processed.cleaned_text
        return state
    
    def _trim_context(self, state: State) -> State:
        """Keep only essential conversation history to manage context"""
        messages = state["messages"]
        
        human_ai_messages = [msg for msg in messages if isinstance(msg, (HumanMessage, AIMessage))]
        
        if len(human_ai_messages) > 10:
            trimmed = [human_ai_messages[0]] + human_ai_messages[-8:]
            state["messages"] = trimmed
            logger.info(f"Trimmed context: kept {len(trimmed)} messages")
        
        return state
    
    def _generate_response(self, state: State) -> State:
        """Generate response using model with proper tool calling"""
        user_name = state.get("user_name", "User")
        user_id = state.get("user_id")
        clean_text = state.get("clean_text", "")
        
        conversation_context = ""
        human_ai_messages = [msg for msg in state["messages"] if isinstance(msg, (HumanMessage, AIMessage))]
        
        if len(human_ai_messages) > 1:
            recent_messages = human_ai_messages[-4:] 
            context_parts = []
            for msg in recent_messages[:-1]:
                if isinstance(msg, HumanMessage):
                    context_parts.append(f"User: {msg.content[:100]}")
                elif isinstance(msg, AIMessage):
                    try:
                        data = json.loads(msg.content)
                        context_parts.append(f"Assistant: {data.get('message', '')[:100]}")
                    except:
                        context_parts.append(f"Assistant: {msg.content[:100]}")
            
            conversation_context = "\n".join(context_parts)
        
        system_prompt = f"""You are Mindigo, an intelligent mental health AI assistant helping {user_name} (ID: {user_id}).

CONVERSATION CONTEXT:
{conversation_context}

CURRENT MESSAGE: "{clean_text}"

YOUR DECISION-MAKING ROLE:
You must analyze the user's message and make intelligent decisions about:
1. Whether to call tools (only if genuinely helpful for the user's needs)
2. Crisis assessment based on the severity and urgency of what they're sharing
3. What type of recommendations would be most beneficial
4. How to respond with empathy and appropriate action

AVAILABLE TOOLS - Use your judgment to decide when these would be helpful:

• get_mood_history(user_id, days=7): Call when user asks about mood patterns, emotional history, or wants to understand their mental health trends over time.

• get_recommended_songs(mood_category, count=5): Call when user wants music recommendations or mentions music helping their mood. Choose appropriate mood_category: "uplifting", "calming", "motivational".

• get_breathing_exercise_data(user_id): Call when user mentions stress, anxiety, panic, difficulty breathing, or wants relaxation techniques.

• get_recommended_doctors(specialty="mental_health"): Call when user needs professional help, mentions severe symptoms, or situation requires clinical intervention.

TOOL USAGE GUIDELINES:
- Only call tools when they provide genuine value to the user
- Don't call tools for casual greetings, general questions, or when the user just wants to talk
- Use the exact user_id {user_id} in all tool calls
- You can call multiple tools if the user's needs warrant it
- Consider the user's emotional state and what would be most helpful
- If unsure, prioritize empathy and understanding over tool usage
- There can be multiple recommendations from different tools

CRISIS ASSESSMENT:
Evaluate the severity of the user's situation:
- Look for expressions of hopelessness, self-harm ideation, suicidal thoughts, or immediate danger
- Consider not just keywords but context, tone, and overall emotional state
- If you assess this as a crisis, prioritize safety and professional help

RESPONSE REQUIREMENTS:
Be empathetic, specific to their situation, and action-oriented. Your goal is to provide genuine support and helpful resources."""

        model = get_gemini_model(model_type="flash", temperature=0.3).bind_tools(self.tools)
        
        try:
            response = model.invoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"User says: {clean_text}")
            ])
            
            state["messages"] = add_messages(state["messages"], response)
            return state
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            fallback = AIMessage(content="I'm here to help you. Could you tell me more about how you're feeling?")
            state["messages"] = add_messages(state["messages"], fallback)
            return state
    
    def _should_call_tools(self, state: State) -> str:
        """Check if we need to call tools"""
        last_message = state["messages"][-1]
        if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
            return "call_tools"
        return "finalize_response"
    
    def _finalize_response(self, state: State) -> State:
        """Create final structured response with model making all decisions"""
        user_name = state.get("user_name", "User")
        clean_text = state.get("clean_text", "")
        
        # Collect all tool results
        tool_results = []
        for msg in state["messages"]:
            if hasattr(msg, 'name') and hasattr(msg, 'content'):  # ToolMessage
                tool_results.append(f"{msg.name}: {msg.content}")
        
        tool_context = "\n".join(tool_results) if tool_results else "No tools were called"
        
        finalize_prompt = f"""Create a comprehensive Response JSON for {user_name} based on their message and any tool results.

USER MESSAGE: "{clean_text}"

TOOL RESULTS:
{tool_context}

COMPREHENSIVE RESPONSE INSTRUCTIONS:

1. CRISIS ASSESSMENT: Evaluate the user's emotional state and determine:
   - Is this a crisis requiring immediate professional help?
   - Set escalate=true and safety_alert="crisis" only if genuinely urgent
   - For mild concerns: safety_alert="mild", for normal situations: safety_alert="none"

2. MESSAGE CRAFTING: Write an empathetic, personalized response that:
   - Directly addresses their concerns
   - References specific information from tool results when available
   - Shows understanding of their emotional state
   - Provides hope and support

3. RECOMMENDATIONS: Extract and create specific recommendations from tool data:

   FROM MOOD HISTORY DATA:
   - type="mood_insight", title="[Specific pattern/insight]", reason="[What it means for them]"
   
   FROM SONG DATA:
   - type="song", title="[Actual song title]", reason="[Why this song helps their mood]"
   
   FROM BREATHING EXERCISE DATA:
   - type="breathing_exercise", title="[Specific technique name]", reason="[How it helps their situation]"
   
   FROM DOCTOR DATA:
   - type="doctor", title="[Doctor name and specialty]", reason="[Why they're a good fit]"
   
   FOR CRISIS SITUATIONS:
   - type="emergency_contact", title="Crisis Support", reason="Immediate help available", urgency="immediate"

4. URGENCY LEVELS: Set appropriate urgency for each recommendation:
   - "immediate": Crisis situations requiring urgent action
   - "high": Important for their wellbeing  
   - "medium": Helpful and recommended
   - "low": Optional but beneficial

5. MOOD-BASED PERSONALIZATION: If mood data is available, tailor recommendations to their emotional patterns and current needs.

Return a complete Response JSON with thoughtful message and specific recommendations extracted from the actual tool data provided."""
        
        # Use structured output model - keeping flash_pro for complex reasoning
        structured_model = get_gemini_model(model_type="flash_lite").with_structured_output(Response)
        
        try:
            structured_response = structured_model.invoke(finalize_prompt)
            response_json = json.dumps(structured_response.model_dump())
            
        except Exception as e:
            logger.error(f"Error creating structured response: {e}")
            # Fallback structured response - let model handle crisis assessment in main flow
            fallback_response = Response(
                message=f"I understand you're going through something difficult, {user_name}. I'm here to support you.",
                recommendations=[],
                escalate=False,
                safety_alert="none"
            )
            response_json = json.dumps(fallback_response.model_dump())
        
        # Replace last message with structured response
        state["messages"][-1] = AIMessage(content=response_json)
        return state
    
    def _build_graph(self):
        """Build simple workflow graph"""
        workflow = StateGraph(State)
        
        # Add nodes
        workflow.add_node("preprocess", self._preprocess_input)
        workflow.add_node("trim_context", self._trim_context)
        workflow.add_node("generate_response", self._generate_response)
        workflow.add_node("call_tools", self.tool_node)
        workflow.add_node("finalize_response", self._finalize_response)
        
        # Define flow
        workflow.add_edge(START, "preprocess")
        workflow.add_edge("preprocess", "trim_context")
        workflow.add_edge("trim_context", "generate_response")
        
        # Conditional edge for tool calling
        workflow.add_conditional_edges(
            source="generate_response",
            path=self._should_call_tools,
            path_map={
                "call_tools": "call_tools",
                "finalize_response": "finalize_response"
            }
        )
        
        workflow.add_edge("call_tools", "finalize_response")
        workflow.add_edge("finalize_response", END)
        
        return workflow.compile(checkpointer=self.checkpointer)
    
    def chat(self, user_id: int, user_name: str, message: str, session_id: str) -> Response:
        """Main chat interface"""
        if not session_id:
            raise ValueError("Session ID is required")
        
        config = {"configurable": {"thread_id": session_id}}
        
        initial_state = {
            "messages": [HumanMessage(content=message)],
            "user_id": user_id,
            "user_name": user_name,
            "session_id": session_id
        }
        
        try:
            # Run the workflow
            result = self.app.invoke(initial_state, config=config)
            
            # Extract final response
            final_message = result["messages"][-1]
            if hasattr(final_message, 'content'):
                try:
                    response_data = json.loads(final_message.content)
                    response = Response(**response_data)
                    
                    # Log the conversation
                    # self.conversation_logger.log_conversation(
                    #     user_id=user_id,
                    #     user_name=user_name,
                    #     session_id=session_id,
                    #     user_message=message,
                    #     agent_response=response
                    # )
                    
                    logger.info(f"Generated response for {user_name}: {len(response.recommendations)} recommendations, escalate={response.escalate}")
                    return response
                except json.JSONDecodeError as e:
                    logger.error(f"JSON decode error: {e}")
                    fallback_response = Response(
                        message=final_message.content,
                        recommendations=[],
                        escalate=False,
                        safety_alert="none"
                    )
                    # Log fallback response
                    # self.conversation_logger.log_conversation(
                    #     user_id=user_id,
                    #     user_name=user_name,
                    #     session_id=session_id,
                    #     user_message=message,
                    #     agent_response=fallback_response
                    # )
                    return fallback_response
            else:
                raise Exception("No content in final message")
                
        except Exception as e:
            logger.error(f"Error in chat: {e}")
            error_response = Response(
                message=f"I'm here to help you, {user_name}. Could you please try again?",
                recommendations=[],
                escalate=False,
                safety_alert="none"
            )
            # Log error response
            # self.conversation_logger.log_conversation(
            #     user_id=user_id,
            #     user_name=user_name,
            #     session_id=session_id,
            #     user_message=message,
            #     agent_response=error_response
            # )
            return error_response