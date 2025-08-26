"use client"
import React, { useState, useEffect } from 'react';
import UserMeetingRequest from '../../../components/UserMeetingRequest';
import UserRequestsList from '../../../components/UserRequestsList';

const UserMeetingDashboard = () => {
  const [activeTab, setActiveTab] = useState('request');
  const [counselors, setCounselors] = useState([]);

  useEffect(() => {
    // Fetch counselors from your auth service
    fetchCounselors();
  }, []);

  const fetchCounselors = async () => {
    // This would be an API call to get all counselors
    // For now, using dummy data - replace with actual API call
    const dummyCounselors = [
      { id: 1, username: 'Dr. Smith', email: 'dr.smith@example.com' },
      { id: 2, username: 'Dr. Johnson', email: 'dr.johnson@example.com' },
      { id: 3, username: 'Dr. Brown', email: 'dr.brown@example.com' },
    ];
    setCounselors(dummyCounselors);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Meeting Dashboard
        </h1>
        
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setActiveTab('request')}
              className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                activeTab === 'request'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Request Meeting
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                activeTab === 'requests'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              My Requests
            </button>
          </div>
        </div>

        {activeTab === 'request' && <UserMeetingRequest counselors={counselors} />}
        {activeTab === 'requests' && <UserRequestsList />}
      </div>
    </div>
  );
};

export default UserMeetingDashboard;