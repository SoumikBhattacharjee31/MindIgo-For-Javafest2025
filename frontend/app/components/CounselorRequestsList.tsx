import React, { useState, useEffect } from 'react';
import { meetingApi } from '../api/meetingService';
import MeetingLauncher from './MeetingLauncher';

const CounselorRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const [pendingResponse, allResponse] = await Promise.all([
        meetingApi.getCounselorPendingRequests(),
        meetingApi.getCounselorRequests()
      ]);
      setRequests(pendingResponse.data);
      setAllRequests(allResponse.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      await meetingApi.acceptMeetingRequest(requestId);
      await fetchRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Error accepting meeting request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async () => {
    if (!requestToReject) return;
    
    setProcessingRequest(requestToReject.id);
    try {
      await meetingApi.rejectMeetingRequest(requestToReject.id, rejectionReason);
      await fetchRequests();
      setShowRejectModal(false);
      setRejectionReason('');
      setRequestToReject(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting meeting request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const openRejectModal = (request) => {
    setRequestToReject(request);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason('');
    setRequestToReject(null);
  };

  const handleJoinMeeting = (request) => {
    setSelectedMeeting(request);
  };

  const closeMeetingLauncher = () => {
    setSelectedMeeting(null);
    fetchRequests(); // Refresh the list after meeting ends
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
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

  const displayRequests = activeTab === 'pending' ? requests : allRequests;

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
        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-md font-medium transition duration-200 ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pending ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md font-medium transition duration-200 ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All Requests ({allRequests.length})
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {activeTab === 'pending' ? 'Pending Meeting Requests' : 'All Meeting Requests'}
        </h2>
        
        {displayRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {activeTab === 'pending' ? 'No pending meeting requests' : 'No meeting requests found'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {request.userUsername || `User ${request.userId}`}
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
                    {request.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={processingRequest === request.id}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                        >
                          {processingRequest === request.id ? 'Processing...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => openRejectModal(request)}
                          disabled={processingRequest === request.id}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                        >
                          Reject
                        </button>
                      </>
                    )}
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

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Reject Meeting Request
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this meeting request:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleRejectRequest}
                  disabled={!rejectionReason.trim() || processingRequest}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  {processingRequest ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={closeRejectModal}
                  disabled={processingRequest}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Meeting Launcher Modal */}
      {selectedMeeting && (
        <MeetingLauncher
          meetingRequest={selectedMeeting}
          userRole="COUNSELOR"
          onClose={closeMeetingLauncher}
        />
      )}
    </>
  );
};

export default CounselorRequestsList;