# MindIgo-For-Javafest2025

This project aims to develop a sophisticated and user-centric platform that empowers individuals to proactively manage and enhance their overall mental well-being.

## Architecture Overview

MindIgo is built using a microservices architecture with the following components:

### Backend Services (Spring Boot)
- **Appointment Service** - Port 8092: Manages appointment scheduling and bookings
- **Auth Service** - Port 8081: Handles user authentication and authorization
- **Config Server** - Port 8888: Centralized configuration management
- **Content Service** - Port 8086: Manages game, breathing exercise, mood data, sleep data 
- **Discussion Service** - Port 8093: Handles discussion forums and chat features
- **Eureka Server** - Port 8761: Service discovery and registry
- **File Server** - Port 8085: File upload, download, and management
- **Gateway Server** - Port 8080: API gateway and routing
- **GenAI Service** - Port 8100: AI-powered features and recommendations
- **Meeting Service** - Port 8091: Video/audio meeting management

### Frontend
- **Next.js Application** - Port 3000: User interface and client-side functionality

### Additional Services
- **Signaling Server** - WebRTC signaling for real-time communication
- **PostgreSQL Database** - Primary data storage
- **MongoDB** - Document storage for specific services
- **Redis** - Caching and session management

## Quick Start

### 1. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Config Server
CONFIG_SERVER_PORT=8888
CONFIG_SERVER_URL=http://localhost:8888

# Eureka Server  
EUREKA_HOSTNAME=localhost
EUREKA_SERVER_PORT=8761

# Eureka Client
EUREKA_SERVER_URL=http://localhost:8761/eureka

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mindigo
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# MongoDB
MONGO_URI=mongodb://localhost:27017/mindigo

# Auth Service & Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
AUTH_SERVICE_PORT=8081
JWT_SECRET=your_jwt_secret_key
FRONTEND_DOMAIN=http://localhost:3000

# Content Service
CONTENT_SERVICE_PORT=8086

# File Server & Supabase
FILE_SERVER_PORT=8085
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_BUCKET=your_supabase_bucket

# Gateway Server & Email
GATEWAY_SERVER_PORT=8080
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password

# Meeting Service
MEETING_SERVICE_PORT=8091

# Routine Service
ROUTINE_SERVICE_PORT=8092

# GenAI Service & AI APIs
GENAI_SERVICE_PORT=8100
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
LANGSMITH_API_KEY=your_langsmith_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_BASE_URL=https://api.elevenlabs.io/v1
ELEVENLABS_MODEL_ID=your_model_id
ELEVENLABS_VOICE_FILENAME=your_voice_file

# Application Settings
APP_NAME=MindIgo
HEALTH_CHECK_INTERVAL=30000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
SIGNALING_SERVER_URL=http://localhost:3001
```

### 2. Running the Application

#### Backend Services
Navigate to the backend directory and run all microservices using Docker Compose:

```bash
cd backend
docker-compose up -d
```

This will start all the Spring Boot microservices, databases, and supporting infrastructure.

#### Frontend Application  
In a separate terminal, start the Next.js frontend:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## Prerequisites

## Prerequisites

- Docker and Docker Compose
- Node.js (v18 or higher)
- npm or yarn
- Java 24 or higher (for local development)
- PostgreSQL (if not using Docker)
- MongoDB (if not using Docker)
- Redis (if not using Docker)

## Detailed Setup Instructions

### Backend Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/SoumikBhattacharjee31/MindIgo-For-Javafest2025.git
   cd MindIgo-For-Javafest2025
   ```

2. **Configure Environment Variables**
   - Copy the `.env` template above and fill in your actual values
   - Ensure all API keys and database credentials are properly set

3. **Start Backend Services**
   ```bash
   cd backend
   docker-compose up -d
   ```

   This will start:
   - All Spring Boot microservices
   - PostgreSQL database
   - MongoDB database  
   - Redis cache
   - Eureka service registry
   - Config server

### Frontend Setup

### Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Start the WebRTC Signaling Server**
   ```bash
   cd ../signaling-server
   npm install
   npm start
   ```

