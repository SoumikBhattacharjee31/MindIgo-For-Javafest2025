// app/counselor/page.tsx

"use client";

import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { Star, Users, Calendar, ShieldCheck } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReviewsTab from "@/app/dashboard/counselor/components/ReviewsTab";
import { getCounselorProfileById, getCurrentUserProfile, getRatingsForCounselor, appointmentServiceApi } from "@/app/counselor/api";
import {
  CounselorProfileResponse,
  CounselorRatingResponse,
  UserProfileResponse,
  Appointment
} from "@/app/counselor/types";
import Sidebar from "@/app/counselor/components/Sidebar";

// Loading Skeleton
const LoadingDashboard = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
    <Sidebar />
    <div className="flex-1 p-12 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-xl w-64 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="h-48 bg-gray-100 rounded-2xl"></div>
        <div className="h-48 bg-gray-100 rounded-2xl"></div>
        <div className="h-48 bg-gray-100 rounded-2xl"></div>
      </div>
    </div>
  </div>
);

const CounselorDashboard = () => {
  const [profile, setProfile] = useState<CounselorProfileResponse | null>(null);
  const [ratings, setRatings] = useState<CounselorRatingResponse[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch current user profile to get ID
        const userProfile: UserProfileResponse = await getCurrentUserProfile();
        const counselorId = userProfile.id;

        // Fetch counselor profile
        const profileData = await getCounselorProfileById(counselorId.toString());
        setProfile(profileData);

        // Fetch ratings (assuming pagination, fetch first page)
        const ratingsResponse = await getRatingsForCounselor(counselorId, 0, 10);
        setRatings(ratingsResponse.content || []); 

        // Fetch appointments for upcoming count
        const appointmentsResponse = await appointmentServiceApi.getMyAppointments();
        const appointmentData = appointmentsResponse.data.data || [];
        setAppointments(appointmentData);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
        toast.error("Failed to load data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingDashboard />;
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center">
        <div className="text-center p-16 bg-white rounded-3xl shadow-2xl border border-red-100 max-w-md mx-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Dashboard Error</h2>
          <p className="text-gray-600 mb-6">{error || "Unable to load your dashboard. Please check your credentials."}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary px-8 py-3 rounded-full font-medium hover:scale-105 transition-transform"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(apt => dayjs(apt.startTime).isAfter(dayjs()) && ['PENDING', 'CONFIRMED'].includes(apt.status)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      <Sidebar />
      
      <div className="flex-1 p-8 md:p-12 overflow-y-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-6">
            <img
              src={profile.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6366f1&color=white`}
              alt={profile.name}
              className="w-24 h-24 rounded-full ring-4 ring-blue-200"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {profile.name}</h1>
              <p className="text-gray-600 font-medium">Your Counselor Dashboard</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center gap-4 mb-4">
              <Star className="w-8 h-8 text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-800">Average Rating</h3>
            </div>
            <p className="text-4xl font-bold text-blue-600">{profile.ratings?.toFixed(1) || "N/A"}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
            <div className="flex items-center gap-4 mb-4">
              <Users className="w-8 h-8 text-green-500" />
              <h3 className="text-xl font-bold text-gray-800">Total Reviews</h3>
            </div>
            <p className="text-4xl font-bold text-green-600">{ratings.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center gap-4 mb-4">
              <Calendar className="w-8 h-8 text-purple-500" />
              <h3 className="text-xl font-bold text-gray-800">Upcoming Appointments</h3>
            </div>
            <p className="text-4xl font-bold text-purple-600">{upcomingAppointments}</p>
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Ratings & Reviews</h2>
          <ReviewsTab counselorId={profile.id} />
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={5000} theme="light" />
    </div>
  );
};

export default CounselorDashboard;