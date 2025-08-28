import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const MeetingRoom = ({ meetingRoomId, meetingType, userRole, onEndMeeting }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState('');
  const [isInitiator, setIsInitiator] = useState(false);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    initializeMedia();
    initializeSocket();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const constraints = {
        video: meetingType === 'VIDEO',
        audio: true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Unable to access camera/microphone. Please check permissions.');
    }
  };

  const initializeSocket = () => {
    const socketConnection = io('http://localhost:3001', {
      withCredentials: true
    });
    
    socketConnection.emit('join-room', meetingRoomId);
    
    socketConnection.on('user-connected', () => {
      setIsInitiator(true);
      createPeerConnection(true);
    });
    
    socketConnection.on('user-joined', () => {
      createPeerConnection(false);
    });
    
    socketConnection.on('offer', async (offer) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socketConnection.emit('answer', answer, meetingRoomId);
      }
    });
    
    socketConnection.on('answer', async (answer) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });
    
    socketConnection.on('ice-candidate', async (candidate) => {
      if (peerConnection && candidate) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    });
    
    socketConnection.on('user-disconnected', () => {
      setIsConnected(false);
      setRemoteStream(null);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });
    
    setSocket(socketConnection);
  };

  const createPeerConnection = async (initiator) => {
    if (!localStream) return;
    
    const pc = new RTCPeerConnection(iceServers);
    
    // Add local stream to peer connection
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });
    
    // Handle remote stream
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', event.candidate, meetingRoomId);
      }
    };
    
    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setIsConnected(true);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsConnected(false);
      }
    };
    
    setPeerConnection(pc);
    
    // Create offer if initiator
    if (initiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', offer, meetingRoomId);
      } catch (err) {
        console.error('Error creating offer:', err);
        setError('Connection error occurred');
      }
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream && meetingType === 'VIDEO') {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endMeeting = () => {
    cleanup();
    onEndMeeting();
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    if (socket) {
      socket.disconnect();
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="bg-red-600 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">Meeting Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={onEndMeeting}
            className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-4 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {meetingType} Meeting - Room: {meetingRoomId}
          </h2>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-600' : 'bg-red-600'
            }`}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 flex">
        {meetingType === 'VIDEO' ? (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                You {isMuted && '(Muted)'} {isVideoOff && '(Video Off)'}
              </div>
            </div>

            {/* Remote Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p>Waiting for participant...</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                {userRole === 'USER' ? 'Counselor' : 'Client'}
              </div>
            </div>
          </div>
        ) : (
          /* Audio Only Interface */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="mb-8">
                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Audio Meeting</h3>
                <p className="text-gray-300 mt-2">
                  {isConnected ? 'Connected with participant' : 'Waiting for participant...'}
                </p>
              </div>
              {isMuted && (
                <div className="bg-red-600 text-white px-4 py-2 rounded-lg inline-block">
                  Microphone is muted
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex justify-center space-x-4">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
            } text-white transition duration-200`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              {isMuted ? (
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 00-1.414 1.414 3 3 0 010 4.243 1 1 0 001.414 1.414 5 5 0 000-7.07z" clipRule="evenodd" />
              )}
            </svg>
          </button>

          {/* Video Toggle (only for video meetings) */}
          {meetingType === 'VIDEO' && (
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full ${
                isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
              } text-white transition duration-200`}
              title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                {isVideoOff ? (
                  <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13V7a2 2 0 00-2-2h-3.586l-1.707-1.707A1 1 0 0010 3H6a2 2 0 00-2 2v.586L3.707 2.293zM6 6.586L13.414 14H6V6.586z"/>
                ) : (
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                )}
              </svg>
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={endMeeting}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition duration-200"
            title="End Meeting"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;