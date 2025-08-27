"use client"
import React, { useState, useEffect } from 'react';
import { meetingApi } from '../api/meetingService';

const UserMeetingRequest = ({ counselors = [] }) => {
  const [selectedCounselor, setSelectedCounselor] = useState('');
  const [meetingType, setMeetingType] = useState('AUDIO');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!selectedCounselor) {
      setMessage('Please select a counselor');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
        console.log(selectedCounselor);
        console.log(meetingType);
      await meetingApi.createMeetingRequest(parseInt(selectedCounselor)+30, meetingType);
      setMessage('Meeting request sent successfully!');
      setSelectedCounselor('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating meeting request:', error);
      const errorMessage = error.response?.data || 'Error sending meeting request';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Request a Meeting</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('Error') || message.includes('not') 
            ? 'bg-red-100 text-red-700 border border-red-300' 
            : 'bg-green-100 text-green-700 border border-green-300'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmitRequest} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Counselor
          </label>
          <select
            value={selectedCounselor}
            onChange={(e) => setSelectedCounselor(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Choose a counselor...</option>
            {counselors.map((counselor) => (
              <option key={counselor.id} value={counselor.id}>
                {counselor.username} ({counselor.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="AUDIO"
                checked={meetingType === 'AUDIO'}
                onChange={(e) => setMeetingType(e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Audio Meeting</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="VIDEO"
                checked={meetingType === 'VIDEO'}
                onChange={(e) => setMeetingType(e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Video Meeting</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          {loading ? 'Sending Request...' : 'Send Meeting Request'}
        </button>
      </form>
    </div>
  );
};

export default UserMeetingRequest;