## Service Architecture

### Microservices Overview

| Service | Port | Description |
|---------|------|-------------|
| Config Server | 8888 | Centralized configuration management |
| Eureka Server | 8761 | Service discovery and registry |
| Gateway Server | 8080 | API gateway and load balancer |
| Auth Service | 8081 | Authentication and authorization |
| File Server | 8085 | File upload/download management |
| Content Service | 8086 | Content management system |
| Meeting Service | 8091 | Video/audio meeting coordination |
| Appointment Service | 8092 | Appointment scheduling |
| Discussion Service | 8093 | Chat and discussion forums |
| GenAI Service | 8100 | AI-powered features |
| Frontend | 3000 | Next.js web application |

### Database Configuration

- **PostgreSQL**: Primary relational database for user data, appointments, and structured content
- **MongoDB**: Document storage for flexible data like discussion threads and content metadata
- **Redis**: Caching layer for sessions, tokens, and frequently accessed data
- **ChromaDB**: vector database for AI embeddings and fast retrieval

## Key Dependencies & Technologies

### Backend
- **Spring Boot**: Microservices framework
- **Spring Cloud**: Service discovery, configuration, and gateway
- **PostgreSQL**: Primary database
- **MongoDB**: Document database
- **Redis**: Caching and session storage
- **Docker**: Containerization
- **Eureka**: Service registry

### Frontend
- **Next.js 14**: React framework
- **React**: UI library
- **axios**: HTTP client for API calls
- **socket.io-client**: WebSocket client for real-time communication
- **tailwindcss**: Utility-first CSS framework

### AI & External Services
- **OpenAI API**: AI-powered chat and content generation
- **Google API**: Additional AI services
- **ElevenLabs**: Text-to-speech services
- **Supabase**: File storage and additional backend services

## Project Structure

```
src/
├── app/
│   ├── user/
│   │   └── meeting/
│   │       └── page.tsx          # User meeting dashboard
│   └── counselor/
│       └── meeting/
│           └── page.tsx          # Counselor meeting dashboard
├── components/
│   ├── UserMeetingRequest.tsx    # Component for users to request meetings
│   ├── UserRequestsList.tsx      # Component showing user's meeting requests
│   ├── CounselorRequestsList.tsx # Component for counselors to manage requests
│   ├── CounselorSettings.tsx     # Component for counselor meeting settings
│   ├── MeetingLauncher.tsx       # Modal for launching meetings
│   └── MeetingRoom.tsx           # WebRTC meeting room component
└── api/
    ├── meetingService.js         # API calls to meeting service
    └── authService.js            # API calls to auth service
```

## Features

### Core Platform Features
- **User Authentication**: Secure registration and login system
- **Mental Health Dashboard**: Personalized user dashboard
- **Appointment Scheduling**: Book sessions with counselors
- **AI-Powered Recommendations**: Personalized mental health suggestions
- **Content Management**: Access to mental health resources
- **Discussion Forums**: Community support and interaction
- **File Management**: Secure document and media handling

### Meeting & Communication Features

#### For Users
- Request audio/video meetings with counselors
- View status of meeting requests
- Join accepted meetings
- Real-time WebRTC communication
- Chat functionality during meetings

#### For Counselors
- Configure meeting availability (audio/video)
- View and manage incoming meeting requests
- Accept/reject requests with reasons
- Join meetings with clients
- View all meeting history
- Access client files and notes

#### For Administrators
- User management
- Content moderation
- System monitoring
- Analytics and reporting

## API Integration

The frontend integrates with multiple backend services through the Gateway Server (Port 8080):

1. **Authentication Service** (Port 8081)
   - User registration and login
   - JWT token management
   - Session validation
   - Cookie-based authentication

2. **Meeting Service** (Port 8091)
   - Meeting requests CRUD operations
   - Counselor settings management
   - Video/audio call coordination
   
3. **Appointment Service** (Port 8092)
   - Appointment scheduling
   - Calendar management
   - Booking confirmations

4. **Content Service** (Port 8086)
   - Content management
   - Resource delivery
   - Media handling

