import React, { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";

type MeetingStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
type MeetingType = "VIDEO" | "AUDIO";

interface MeetingRequest {
  id: number;
  userId: number;
  counselorId?: number;
  userUsername: string;
  counselorUsername?: string;
  meetingType: MeetingType;
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string | null;
  meetingRoomId?: string | null;
}

interface MeetingRoomProps {
  meetingRoomId: string | null | undefined;
  meetingType: MeetingType;
  userRole: "COUNSELOR" | "USER";
  onEndMeeting: () => void;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({
  meetingRoomId,
  meetingType,
  userRole,
  onEndMeeting,
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState("");
  const [isInitiator, setIsInitiator] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await initializeMedia();
        if (!mounted) return;
        initializeSocket();
      } catch (err) {
        if (mounted) {
          console.error("Error during initialization:", err);
          setError(
            "Failed to initialize meeting. Please check your camera/microphone permissions."
          );
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  // Update local video when localStream changes
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch((err) => {
        console.warn("Local video play failed:", err);
      });
    }
  }, [localStream]);

  // Update remote video when remoteStream changes
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((err) => {
        console.warn("Remote video play failed:", err);
      });
    }
  }, [remoteStream]);

  const initializeMedia = async () => {
    try {
      console.log("Initializing media with constraints:", {
        video: meetingType === "VIDEO",
        audio: true,
      });

      const constraints = {
        video:
          meetingType === "VIDEO"
            ? {
                width: { min: 320, ideal: 640, max: 1280 },
                height: { min: 240, ideal: 480, max: 720 },
                frameRate: { ideal: 30, max: 60 },
              }
            : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Media stream obtained:", stream);
      console.log(
        "Local stream tracks:",
        stream.getTracks().map((t) => ({
          kind: t.kind,
          id: t.id,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState,
          label: t.label,
        }))
      );

      // Verify video track is working for video meetings
      if (meetingType === "VIDEO") {
        const videoTrack = stream.getVideoTracks()[0];
        if (!videoTrack) {
          throw new Error("No video track found");
        }
        console.log("Video track details:", {
          enabled: videoTrack.enabled,
          readyState: videoTrack.readyState,
          muted: videoTrack.muted,
          label: videoTrack.label,
          settings: videoTrack.getSettings(),
        });
      }

      setLocalStream(stream);
      localStreamRef.current = stream;
      setMediaReady(true);
    } catch (err) {
      console.error("Error accessing media devices:", err);
      throw new Error(
        "Unable to access camera/microphone. Please check permissions."
      );
    }
  };

  const initializeSocket = () => {
    console.log("Initializing socket connection...");

    const socketConnection = io("http://localhost:3001", {
      withCredentials: true,
      forceNew: true,
      timeout: 20000,
    });

    socketRef.current = socketConnection;
    setSocket(socketConnection);

    socketConnection.on("connect", () => {
      console.log("Socket connected:", socketConnection.id);
      socketConnection.emit("join-room", meetingRoomId);
    });

    socketConnection.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setError("Failed to connect to meeting server");
    });

    socketConnection.on("room-full", () => {
      console.log("Room is full");
      setError("Meeting room is full. Only 2 participants allowed.");
    });

    socketConnection.on("waiting-for-peer", () => {
      console.log("Waiting for peer to join...");
    });

    socketConnection.on("initiate-call", () => {
      console.log("Initiating call as first user");
      setIsInitiator(true);
      if (localStreamRef.current) {
        setTimeout(() => {
          createPeerConnection(true);
        }, 1000);
      } else {
        const waitForMedia = setInterval(() => {
          if (localStreamRef.current) {
            clearInterval(waitForMedia);
            createPeerConnection(true);
          }
        }, 100);
        setTimeout(() => clearInterval(waitForMedia), 10000);
      }
    });

    socketConnection.on("peer-joined", () => {
      console.log("Peer joined, preparing to receive call");
      if (localStreamRef.current) {
        setTimeout(() => {
          createPeerConnection(false);
        }, 1000);
      } else {
        const waitForMedia = setInterval(() => {
          if (localStreamRef.current) {
            clearInterval(waitForMedia);
            createPeerConnection(false);
          }
        }, 100);
        setTimeout(() => clearInterval(waitForMedia), 10000);
      }
    });

    socketConnection.on("offer", async (offer) => {
      console.log("Received offer");
      const pc = peerConnectionRef.current;
      if (pc && localStreamRef.current) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketConnection.emit("answer", answer, meetingRoomId);
        } catch (err) {
          console.error("Error handling offer:", err);
        }
      }
    });

    socketConnection.on("answer", async (answer) => {
      console.log("Received answer");
      const pc = peerConnectionRef.current;
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error("Error handling answer:", err);
        }
      }
    });

    socketConnection.on("ice-candidate", async (candidate) => {
      console.log("Received ICE candidate");
      const pc = peerConnectionRef.current;
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    socketConnection.on("peer-disconnected", () => {
      console.log("Peer disconnected");
      setIsConnected(false);
      setRemoteStream(null);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    socketConnection.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  };

  const createPeerConnection = async (initiator: boolean) => {
    const currentStream = localStreamRef.current;

    if (!currentStream) {
      console.error("No local stream available for peer connection");
      setError("Media not ready. Please try again.");
      return;
    }

    console.log(
      `Creating peer connection as ${initiator ? "initiator" : "receiver"}`
    );
    console.log(
      "Local stream tracks:",
      currentStream.getTracks().map((t) => t.kind)
    );

    const pc = new RTCPeerConnection(iceServers);
    peerConnectionRef.current = pc;
    setPeerConnection(pc);

    // Add local stream to peer connection
    currentStream.getTracks().forEach((track) => {
      console.log(`Adding ${track.kind} track to peer connection`);
      pc.addTrack(track, currentStream);
    });

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log("Received remote stream");
      const [stream] = event.streams;

      console.log("Remote stream details:", {
        id: stream.id,
        active: stream.active,
        tracks: stream.getTracks().map((t) => ({
          kind: t.kind,
          id: t.id,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState,
          label: t.label,
        })),
      });

      // For audio-only meetings, create audio element
      if (meetingType === "AUDIO") {
        const audio = new Audio();
        audio.srcObject = stream;
        audio.autoplay = true;
        audio.volume = 1.0;
        audio.play().catch(console.error);
      }

      setRemoteStream(stream);

      // Force video element update
      setTimeout(() => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.load();
          remoteVideoRef.current.play().catch((err) => {
            console.warn("Remote video play failed:", err);
          });
        }
      }, 100);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log("Sending ICE candidate");
        socketRef.current.emit("ice-candidate", event.candidate, meetingRoomId);
      } else if (!event.candidate) {
        console.log("ICE gathering completed");
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setIsConnected(true);
      } else if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        setIsConnected(false);
        if (pc.connectionState === "failed") {
          console.log("Connection failed, attempting to restart...");
        }
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
      if (pc.iceConnectionState === "failed") {
        console.log("ICE connection failed");
      }
    };

    // Create offer if initiator
    if (initiator) {
      try {
        console.log("Creating offer...");
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: meetingType === "VIDEO",
        });
        await pc.setLocalDescription(offer);
        console.log("Sending offer");
        if (socketRef.current)
          socketRef.current.emit("offer", offer, meetingRoomId);
      } catch (err) {
        console.error("Error creating offer:", err);
        setError("Failed to create connection offer");
      }
    }
  };

  const toggleMute = () => {
    const currentStream = localStreamRef.current;
    if (currentStream) {
      const audioTrack = currentStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    const currentStream = localStreamRef.current;
    if (currentStream && meetingType === "VIDEO") {
      const videoTrack = currentStream.getVideoTracks()[0];
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
    console.log("Cleaning up meeting resources...");

    const currentStream = localStreamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    localStreamRef.current = null;

    setLocalStream(null);
    setRemoteStream(null);
    setPeerConnection(null);
    setSocket(null);
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

  if (!mediaReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Initializing meeting...</p>
          <p className="text-sm text-gray-400 mt-2">
            Please allow camera and microphone access
          </p>
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
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                isConnected ? "bg-green-600" : "bg-yellow-600"
              }`}
            >
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 flex">
        {meetingType === "VIDEO" ? (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)", // Mirror local video
                }}
                onLoadedMetadata={() => {
                  console.log("Local video metadata loaded");
                  console.log(
                    "Local video dimensions:",
                    localVideoRef.current?.videoWidth,
                    "x",
                    localVideoRef.current?.videoHeight
                  );
                }}
                onError={(e) => {
                  console.error("Local video error:", e);
                }}
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                You {isMuted && "(Muted)"} {isVideoOff && "(Video Off)"}
              </div>
              {!localStream && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg
                        className="w-8 h-8"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p>Camera initializing...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Remote Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onLoadedMetadata={() => {
                    console.log("Remote video metadata loaded");
                    console.log(
                      "Remote video dimensions:",
                      remoteVideoRef.current?.videoWidth,
                      "x",
                      remoteVideoRef.current?.videoHeight
                    );
                  }}
                  onError={(e) => {
                    console.error("Remote video error:", e);
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg
                        className="w-8 h-8"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p>Waiting for participant...</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                {userRole === "USER" ? "Counselor" : "Client"}
              </div>
            </div>
          </div>
        ) : (
          /* Audio Only Interface */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="mb-8">
                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-16 h-16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Audio Meeting</h3>
                <p className="text-gray-300 mt-2">
                  {isConnected
                    ? "Connected with participant"
                    : "Waiting for participant..."}
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
              isMuted
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-600 hover:bg-gray-700"
            } text-white transition duration-200`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              {isMuted ? (
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 00-1.414 1.414 3 3 0 010 4.243 1 1 0 001.414 1.414 5 5 0 000-7.07z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </button>

          {/* Video Toggle (only for video meetings) */}
          {meetingType === "VIDEO" && (
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full ${
                isVideoOff
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-600 hover:bg-gray-700"
              } text-white transition duration-200`}
              title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                {isVideoOff ? (
                  <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13V7a2 2 0 00-2-2h-3.586l-1.707-1.707A1 1 0 0010 3H6a2 2 0 00-2 2v.586L3.707 2.293zM6 6.586L13.414 14H6V6.586z" />
                ) : (
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
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
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-gray-700 p-2 text-white text-xs">
          <div className="flex justify-between">
            <span>Local: {localStream ? "Ready" : "Not ready"}</span>
            <span>Remote: {remoteStream ? "Ready" : "Not ready"}</span>
            <span>Connected: {isConnected ? "Yes" : "No"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;
