from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langgraph.checkpoint.mongodb import MongoDBSaver
from langgraph.graph import START, END, StateGraph
from langgraph.prebuilt import ToolNode
from typing import List, Optional, Dict, Any
import asyncio
import re
import json
import hashlib
from pymongo import MongoClient
from datetime import datetime

from app.config import get_logger
from app.model import get_chat_model
from app.tools import get_mood_history, get_recommended_doctors, get_recommended_songs
from app.db import get_database
from .helper import *

logger = get_logger(__name__)

class GeminiChatService:
    def __init__(self, mongo_uri: str = "mongodb://mindigo:1234@localhost:27017/", **kwargs):
        """Simplified, efficient chat service with four-tier model architecture."""
        try:
            # MongoDB setup
            self.mongo_client = MongoClient(mongo_uri)
            self.checkpointer = MongoDBSaver(
                client=self.mongo_client,
                db_name="mindigo_checkpoints"
            )
            
            # Database for message storage and session management
            self.db = get_database(mongo_uri)
            
            # Four-tier model architecture for cost/performance optimization
            self.models = {
                "lite": get_chat_model("gemini", model_name="gemini-1.5-flash-lite", **kwargs),      # Quick analysis
                "flash_lite": get_chat_model("gemini", model_name="gemini-2.0-flash-lite", **kwargs), # Simple responses
                "flash": get_chat_model("gemini", model_name="gemini-2.0-flash", **kwargs),           # Standard processing
                "pro": get_chat_model("gemini", model_name="gemini-2.5-flash", **kwargs)                # Complex/crisis cases
            }
            
            # Extensible tool registry
            self.tool_registry = {
                "core_tools": [get_recommended_doctors, get_mood_history, get_recommended_songs],
                "wellness_tools": [],  # Can add: breathing exercises, meditation guides, etc.
                "user_tools": [],      # Can add: user preferences, history, goals, etc.
                "crisis_tools": []     # Can add: emergency contacts, crisis resources, etc.
            }
            
            # Crisis detection patterns
            self.crisis_patterns = [
                'kill myself', 'end my life', 'suicide', 'want to die', 'better off dead',
                'hurt myself', 'self harm', 'cut myself', 'overdose', 'ending it all'
            ]
            
            self.system_message = get_system_message()
            self.app = self._build_efficient_graph()
            
            logger.info("GeminiChatService initialized with efficient architecture")
        except Exception as e:
            logger.error(f"Initialization error: {str(e)}")
            raise

    def _get_all_tools(self) -> List:
        """Get all tools from registry."""
        all_tools = []
        for tool_group in self.tool_registry.values():
            all_tools.extend(tool_group)
        return all_tools

    def preprocess_text(self, text: str) -> str:
        """Fast text preprocessing."""
        if not text:
            return ""
        
        # Basic cleanup
        text = re.sub(r'\s+', ' ', text.strip())
        text = re.sub(r'[!]{3,}', '!!', text)
        text = re.sub(r'[?]{3,}', '??', text)
        text = re.sub(r'[.]{4,}', '...', text)
        
        # Common chat abbreviations
        fixes = {
            r'\bu\b': 'you', r'\bur\b': 'your', r'\br\b': 'are',
            r'\bidk\b': "I don't know", r'\bomg\b': 'oh my god'
        }
        
        for pattern, replacement in fixes.items():
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        
        return text

    def quick_crisis_check(self, text: str) -> bool:
        """Fast crisis detection."""
        text_lower = text.lower()
        return any(pattern in text_lower for pattern in self.crisis_patterns)

    def _preprocess(self, state: State):
        """Preprocessing: clean text, crisis check, add system message."""
        try:
            user_message = state['messages'][-1].content if state['messages'] else ""
            
            # Clean the text
            cleaned_text = self.preprocess_text(user_message)
            state['messages'][-1] = HumanMessage(content=cleaned_text)
            
            # Quick crisis detection
            has_crisis = self.quick_crisis_check(cleaned_text)
            
            # Add system message for new conversations
            if len(state['messages']) == 1:
                sys_msg = SystemMessage(content=self.system_message)
                return {
                    "messages": [sys_msg] + state['messages'],
                    "has_crisis": has_crisis,
                    "processed_text": cleaned_text
                }
            
            return {
                "has_crisis": has_crisis,
                "processed_text": cleaned_text
            }
        except Exception as e:
            logger.error(f"Preprocessing error: {str(e)}")
            return state

    def _quick_analysis(self, state: State):
        """Use lite model for fast initial analysis."""
        try:
            # Use fastest model for analysis
            model = self.models["lite"]
            text = state.get('processed_text', '')
            
            prompt = f"""
            Analyze this message and respond in JSON format:
            
            Message: "{text}"
            
            {{
                "intent": "greeting|crisis|question|support|off_topic",
                "complexity": "simple|moderate|complex", 
                "needs_tools": "yes|no",
                "direct_answer": "yes|no",
                "sentiment": "positive|neutral|negative",
                "confidence": 0.8
            }}
            """
            
            response = model.invoke([HumanMessage(content=prompt)])
            analysis = self._parse_json_response(response.content)
            
            return {"analysis": analysis}
            
        except Exception as e:
            logger.error(f"Quick analysis error: {str(e)}")
            return {
                "analysis": {
                    "intent": "support",
                    "complexity": "moderate",
                    "needs_tools": "no", 
                    "direct_answer": "no",
                    "sentiment": "neutral",
                    "confidence": 0.5
                }
            }

    def _parse_json_response(self, response: str) -> Dict:
        """Extract JSON from model response."""
        try:
            # Find JSON in response
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end != 0:
                json_str = response[start:end]
                return json.loads(json_str)
        except:
            pass
        
        # Fallback
        return {
            "intent": "support",
            "complexity": "moderate",
            "needs_tools": "no",
            "direct_answer": "no", 
            "sentiment": "neutral",
            "confidence": 0.5
        }

    def _route_by_analysis(self, state: State):
        """Smart routing based on analysis."""
        try:
            has_crisis = state.get("has_crisis", False)
            analysis = state.get("analysis", {})
            
            # Crisis always gets priority
            if has_crisis or analysis.get("intent") == "crisis":
                return "crisis_handler"
            
            # Direct answers for simple cases
            if (analysis.get("direct_answer") == "yes" and 
                analysis.get("confidence", 0) >= 0.8 and
                analysis.get("needs_tools") == "no"):
                return "direct_response"
            
            # Tool-enhanced responses
            if analysis.get("needs_tools") == "yes":
                return "tool_response"
            
            # Complex cases need pro model
            if analysis.get("complexity") == "complex" or analysis.get("confidence", 0) < 0.7:
                return "complex_response"
            
            # Standard processing
            return "standard_response"
            
        except Exception as e:
            logger.error(f"Routing error: {str(e)}")
            return "standard_response"

    def _direct_response(self, state: State):
        """Handle simple cases with flash-lite model."""
        try:
            model = self.models["flash_lite"]
            analysis = state.get("analysis", {})
            text = state.get("processed_text", "")
            
            if analysis.get("intent") == "greeting":
                prompt = f"Provide a brief, warm mental health support greeting for: {text}"
            elif analysis.get("intent") == "off_topic":
                prompt = f"Politely redirect to mental health support: {text}"
            else:
                prompt = f"Provide brief supportive response: {text}"
            
            response = model.invoke([HumanMessage(content=prompt)])
            return {"messages": state["messages"] + [response]}
            
        except Exception as e:
            logger.error(f"Direct response error: {str(e)}")
            return state

    def _standard_response(self, state: State):
        """Standard processing with flash model."""
        try:
            model = self.models["flash"]
            response = model.invoke(state["messages"])
            return {"messages": state["messages"] + [response]}
        except Exception as e:
            logger.error(f"Standard response error: {str(e)}")
            return state

    def _tool_response(self, state: State):
        """Tool-enhanced response with flash model."""
        try:
            model = self.models["flash"]
            tools = self._get_all_tools()
            model_with_tools = model.bind_tools(tools)  # Using bind_tools for better control
            
            response = model_with_tools.invoke(state["messages"])
            return {"messages": state["messages"] + [response]}
        except Exception as e:
            logger.error(f"Tool response error: {str(e)}")
            return state

    def _complex_response(self, state: State):
        """Complex processing with pro model and tools."""
        try:
            model = self.models["pro"]
            tools = self._get_all_tools()
            model_with_tools = model.bind_tools(tools)
            
            response = model_with_tools.invoke(state["messages"])
            return {"messages": state["messages"] + [response]}
        except Exception as e:
            logger.error(f"Complex response error: {str(e)}")
            return state

    def _crisis_handler(self, state: State):
        """Crisis handling with pro model."""
        try:
            model = self.models["pro"]
            user_name = state.get('user_name', 'there')
            text = state.get('processed_text', '')
            
            prompt = f"""
            CRISIS SITUATION - IMMEDIATE RESPONSE NEEDED
            
            User: {user_name}
            Message: {text}
            
            Provide immediate crisis support:
            1. Express concern and validation
            2. Crisis resources (988, 911, text 741741)
            3. Encourage professional help
            4. Supportive but directive tone
            """
            
            response = model.invoke([HumanMessage(content=prompt)])
            return {"messages": state["messages"] + [response]}
            
        except Exception as e:
            logger.error(f"Crisis handler error: {str(e)}")
            fallback = get_crisis_response(state.get('user_name', 'there'))
            return {"messages": state["messages"] + [AIMessage(content=fallback)]}

    def _check_for_tools(self, state: State):
        """Check if tools were called."""
        try:
            last_msg = state["messages"][-1]
            if hasattr(last_msg, 'tool_calls') and last_msg.tool_calls:
                return "tools"
            return "safety_and_format"
        except Exception as e:
            logger.error(f"Tool check error: {str(e)}")
            return "safety_and_format"

    def _safety_and_format(self, state: State):
        """Final safety check and response formatting."""
        try:
            has_crisis = state.get("has_crisis", False)
            analysis = state.get("analysis", {})
            
            # Safety assessment
            safety_level = "crisis" if has_crisis else "none"
            if analysis.get("sentiment") == "negative":
                safety_level = "concern"
            
            safety_alert = SafetyAlert(
                level=safety_level,
                triggers=["crisis_pattern"] if has_crisis else [],
                immediate_action_required=has_crisis
            )
            
            # Update safety score
            current_score = state.get("safety_score", 0)
            new_score = min(current_score + (2 if has_crisis else 0), 5)
            
            # Format response using appropriate model
            model_choice = "pro" if has_crisis else "flash"
            model = self.models[model_choice]
            structured_model = model.with_structured_output(Response)
            
            complexity = TaskComplexity(
                level=analysis.get("complexity", "moderate"),
                reasoning=f"Analysis-based: {analysis.get('intent', 'support')}",
                use_tools=analysis.get("needs_tools") == "yes",
                requires_history=False
            )
            
            prompt = get_final_prompt(state, complexity, safety_alert)
            output: Response = structured_model.invoke(prompt)
            
            output.safety_alert = safety_alert
            output.escalate = has_crisis
            
            final_msg = AIMessage(
                content=output.message,
                additional_kwargs={"structured": output.dict()}
            )
            
            return {
                "messages": state["messages"] + [final_msg],
                "safety_score": new_score,
                "safety_alert": safety_alert
            }
            
        except Exception as e:
            logger.error(f"Safety and format error: {str(e)}")
            fallback = Response(
                message=f"Hi {state.get('user_name', 'there')}, I'm here to support you.",
                escalate=has_crisis
            )
            
            final_msg = AIMessage(
                content=fallback.message,
                additional_kwargs={"structured": fallback.dict()}
            )
            
            return {"messages": state["messages"] + [final_msg]}

    def _build_efficient_graph(self):
        """Build streamlined workflow graph."""
        try:
            workflow = StateGraph(state_schema=State)
            
            # Add nodes
            workflow.add_node("preprocess", self._preprocess)
            workflow.add_node("quick_analysis", self._quick_analysis)
            workflow.add_node("direct_response", self._direct_response)
            workflow.add_node("standard_response", self._standard_response)
            workflow.add_node("tool_response", self._tool_response)
            workflow.add_node("complex_response", self._complex_response)
            workflow.add_node("crisis_handler", self._crisis_handler)
            workflow.add_node("tools", ToolNode(self._get_all_tools()))
            workflow.add_node("safety_and_format", self._safety_and_format)
            
            # Build workflow
            workflow.add_edge(START, "preprocess")
            workflow.add_edge("preprocess", "quick_analysis")
            
            # Route based on analysis
            workflow.add_conditional_edges(
                "quick_analysis",
                self._route_by_analysis,
                {
                    "direct_response": "direct_response",
                    "standard_response": "standard_response",
                    "tool_response": "tool_response", 
                    "complex_response": "complex_response",
                    "crisis_handler": "crisis_handler"
                }
            )
            
            # All response nodes check for tools
            for node in ["direct_response", "standard_response", "tool_response", 
                        "complex_response", "crisis_handler"]:
                workflow.add_conditional_edges(
                    node,
                    self._check_for_tools,
                    {"tools": "tools", "safety_and_format": "safety_and_format"}
                )
            
            workflow.add_edge("tools", "safety_and_format")
            workflow.add_edge("safety_and_format", END)
            
            return workflow.compile(checkpointer=self.checkpointer)
            
        except Exception as e:
            logger.error(f"Graph building error: {str(e)}")
            raise

    def _generate_session_id(self, user_id: int) -> str:
        """Generate simple session ID."""
        timestamp = datetime.now().isoformat()
        raw_id = f"{user_id}_{timestamp}"
        return hashlib.md5(raw_id.encode()).hexdigest()

    def _get_or_create_session(self, user_id: int, user_name: str, session_id: str = None) -> str:
        """Get existing session or create new one using database."""
        if session_id:
            # Check if session exists in database
            session_info = self.db.get_session_info(session_id)
            if session_info:
                return session_id
        
        # Create new session ID
        new_session_id = self._generate_session_id(user_id)
        
        # Initialize session in database by updating metadata
        self.db.update_session_metadata(new_session_id, {
            "user_id": user_id,
            "user_name": user_name,
            "created_at": datetime.utcnow().isoformat()
        })
        
        return new_session_id

    def get_session(self, session_id: str) -> Optional[Dict]:
        """Retrieve session information directly from database."""
        try:
            return self.db.get_session_info(session_id)
        except Exception as e:
            logger.error(f"Error getting session {session_id}: {str(e)}")
            return None

    def get_user_sessions(self, user_id: int) -> List[Dict]:
        """Get all sessions for a user directly from database."""
        try:
            return self.db.get_user_sessions(user_id)
        except Exception as e:
            logger.error(f"Error getting user sessions for {user_id}: {str(e)}")
            return []

    def get_message_history(self, session_id: str, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """Get complete message history for a session with pagination."""
        try:
            offset = (page - 1) * per_page
            messages = self.db.get_message_history(session_id, limit=per_page, offset=offset)
            total_count = self.db.get_message_count(session_id)
            has_more = offset + per_page < total_count
            
            return {
                "messages": messages,
                "total_messages": total_count,
                "page": page,
                "per_page": per_page,
                "has_more": has_more
            }
        except Exception as e:
            logger.error(f"Error getting message history for {session_id}: {str(e)}")
            return {
                "messages": [],
                "total_messages": 0,
                "page": page,
                "per_page": per_page,
                "has_more": False
            }

    def get_recent_messages(self, session_id: str, count: int = 10) -> List[Dict]:
        """Get recent messages for context."""
        try:
            return self.db.get_recent_messages(session_id, count)
        except Exception as e:
            logger.error(f"Error getting recent messages for {session_id}: {str(e)}")
            return []

    def chat(self, message: str, 
             user_id: int, 
             user_name: str,
             session_id: str = None) -> Dict[str, Any]:
        """Enhanced chat interface with simplified session and message storage."""
        try:
            # Get or create session using database only
            final_session_id = self._get_or_create_session(user_id, user_name, session_id)
            
            config = {"configurable": {"thread_id": final_session_id}}
            
            # Get session data for safety score from database
            session_data = self.db.get_session_info(final_session_id)
            initial_safety_score = session_data.get('metadata', {}).get('safety_score', 0) if session_data else 0
            
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
            structured_data_raw = last_message.additional_kwargs.get("structured", {})
            
            # Convert Pydantic models to dictionaries if needed
            if hasattr(structured_data_raw, 'dict'):
                structured_data = structured_data_raw.dict()
            elif hasattr(structured_data_raw, 'model_dump'):
                structured_data = structured_data_raw.model_dump()
            else:
                structured_data = structured_data_raw
            
            # Store message in database
            try:
                metadata = {
                    "safety_score": final_state.get('safety_score', initial_safety_score),
                    "safety_alert": structured_data.get("safety_alert", {}),
                    "escalate": structured_data.get("escalate", False),
                    "mood": structured_data.get("mood"),
                    "recommendations": structured_data.get("recommendations", []),
                    "task_complexity": final_state.get("task_complexity", {}).dict() if final_state.get("task_complexity") else None
                }
                
                self.db.store_message(
                    session_id=final_session_id,
                    user_id=user_id,
                    user_name=user_name,
                    user_message=message,
                    ai_response=last_message.content,
                    metadata=metadata
                )
                
                # Update session metadata with latest safety score
                self.db.update_session_metadata(final_session_id, {
                    "safety_score": final_state.get('safety_score', initial_safety_score)
                })
                
            except Exception as e:
                logger.error(f"Failed to store message in database: {str(e)}")
            
            # Log safety concerns for monitoring
            safety_alert = structured_data.get("safety_alert", {})
            if safety_alert.get("level") in ["warning", "crisis"]:
                logger.warning(f"🚨 SAFETY ALERT for user {user_id}: {safety_alert}")
            
            return {
                "message": last_message.content,
                "mood": structured_data.get("mood"),
                "recommendations": self._format_recommendations(structured_data.get("recommendations", [])),
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
        """True streaming with immediate AI model response."""
        try:
            # Get or create session using database only
            final_session_id = self._get_or_create_session(user_id, user_name, session_id)
            
            # Quick crisis check for immediate response
            has_crisis = self.quick_crisis_check(message)
            
            if has_crisis:
                # Crisis - provide immediate response
                crisis_response = get_crisis_response(user_name)
                
                for char in crisis_response:
                    yield char
                    await asyncio.sleep(0.03)
                return
            
            # For real-time streaming, bypass complex workflow and use direct model streaming
            session_data = self.db.get_session_info(final_session_id)
            initial_safety_score = session_data.get('metadata', {}).get('safety_score', 0) if session_data else 0
            
            # Prepare messages for direct model call
            messages = [SystemMessage(content=self.system_message)]
            
            # Add recent context (last 5 messages)
            try:
                recent_messages = self.db.get_recent_messages(final_session_id, count=5)
                for msg_record in recent_messages:
                    messages.append(HumanMessage(content=msg_record['user_message']))
                    messages.append(AIMessage(content=msg_record['ai_response']))
            except Exception as e:
                logger.warning(f"Could not load recent messages: {str(e)}")
            
            # Add current message
            cleaned_message = self.preprocess_text(message)
            messages.append(HumanMessage(content=cleaned_message))
            
            # Quick analysis to choose model
            analysis = await self._quick_stream_analysis(cleaned_message)
            
            # Select appropriate model based on analysis
            model_choice = self._select_streaming_model(analysis, has_crisis)
            model = self.models[model_choice]
            
            # For tool-requiring cases, bind tools
            if analysis.get("needs_tools") == "yes":
                tools = self._get_all_tools()
                model = model.bind_tools(tools)
            
            # Stream directly from the model
            full_response = ""
            
            try:
                # Use model streaming directly
                async for chunk in model.astream(messages):
                    if hasattr(chunk, 'content') and chunk.content:
                        full_response += chunk.content
                        for char in chunk.content:
                            yield char
                            await asyncio.sleep(0.02)  # Slower for better readability
                
            except Exception as stream_error:
                logger.warning(f"Model streaming failed: {str(stream_error)}")
                # Fallback to synchronous call with character streaming
                response = model.invoke(messages)
                full_response = response.content if hasattr(response, 'content') else str(response)
                
                for char in full_response:
                    yield char
                    await asyncio.sleep(0.03)
            
            # Store the complete message after streaming
            asyncio.create_task(self._store_streamed_message(
                final_session_id, user_id, user_name, message, 
                full_response, analysis, initial_safety_score
            ))
            
        except Exception as e:
            logger.error(f"Error in chat_stream: {str(e)}")
            fallback_msg = f"Hi {user_name}, I'm here to support you. Let's talk about how you're feeling."
            for char in fallback_msg:
                yield char
                await asyncio.sleep(0.03)

    async def _quick_stream_analysis(self, text: str) -> Dict:
        """Fast analysis for streaming without complex workflow."""
        try:
            # Use lite model for quick analysis
            model = self.models["lite"]
            
            prompt = f"""Analyze this message quickly and respond in JSON:
            
            Message: "{text}"
            
            {{
                "intent": "greeting|crisis|question|support|off_topic",
                "complexity": "simple|moderate|complex",
                "needs_tools": "yes|no",
                "sentiment": "positive|neutral|negative"
            }}
            """
            
            response = await model.ainvoke([HumanMessage(content=prompt)])
            return self._parse_json_response(response.content)
            
        except Exception as e:
            logger.error(f"Quick stream analysis error: {str(e)}")
            return {
                "intent": "support",
                "complexity": "moderate", 
                "needs_tools": "no",
                "sentiment": "neutral"
            }

    def _select_streaming_model(self, analysis: Dict, has_crisis: bool) -> str:
        """Select appropriate model for streaming based on analysis."""
        if has_crisis or analysis.get("intent") == "crisis":
            return "pro"
        
        if analysis.get("complexity") == "complex" or analysis.get("needs_tools") == "yes":
            return "flash"
        
        if analysis.get("intent") == "greeting" or analysis.get("complexity") == "simple":
            return "flash_lite"
        
        return "flash"  # Default

    async def _store_streamed_message(self, session_id: str, user_id: int, user_name: str, 
                                    user_message: str, ai_response: str, analysis: Dict, 
                                    initial_safety_score: int):
        """Store message in background after streaming."""
        try:
            # Create metadata based on analysis
            metadata = {
                "safety_score": initial_safety_score,
                "safety_alert": {"level": "crisis" if self.quick_crisis_check(user_message) else "none"},
                "escalate": self.quick_crisis_check(user_message),
                "mood": analysis.get("sentiment", "neutral"),
                "streaming": True,
                "analysis": analysis
            }
            
            self.db.store_message(
                session_id=session_id,
                user_id=user_id,
                user_name=user_name,
                user_message=user_message,
                ai_response=ai_response,
                metadata=metadata
            )
            
            # Update session metadata
            self.db.update_session_metadata(session_id, {
                "safety_score": initial_safety_score
            })
            
        except Exception as e:
            logger.error(f"Failed to store streamed message: {str(e)}")
    
    def provide_session_to_user(self, user_id: int, user_name: str) -> str:
        """Create and return a new session ID for the user."""
        try:
            return self._get_or_create_session(user_id, user_name)
        except Exception as e:
            logger.error(f"Error creating session for user {user_id}: {str(e)}")
            return ""

    def close(self):
        """Close database connections."""
        try:
            if hasattr(self, 'mongo_client'):
                self.mongo_client.close()
                logger.info("MongoDB connection closed")
            if hasattr(self, 'db'):
                self.db.close()
                logger.info("Database connection closed")
        except Exception as e:
            logger.error(f"Error closing connections: {str(e)}")

    def _parse_json_response(self, content: str) -> Dict:
        """Parse JSON response from model, with fallback."""
        try:
            # Try to extract JSON from response
            import json
            import re
            
            # Look for JSON pattern
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                # Fallback if no JSON found
                return {
                    "intent": "support",
                    "complexity": "moderate",
                    "needs_tools": "no", 
                    "sentiment": "neutral"
                }
        except Exception:
            return {
                "intent": "support",
                "complexity": "moderate",
                "needs_tools": "no",
                "sentiment": "neutral"
            }

    def _format_recommendations(self, recommendations) -> List[str]:
        """Convert Recommendation objects to strings for API response."""
        try:
            formatted = []
            for rec in recommendations:
                if isinstance(rec, dict):
                    # Handle dictionary format (from structured output)
                    rec_type = rec.get("type", "activity")
                    title = rec.get("title", "Recommendation")
                    reason = rec.get("reason", "")
                    urgency = rec.get("urgency", "low")
                    
                    if rec_type == "song":
                        formatted.append(f"🎵 Listen to: {title} ({reason})")
                    elif rec_type == "doctor":
                        formatted.append(f"👩‍⚕️ Consider: {title} - {reason}")
                    elif rec_type == "activity":
                        formatted.append(f"🎯 Try this: {title} - {reason}")
                    elif rec_type == "emergency_contact":
                        formatted.append(f"🚨 Emergency: {title} - {reason}")
                    else:
                        formatted.append(f"{title}: {reason}")
                        
                elif hasattr(rec, 'title') and hasattr(rec, 'reason'):
                    # Handle Recommendation object instances
                    rec_type = getattr(rec, 'type', 'activity')
                    
                    if rec_type == "song":
                        formatted.append(f"🎵 Listen to: {rec.title} ({rec.reason})")
                    elif rec_type == "doctor":
                        formatted.append(f"👩‍⚕️ Consider: {rec.title} - {rec.reason}")
                    elif rec_type == "activity":
                        formatted.append(f"🎯 Try this: {rec.title} - {rec.reason}")
                    elif rec_type == "emergency_contact":
                        formatted.append(f"🚨 Emergency: {rec.title} - {rec.reason}")
                    else:
                        formatted.append(f"{rec.title}: {rec.reason}")
                else:
                    # Fallback for any other format
                    formatted.append(str(rec))
            
            return formatted
        except Exception as e:
            logger.error(f"Error formatting recommendations: {str(e)}")
            return []