5. **Discussion Service** (Port 8093)
   - Forum management
   - Chat functionality
   - Real-time messaging

6. **File Server** (Port 8085)
   - File upload/download
   - Image processing
   - Document management

7. **GenAI Service** (Port 8100)
   - AI-powered recommendations
   - Chatbot functionality
   - Content generation

8. **Signaling Server** (Node.js) - Port 3001
   - WebRTC signaling for audio/video calls
   - Socket.io for real-time communication

## WebRTC Meeting Features

- **Audio Meetings**: Voice-only communication
- **Video Meetings**: Audio + video communication
- **Controls**: Mute/unmute, video on/off, end meeting
- **Real-time Connection Status**: Shows connection state
- **Cross-browser Compatibility**: Works with modern browsers

## Authentication

Authentication is handled via cookies set by the backend gateway. The frontend includes credentials in all API requests:

```javascript
const axiosConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

## Environment Requirements

- **Backend Services**: All services running via Docker Compose on ports 8080-8100
- **Database**: PostgreSQL (Port 5432) and MongoDB (Port 27017)
- **Cache**: Redis (Port 6379)
- **Frontend**: Next.js application on Port 3000
- **Signaling Server**: WebRTC signaling on Port 3001
- **Service Discovery**: Eureka Server on Port 8761
- **Configuration**: Config Server on Port 8888

## Docker Deployment

### Production Deployment
```bash
cd backend
docker-compose -f docker-compose-prod.yml up -d
```

### Development Deployment
```bash
cd backend  
docker-compose up -d
```

### Building All Services
```bash
cd backend
# For Windows
./build-all.ps1

# For Linux/macOS
./build-all.sh
```

### Building and Pushing Docker Images
```bash
cd backend
# For Windows
./build-push-docker.ps1

# For Linux/macOS  
./build-push-docker.sh
```

## Troubleshooting

### Common Issues

1. **Services Not Starting**
   - Check if all required ports are available
   - Verify Docker is running and has sufficient resources
   - Check environment variables are properly configured

2. **Database Connection Issues**
   - Ensure PostgreSQL and MongoDB are running
   - Verify database credentials in environment variables
   - Check database initialization scripts have run

3. **Service Discovery Problems**
   - Verify Eureka Server is running on port 8761
   - Check service registration in Eureka dashboard
   - Ensure services can communicate with each other

4. **Frontend API Errors**
   - Verify Gateway Server is running on port 8080
   - Check CORS configuration
   - Ensure authentication cookies are being set

5. **WebRTC/Meeting Issues**
   - Ensure browser permissions are granted for camera/microphone
   - Check firewall settings and STUN server connectivity
   - Verify signaling server is running on port 3001

6. **AI Service Issues**
   - Verify OpenAI and other API keys are valid
   - Check API rate limits and quotas
   - Ensure GenAI service can connect to external APIs

### Monitoring and Health Checks

- **Eureka Dashboard**: `http://localhost:8761`
- **Gateway Health**: `http://localhost:8080/actuator/health`
- **Individual Service Health**: `http://localhost:<port>/actuator/health`

### Log Locations

- **Docker Logs**: `docker-compose logs <service-name>`
- **Service Logs**: Check individual service containers
- **Frontend Logs**: Browser developer console and terminal

## Development Notes

- **Authentication**: The frontend uses cookie-based authentication - no additional auth handling needed
- **API Communication**: All API calls use `withCredentials: true` for cookie transmission
- **Microservices**: Services communicate through Eureka service discovery
- **WebRTC**: Implementation uses native RTCPeerConnection (no external libraries)
- **Real-time Updates**: Polling every 5 seconds for meeting requests
- **Configuration**: Centralized configuration management through Config Server
- **Load Balancing**: Gateway Server handles routing and load balancing
- **Caching**: Redis used for session management and frequently accessed data

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the troubleshooting section above

## Acknowledgments

- Built for Javafest 2025
- Thanks to all contributors and the open-source community
- Special thanks to the mental health professionals who provided guidance