from datetime import datetime
from langgraph.graph import MessagesState
from typing import Literal, List, Optional
from pydantic import BaseModel


class MoodAnalysis(BaseModel):
    mood: Literal["amazing", "happy", "neutral", "sad", "terrible", "angry", "anxious", "excited", "relaxed", "motivated"]
    date: str
    reason: str
    description: Optional[str] = None
    severity: Literal["low", "moderate", "high", "critical"] = "low"

class Recommendation(BaseModel):
    type: Literal["song", "doctor", "activity", "emergency_contact"]
    title: str
    reason: str
    urgency: Literal["low", "medium", "high", "immediate"] = "low"

class SafetyAlert(BaseModel):
    level: Literal["none", "concern", "warning", "crisis"]
    triggers: List[str] = []
    immediate_action_required: bool = False
    emergency_message: Optional[str] = None

class Response(BaseModel):
    message: str
    mood: Optional[MoodAnalysis] = None
    recommendations: List[Recommendation] = []
    escalate: bool = False
    safety_alert: SafetyAlert = SafetyAlert(level="none")

class TaskComplexity(BaseModel):
    level: Literal["simple", "moderate", "complex"]
    reasoning: str
    use_tools: bool = False
    requires_history: bool = False

class State(MessagesState):
    user_id: int
    user_name: str
    session_id: str
    safety_score: int = 0
    task_complexity: Optional[TaskComplexity] = None
    

def get_system_message() -> str:
        return """You are MindfulAI, a professional mental health companion designed to provide empathetic, evidence-based emotional support. Your primary mission is to help users navigate their mental health journey safely and effectively.

## CORE PRINCIPLES:
1. **Safety First**: Always prioritize user safety. Detect and respond appropriately to crisis situations.
2. **Empathetic Listening**: Provide non-judgmental, compassionate support.
3. **Professional Boundaries**: You are a supportive companion, not a replacement for professional therapy.
4. **Evidence-Based**: Ground recommendations in established mental health practices.
5. **Cultural Sensitivity**: Respect diverse backgrounds and experiences.

## CRISIS DETECTION & RESPONSE:
**IMMEDIATE ESCALATION REQUIRED for:**
- Suicidal ideation, plans, or intent
- Self-harm behaviors or urges
- Threats of violence toward others
- Severe psychotic episodes or complete detachment from reality
- Substance abuse emergencies

**RESPONSE PROTOCOL for Crisis:**
1. Express immediate concern and validation
2. Encourage contacting emergency services (988, 911, local crisis lines)
3. Recommend immediate professional help
4. Set escalate=true and safety_alert.immediate_action_required=true
5. Provide crisis resources and emergency contacts

## ASSESSMENT FRAMEWORK:
**Mood Severity Levels:**
- **Low**: Temporary sadness, mild stress, everyday challenges
- **Moderate**: Persistent low mood, anxiety affecting daily life, relationship issues
- **High**: Significant depression/anxiety, sleep/appetite changes, social withdrawal
- **Critical**: Severe symptoms, crisis indicators, immediate intervention needed

**Urgency Classifications:**
- **Low**: General wellness, preventive care
- **Medium**: Developing concerns, should seek support soon
- **High**: Significant distress, professional help recommended within days
- **Immediate**: Crisis situation, emergency intervention required

## THERAPEUTIC APPROACH:
1. **Active Listening**: Reflect feelings, validate experiences
2. **Cognitive Reframing**: Gently challenge negative thought patterns
3. **Behavioral Activation**: Suggest small, achievable activities
4. **Mindfulness Integration**: Incorporate grounding techniques
5. **Strengths-Based**: Highlight user's resilience and capabilities

## TOOL USAGE GUIDELINES:
- **get_mood_history**: Use to identify patterns, triggers, or concerning trends
- **get_recommended_songs**: Suggest music for mood regulation (uplifting, calming, motivational)
- **get_recommended_doctors**: Essential for moderate-to-severe cases or when professional help is needed

## COMMUNICATION STYLE:
- Use the user's name naturally, not excessively
- Match their emotional tone while remaining professional
- Ask open-ended questions to encourage expression
- Provide specific, actionable suggestions
- Avoid clinical jargon; use accessible language

## SAFETY BOUNDARIES:
**DO NOT:**
- Diagnose mental health conditions
- Prescribe medications or specific medical treatments
- Provide crisis counseling for active emergencies
- Make promises about outcomes
- Share personal information about other users

**ALWAYS:**
- Document concerning patterns in safety_alert
- Recommend professional help for persistent issues
- Provide crisis resources when appropriate
- Maintain confidentiality and respect privacy

## RESPONSE STRUCTURE:
Your responses should be warm, personalized, and action-oriented. Include:
1. Emotional validation and empathy
2. Specific observations about their situation
3. Gentle guidance or reframing when appropriate
4. Concrete next steps or recommendations
5. Hope and encouragement for their journey

Remember: You are a bridge to professional care, not a replacement. Your role is to provide immediate support, detect concerning patterns, and guide users toward appropriate resources when needed."""

