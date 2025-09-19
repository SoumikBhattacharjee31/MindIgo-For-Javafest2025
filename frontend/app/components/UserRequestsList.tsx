"use client"
import React, { useState, useEffect } from 'react';
import { meetingApi } from '../api/meetingService';
import MeetingLauncher from './MeetingLauncher';

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

const UserRequestsList = () => {
  const [requests, setRequests] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRequest|null>(null);

  useEffect(() => {
    fetchUserRequests();
    const interval = setInterval(fetchUserRequests, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUserRequests = async () => {
    try {
      const response = await meetingApi.getUserRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: MeetingStatus) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleJoinMeeting = (request: MeetingRequest) => {
    setSelectedMeeting(request);
  };

  const closeMeetingLauncher = () => {
    setSelectedMeeting(null);
    fetchUserRequests(); // Refresh the list after meeting ends
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Meeting Requests</h2>
        
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No meeting requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {request.counselorUsername || `Counselor ${request.counselorId}`}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        request.meetingType === 'VIDEO' 
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {request.meetingType} Meeting
                      </span>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-gray-600 mb-2">
                      Requested: {formatDateTime(request.createdAt)}
                    </p>
                    {request.updatedAt && request.updatedAt !== request.createdAt && (
                      <p className="text-gray-600 mb-2">
                        Updated: {formatDateTime(request.updatedAt)}
                      </p>
                    )}
                    {request.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                        <p className="text-red-800 font-medium">Rejection Reason:</p>
                        <p className="text-red-700">{request.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {request.status === 'ACCEPTED' && request.meetingRoomId && (
                      <button
                        onClick={() => handleJoinMeeting(request)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                      >
                        Join Meeting
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Meeting Launcher Modal */}
      {selectedMeeting && (
        <MeetingLauncher
          meetingRequest={selectedMeeting}
          userRole="USER"
          onClose={closeMeetingLauncher}
        />
      )}
    </>
  );
};

export default UserRequestsList;