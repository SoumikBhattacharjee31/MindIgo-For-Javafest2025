"use client";
import React, { useState, useEffect } from "react";
import UserMeetingRequest from "@/app/meeting/components/UserMeetingRequest";
import UserRequestsList from "@/app/meeting/components/UserRequestsList";
import { authApi } from "@/app/api/authService";

const UserMeetingDashboard = () => {
  const [activeTab, setActiveTab] = useState("request");
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounselors();
  }, []);

  const fetchCounselors = async () => {
    try {
      // Fetch counselors from auth service
      const response = await authApi.getCounselors();
      setCounselors(response.data.data || []);
    } catch (error) {
      console.error("Error fetching counselors:", error);
      setCounselors([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Meeting Dashboard
        </h1>

        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setActiveTab("request")}
              className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                activeTab === "request"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Request Meeting
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                activeTab === "requests"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              My Requests
            </button>
          </div>
        </div>

        {activeTab === "request" && (
          <UserMeetingRequest counselors={counselors} />
        )}
        {activeTab === "requests" && <UserRequestsList />}
      </div>
    </div>
  );
};

export default UserMeetingDashboard;
