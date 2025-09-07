# GenAI Service: AI-Powered Mental Health Companion

## Purpose
GenAI Service is a backend API designed to provide empathetic, evidence-based mental health support using advanced AI models (Google Gemini, OpenAI, LangChain, etc.). It offers:
- AI-powered chat for mental health support
- Mood analysis and recommendations (music, doctors, activities)
- Crisis detection and escalation for user safety
- Logging of safety alerts for compliance and monitoring

The service is built with FastAPI and integrates with service discovery (Eureka) and remote configuration (Spring Config). It is intended as a bridge to professional care, not a replacement for therapy.

## Setup Instructions

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd backend/services/genai-service
```

### 2. Create a Virtual Environment (Recommended)
```sh
python -m venv .venv
.venv\Scripts\activate  # On Windows
# Or
source .venv/bin/activate  # On Linux/Mac
```

### 3. Install Dependencies
```sh
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the project root. You will need API keys for Google Gemini, OpenAI, and LangSmith. Example keys you need to set:
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `LANGSMITH_API_KEY`

**How to get the keys:**
- **OpenAI API Key:** Sign up at [OpenAI](https://platform.openai.com/) and generate an API key from your account dashboard.
- **Google Gemini API Key:** Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to create and manage Gemini API keys.
- **LangSmith API Key:** Register at [LangSmith](https://smith.langchain.com/) and obtain your API key from the dashboard.

Do not share your API keys publicly. Never commit them to version control.

### 5. Run the Service
```sh
python main.py
```
The service will start on the port specified in your environment/configuration (default: 8000).

## API Endpoints
- `GET /health` — Health check endpoint
- `POST /chat` — Main chat endpoint for mental health support
- `POST /chat/stream` — Streaming chat responses

## Notes
- Safety alerts are logged to `safety_alerts.log` for monitoring.
- The service is not a replacement for professional mental health care.
- For production, configure Eureka and Spring Config as needed.

## License
[Add your license here]
