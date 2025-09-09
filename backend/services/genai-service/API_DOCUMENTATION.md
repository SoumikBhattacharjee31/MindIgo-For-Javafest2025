# MindIgo Chat API Documentation

## Overview
The MindIgo Chat API provides endpoints for creating mental health chat sessions, sending messages, and retrieving conversation history. This API supports both streaming and non-streaming chat modes with built-in safety features and crisis detection.

**Base URL**: `http://localhost:8000` (adjust for your deployment)

## Authentication
All endpoints require the following headers:
- `X-User-Id`: User's unique identifier (integer as string)
- `X-User-Name`: User's display name (string)
- `Content-Type`: `application/json` (for POST requests)

## Endpoints

### 1. Health Check
**GET** `/health`

Simple health check to verify service availability.

**Response:**
```json
{
  "success": true,
  "message": "Mental Health Service Active",
  "data": {
    "status": "healthy",
    "service": "genai-service"
  }
}
```

---

### 2. Create New Session
**POST** `/session/new`

Creates a new chat session for the user.

**Headers:**
```
X-User-Id: 123
X-User-Name: John Doe
```

**Response:**
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "session_id": "a1b2c3d4e5f6g7h8i9j0"
  }
}
```

**Error Responses:**
- `400`: Missing or invalid headers
- `500`: Session creation failed

---

### 3. Get Session History
**GET** `/session/{session_id}`

Retrieves paginated message history for a session.

**Headers:**
```
X-User-Id: 123
X-User-Name: John Doe
```

**Query Parameters:**
- `page` (optional): Page number, default = 1
- `per_page` (optional): Messages per page, default = 20, max = 100

**Example Request:**
```
GET /session/a1b2c3d4e5f6g7h8i9j0?page=1&per_page=20
```

**Response:**
```json
{
  "success": true,
  "message": "Session history retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "msg123",
        "session_id": "a1b2c3d4e5f6g7h8i9j0",
        "user_id": 123,
        "user_name": "John Doe",
        "user_message": "I'm feeling anxious today",
        "ai_response": "I understand you're feeling anxious. That's completely normal...",
        "timestamp": "2025-09-09T10:30:00Z",
        "metadata": {
          "safety_score": 1,
          "mood": "anxious",
          "recommendations": ["Try deep breathing", "Consider meditation"],
          "escalate": false
        }
      }
    ],
    "total_messages": 45,
    "page": 1,
    "per_page": 20,
    "has_more": true
  }
}
```

**Error Responses:**
- `400`: Invalid pagination parameters
- `404`: Session not found

---

### 4. Non-Streaming Chat
**POST** `/chat`

Send a message and receive a complete response (non-streaming).

**Headers:**
```
X-User-Id: 123
X-User-Name: John Doe
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "I'm feeling overwhelmed with work",
  "session_id": "a1b2c3d4e5f6g7h8i9j0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Response generated successfully",
  "data": {
    "res": "I hear that you're feeling overwhelmed with work. That's a very common experience...",
    "recommendations": [
      "Take regular breaks throughout the day",
      "Practice time management techniques",
      "Consider talking to your supervisor about workload"
    ],
    "escalate": false,
    "safety_alert": {
      "level": "none",
      "triggers": [],
      "immediate_action_required": false
    },
    "session_id": "a1b2c3d4e5f6g7h8i9j0"
  }
}
```

**Error Responses:**
- `400`: Missing prompt or session_id
- `500`: Processing error

---

### 5. Streaming Chat (Recommended for Frontend)
**POST** `/chat/stream`

Send a message and receive a streaming response with structured data objects.

**Headers:**
```
X-User-Id: 123
X-User-Name: John Doe
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "Can you help me with anxiety techniques?",
  "session_id": "a1b2c3d4e5f6g7h8i9j0"
}
```

**Response Format:**
The response is a text stream with JSON objects, each prefixed with `data: `. Parse each line to get structured data.

**Stream Response Types:**

1. **Text Content** (comes first):
```
data: {"type": "text", "content": "I"}
data: {"type": "text", "content": " understand"}
data: {"type": "text", "content": " you're"}
...
```

2. **Recommendations** (if available):
```
data: {"type": "recommendations", "content": ["Try deep breathing exercises", "Practice mindfulness meditation", "Use the 4-7-8 breathing technique"]}
```

3. **Safety Alert** (if triggered):
```
data: {"type": "safety_alert", "content": {"level": "concern", "triggers": ["anxiety_pattern"], "immediate_action_required": false}}
```

4. **Escalation Flag** (if crisis detected):
```
data: {"type": "escalate", "content": true}
```

5. **Mood Detection** (if available):
```
data: {"type": "mood", "content": "anxious"}
```

6. **Session ID**:
```
data: {"type": "session_id", "content": "a1b2c3d4e5f6g7h8i9j0"}
```

7. **Completion Marker**:
```
data: {"type": "complete", "content": "done"}
```

**Error Response:**
```
data: {"type": "error", "content": "An error occurred while processing your request"}
```

---

## Frontend Implementation Guide

### 1. Initialize Chat Session
```javascript
// Create new session
const response = await fetch('/session/new', {
  method: 'POST',
  headers: {
    'X-User-Id': userId,
    'X-User-Name': userName
  }
});
const { data } = await response.json();
const sessionId = data.session_id;
```

### 2. Load Chat History
```javascript
// Load existing messages
const response = await fetch(`/session/${sessionId}?page=1&per_page=20`, {
  headers: {
    'X-User-Id': userId,
    'X-User-Name': userName
  }
});
const { data } = await response.json();
const messages = data.messages;
const hasMore = data.has_more;
```

### 3. Streaming Chat Implementation
```javascript
async function sendStreamingMessage(prompt, sessionId) {
  const response = await fetch('/chat/stream', {
    method: 'POST',
    headers: {
      'X-User-Id': userId,
      'X-User-Name': userName,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt,
      session_id: sessionId
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  let messageText = '';
  let recommendations = [];
  let safetyAlert = null;
  let shouldEscalate = false;
  let mood = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          
          switch (data.type) {
            case 'text':
              messageText += data.content;
              updateMessageDisplay(messageText); // Update UI in real-time
              break;
              
            case 'recommendations':
              recommendations = data.content;
              displayRecommendations(recommendations);
              break;
              
            case 'safety_alert':
              safetyAlert = data.content;
              if (safetyAlert.level !== 'none') {
                handleSafetyAlert(safetyAlert);
              }
              break;
              
            case 'escalate':
              shouldEscalate = data.content;
              if (shouldEscalate) {
                showEscalationOptions();
              }
              break;
              
            case 'mood':
              mood = data.content;
              updateMoodIndicator(mood);
              break;
              
            case 'complete':
              onMessageComplete(messageText, recommendations, safetyAlert);
              return;
              
            case 'error':
              showErrorMessage(data.content);
              return;
          }
        } catch (e) {
          console.error('Failed to parse stream data:', e);
        }
      }
    }
  }
}
```

### 4. Error Handling
```javascript
function handleAPIError(response) {
  switch (response.status) {
    case 400:
      showError('Please check your input and try again');
      break;
    case 404:
      showError('Session not found. Please start a new conversation');
      break;
    case 500:
      showError('Service temporarily unavailable. Please try again later');
      break;
    default:
      showError('An unexpected error occurred');
  }
}
```

## Safety Features

### Crisis Detection
The API automatically detects crisis situations and will:
- Set `escalate: true` in responses
- Provide immediate crisis resources
- Log safety alerts for monitoring
- Use the most capable AI model for crisis responses

### Safety Alert Levels
- `none`: Normal conversation
- `concern`: Mild concern detected
- `warning`: Significant concern
- `crisis`: Immediate intervention needed

### Recommendations
The AI can provide contextual recommendations like:
- Breathing exercises
- Meditation techniques
- Professional help suggestions
- Coping strategies

## Rate Limiting & Best Practices

1. **Session Management**: Create one session per conversation, reuse for all messages
2. **Pagination**: Load history in chunks, implement infinite scroll
3. **Streaming**: Use streaming for real-time user experience
4. **Error Handling**: Implement retry logic with exponential backoff
5. **Safety**: Always handle escalation flags and safety alerts appropriately

## Example Chat Interface Flow

1. **App Start**: Create new session or restore existing
2. **Load History**: Get recent messages with pagination
3. **User Input**: Send message via streaming endpoint
4. **Real-time Display**: Show text as it streams
5. **Handle Metadata**: Process recommendations, safety alerts, mood
6. **Crisis Handling**: Show appropriate resources if escalation needed
7. **Session Management**: Persist session ID for conversation continuity

## Contact & Support

For technical issues or questions about this API, please contact the backend development team.
