// app/counselor/meeting/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CounselorSettings from "@/app/meeting/components/CounselorSettings";
import CounselorRequestsList from "@/app/meeting/components/CounselorRequestsList";
import Sidebar from "@/app/counselor/components/Sidebar";

const CounselorMeetingDashboard = () => {
  const [activeTab, setActiveTab] = useState("requests");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      <Sidebar />
      <div className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Counselor Meeting Dashboard
          </h1>

          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-sm p-1">
              <button
                onClick={() => setActiveTab("requests")}
                className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                  activeTab === "requests"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Meeting Requests
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                  activeTab === "settings"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Settings
              </button>
            </div>
          </div>

          {activeTab === "requests" && <CounselorRequestsList />}
          {activeTab === "settings" && <CounselorSettings />}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default CounselorMeetingDashboard;