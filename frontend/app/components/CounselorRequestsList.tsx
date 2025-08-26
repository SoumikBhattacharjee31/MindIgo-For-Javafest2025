import React, { useState, useEffect } from 'react';
import { meetingApi } from '../api/meetingService';

const CounselorRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await meetingApi.getCounselorPendingRequests();
      setRequests(response.data);
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
      await fetchPendingRequests();
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
      await fetchPendingRequests();
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Meeting Requests</h2>
      
      {requests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No pending meeting requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
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
                  </div>
                  <p className="text-gray-600 mb-2">
                    Requested: {formatDateTime(request.createdAt)}
                  </p>
                </div>
                
                <div className="flex space-x-2">
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
  );
};

export default CounselorRequestsList;