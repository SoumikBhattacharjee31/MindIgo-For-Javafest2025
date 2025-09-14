# 📖 API Documentation – GenAi Service

## Base URL

```
/api/v1/genai/gemini
```

---

## 🟢 Health Check

### **GET** `/health`

Check if the service is running.

**Response (200)**

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

## 🆕 Create New Session

### **POST** `/session/new`

Create a new chat session for a user.

**Response (200)**

```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "session_id": "abc123"
  }
}
```

**Errors**

* `400` – Missing or invalid user information
* `500` – Internal server error while creating session

---

## 📜 Get Session History

### **GET** `/session/{session_id}`

Retrieve chat history for a given session with pagination.

**Query Parameters**

* `page` (default: `1`) → Page number
* `per_page` (default: `20`, max: `100`) → Messages per page

**Response (200)**

```json
{
  "success": true,
  "message": "Session history retrieved successfully",
  "data": {
    "messages": [
      {
        "sender": "user",
        "text": "I feel anxious",
        "timestamp": "2025-09-14T18:00:00Z"
      },
      {
        "sender": "ai",
        "text": "I understand. Let's try a calming exercise.",
        "timestamp": "2025-09-14T18:01:00Z"
      }
    ],
    "total_messages": 2,
    "page": 1,
    "per_page": 20,
    "has_more": false
  }
}
```

**Errors**

* `400` – Missing session ID or invalid pagination params
* `404` – Session not found
* `500` – Internal server error

---

## 💬 Chat with AI

### **POST** `/chat`

Send a message to the AI and get a response.

**Request Body**

```json
{
  "prompt": "I feel stressed and can't sleep.",
  "session_id": "abc123"
}
```

**Response (200)**

```json
{
  "success": true,
  "message": "Response generated successfully",
  "data": {
    "message": "I hear you. Let's try a deep breathing exercise to help you relax.",
    "recommendations": [
      {
        "type": "breathing_exercise",
        "title": "Box Breathing",
        "reason": "Helps calm stress and anxiety",
        "urgency": "low"
      }
    ],
    "escalate": false,
    "safety_alert": "none"
  }
}
```

**Errors**

* `400` – Missing or empty prompt, or missing session ID
* `500` – Internal server error

---

## 📦 Data Models

### **Recommendation**

```json
{
  "type": "song | doctor | breathing_exercise | emergency_contact | mood_insight",
  "title": "string",
  "reason": "string",
  "urgency": "low | medium | high | immediate"
}
```

### **Response**

```json
{
  "message": "string",
  "recommendations": [Recommendation],
  "escalate": "boolean",
  "safety_alert": "none | mild | crisis"
}
```

### **APIResponseClass**

```json
{
  "success": "boolean",
  "message": "string",
  "data": "any",
  "errorCode": "string | null"
}
```


