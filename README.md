# MindIgo-For-Javafest2025
This project aims to develop a sophisticated and user-centric platform that empowers individuals to proactively manage and enhance their overall mental well-being.

# Meeting Service Frontend

This is the frontend for the meeting service microservice built with Next.js and React.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Running backend services (Spring Boot backend + Signaling server)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. **Start the WebRTC Signaling Server**
   ```bash
   cd signaling-server
   npm install
   npm start
   ```

## Key Dependencies

- **Next.js 14**: React framework
- **axios**: HTTP client for API calls
- **socket.io-client**: WebSocket client for real-time communication
- **tailwindcss**: Utility-first CSS framework

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

### For Users
- Request audio/video meetings with counselors
- View status of meeting requests
- Join accepted meetings
- Real-time WebRTC communication

### For Counselors
- Configure meeting availability (audio/video)
- View and manage incoming meeting requests
- Accept/reject requests with reasons
- Join meetings with clients
- View all meeting history

## API Integration

The frontend integrates with:

1. **Meeting Service Backend** (Spring Boot) - Port 8080
   - Meeting requests CRUD operations
   - Counselor settings management
   
2. **Auth Service** - Port 8080 (via gateway)
   - User authentication (cookie-based)
   - Counselor list retrieval

3. **Signaling Server** (Node.js) - Port 3001
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

- Backend services running on localhost:8080
- Signaling server running on localhost:3001
- Frontend running on localhost:3000

## Troubleshooting

1. **Camera/Microphone Access**: Ensure browser permissions are granted
2. **WebRTC Connection Issues**: Check firewall settings and STUN server connectivity
3. **API Errors**: Verify backend services are running and accessible
4. **Socket Connection**: Ensure signaling server is running on port 3001

## Development Notes

- The frontend uses cookie-based authentication - no additional auth handling needed
- All API calls use `withCredentials: true` for cookie transmission
- WebRTC implementation uses native RTCPeerConnection (no external libraries)
- Real-time updates via polling every 5 seconds for meeting requests