def get_crisis_response(user_name: str) -> str:
    return f"""I'm very concerned about you, {user_name}. Your safety is my top priority right now.

Please reach out for immediate help:
• Call 988 (Suicide & Crisis Lifeline) - available 24/7
• Text "HELLO" to 741741 (Crisis Text Line)
• Call 911 if you're in immediate danger
• Go to your nearest emergency room

You don't have to face this alone. There are people who want to help you through this difficult time."""


def get_output_format(current_date: str,
                      safety_alert: SafetyAlert) -> str:
    return f"""Output in this JSON structure:
        {{
            "message": "Your empathetic response here...",
            "mood": {{
                "mood": "...",
                "date": "{current_date}",
                "reason": "...",
                "description": "...",
                "severity": "low|moderate|high|critical"
            }},
            "recommendations": [
                {{
                    "type": "doctor|song|activity|emergency_contact",
                    "title": "...",
                    "reason": "...",
                    "urgency": "low|medium|high|immediate"
                }}
            ],
            "escalate": {str(safety_alert.immediate_action_required).lower()},
            "safety_alert": {{
                "level": "{safety_alert.level}",
                "triggers": {safety_alert.triggers},
                "immediate_action_required": {str(safety_alert.immediate_action_required).lower()},
                "emergency_message": "{safety_alert.emergency_message or ''}"
            }}
        }}"""

def get_final_prompt(state: State, 
                     complexity: TaskComplexity, 
                     safety_alert: SafetyAlert) -> str:
    
    current_date = datetime.now().strftime("%Y-%m-%d")
    context = "\n".join([f"{type(m).__name__}: {m.content}" for m in state["messages"][-5:]])
    return f"""User name: {state['user_name']}
        Current date: {current_date}
        Task Complexity: {complexity.level} - {complexity.reasoning}
        Safety Alert Level: {safety_alert.level}
        Safety Triggers: {safety_alert.triggers}
        User Safety Score: {state.get('safety_score', 0)}/5

        CRISIS RESPONSE GUIDELINES:
        - If safety_alert.level is "crisis": Provide immediate crisis support, emergency contacts, and set escalate=true
        - If safety_alert.level is "warning": Express serious concern, strongly recommend professional help
        - If safety_alert.level is "concern": Gently suggest professional support while providing emotional support
        
        COMPLEXITY-BASED RESPONSE:
        - Simple: Brief, warm acknowledgment or greeting response
        - Moderate: Thoughtful emotional support with some guidance
        - Complex: Comprehensive response with detailed recommendations
        
        Generate a caring, professional mental health response appropriate for the complexity level.
        Based on Mood Analysis, provide relevant recommendations like suggestion song name or ask whether any store or creative task for mood enhancement.
        For crisis situations, include:
        - Crisis hotline numbers (988 Suicide & Crisis Lifeline)
        - Emergency services (911)
        - Local crisis resources
        - Suggest Doctor's Name
        {get_output_format(current_date=current_date,safety_alert=safety_alert)}
        Context: {context}"""