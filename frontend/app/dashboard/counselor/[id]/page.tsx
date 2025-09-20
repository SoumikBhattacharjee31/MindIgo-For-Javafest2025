// app/dashboard/counselor/[id]/page.tsx
"use client";

export const dynamic = "force-dynamic";
import React, { useState, useEffect } from "react";
import { getCounselorById, rateCounselor } from "@/app/dashboard/counselor/api";
import { Counselor, RateCounselorRequest, MeetingRequest, MeetingType } from "@/app/dashboard/counselor/types";
import { Star, Mail, ShieldCheck, Calendar, Info, Users, MessageCircle, MapPin, Clock, Award, Heart, Phone, Video } from "lucide-react";
import { useParams } from "next/navigation";
import RatingModal from "@/app/dashboard/counselor/components/RatingModal";
import ReviewsTab from "@/app/dashboard/counselor/components/ReviewsTab";
import { Tab } from "@headlessui/react";
import { meetingApi } from "@/app/meeting/api";
import MeetingLauncher from "@/app/meeting/components/MeetingLauncher";
import MeetingRequestModal from "@/app/dashboard/counselor/components/MeetingRequestModal";
import BookingModal from "@/app/appointments/components/BookingModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Appointment } from "@/app/appointments/api";
import AppointmentCard from "@/app/appointments/components/AppointmentCard";
import { appointmentServiceApi } from "@/app/appointments/api";

// Enhanced Loading Skeleton with shimmer effect
const LoadingProfile = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section Skeleton */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 animate-pulse">
        <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-48 h-48 bg-white/20 rounded-full"></div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white/30 rounded-full"></div>
            </div>
            <div className="space-y-4 text-center md:text-left">
              <div className="h-10 bg-white/20 rounded-xl w-64"></div>
              <div className="h-6 bg-white/20 rounded-lg w-48"></div>
              <div className="flex gap-4 justify-center md:justify-start">
                <div className="h-12 bg-white/20 rounded-full w-32"></div>
                <div className="h-12 bg-white/20 rounded-full w-40"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-10 space-y-6">
          <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-20 bg-gray-100 rounded-2xl"></div>
              <div className="h-20 bg-gray-100 rounded-2xl"></div>
            </div>
            <div className="space-y-4">
              <div className="h-16 bg-gray-100 rounded-xl"></div>
              <div className="h-16 bg-gray-100 rounded-xl"></div>
              <div className="h-16 bg-gray-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CounselorProfilePage = () => {
  const params = useParams();
  const id = params.id as string;

  const [counselor, setCounselor] = useState<Counselor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [userRequests, setUserRequests] = useState<MeetingRequest[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMeetingLauncher, setShowMeetingLauncher] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<MeetingRequest | null>(null);
  const [requestError, setRequestError] = useState("");
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (id) {
      const fetchCounselor = async () => {
        setLoading(true);
        try {
          const data = await getCounselorById(id);
          setCounselor({
            ...data,
            ratings: data.ratings ?? 0,
          });
        } catch (error) {
          setCounselor(null);
          console.error("Failed to fetch counselor details", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCounselor();
    }
  }, [id]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await meetingApi.getUserRequests();
        setUserRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch user requests", error);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await appointmentServiceApi.getMyAppointments();
        if (response.data.success) {
          setAppointments(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch appointments", error);
        toast.error("Failed to load appointments");
      }
    };
    fetchAppointments();
  }, []);

  const handleRateCounselor = async (request: RateCounselorRequest) => {
    try {
      await rateCounselor(request);
      setHasRated(true);
      setShowRatingModal(false);
      
      const updatedData = await getCounselorById(id);
      setCounselor({
        ...updatedData,
        ratings: updatedData.ratings ?? 0,
      });
      
      toast.success("Thank you for your feedback!", {
        icon:() => "⭐",
        style: { background: '#10B981', color: 'white' }
      });
    } catch (error: any) {
      console.error("Failed to submit rating:", error);
      toast.error("Failed to submit rating. Please try again.");
    }
  };

  const latestRequest = userRequests
    .filter((r) => r.counselorId === counselor?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  let meetingButtonText = "Request Video Session";
  let meetingButtonDisabled = false;
  let meetingButtonOnClick = () => setShowRequestModal(true);

  if (latestRequest) {
    if (latestRequest.status === "PENDING") {
      meetingButtonText = "Request Pending";
      meetingButtonDisabled = true;
    } else if (latestRequest.status === "ACCEPTED" && latestRequest.meetingRoomId) {
      meetingButtonText = "Join Meeting";
      meetingButtonOnClick = () => {
        setCurrentRequest(latestRequest);
        setShowMeetingLauncher(true);
      };
    }
  }

  const handleRequestSubmit = async (type: MeetingType) => {
    if (!counselor) return;
    setRequestError("");
    try {
      await meetingApi.createMeetingRequest(counselor.id, type);
      setShowRequestModal(false);
      const response = await meetingApi.getUserRequests();
      setUserRequests(response.data);
      toast.success("Meeting request sent successfully!", {
        icon:() => "🎉",
        style: { background: '#3B82F6', color: 'white' }
      });
    } catch (error: any) {
      setRequestError(error.response?.data || "Failed to send request. Please try again.");
      toast.error("Failed to send request.");
    }
  };

  if (loading) return <LoadingProfile />;
  if (!counselor)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center">
        <div className="text-center p-16 bg-white rounded-3xl shadow-2xl border border-red-100 max-w-md mx-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Counselor Not Found</h2>
          <p className="text-gray-600 mb-6">The counselor you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => window.history.back()}
            className="btn btn-primary px-8 py-3 rounded-full font-medium hover:scale-105 transition-transform"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  const appointmentsCounselor = {
    id: counselor.id,
    name: counselor.name,
    email: counselor.email,
    profileImageUrl: counselor.profileImageUrl,
    specializations: counselor.specialization ? [counselor.specialization] : undefined,
    bio: undefined,
    rating: counselor.ratings,
    totalReviews: counselor.totalRatings,
    isActive: true,
    approvedAt: counselor.createdAt,
  };

  const filteredAppointments = appointments.filter(apt => apt.counselorId === counselor.id);

  const AppointmentsTab = () => (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Your Appointments</h3>
      </div>
      
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-dashed border-blue-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Begin Your Journey?</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg leading-relaxed">
              Take the first step towards better mental health. Book your personalized session with {counselor.name} today.
            </p>
            <button
              onClick={() => setShowAppointmentModal(true)}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-4 rounded-full font-semibold text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Calendar className="w-6 h-6" />
              Schedule Your First Session
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">You have {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} with {counselor.name}</p>
            <button
              onClick={() => setShowAppointmentModal(true)}
              className="btn btn-primary btn-sm rounded-full px-6"
            >
              Book Another Session
            </button>
          </div>
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="transform hover:scale-[1.02] transition-transform duration-200">
              <AppointmentCard
                appointment={appointment}
                userRole="CLIENT"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    { 
      id: "about", 
      icon: Info, 
      label: "About", 
      content: renderAboutTab(),
      color: "from-emerald-500 to-teal-500"
    },
    { 
      id: "reviews", 
      icon: Users, 
      label: "Reviews", 
      content: <ReviewsTab counselorId={counselor.id} />,
      color: "from-amber-500 to-orange-500"
    },
    { 
      id: "appointments", 
      icon: Calendar, 
      label: "Appointments", 
      content: <AppointmentsTab />,
      color: "from-blue-500 to-purple-500"
    },
  ];

  function renderAboutTab() {
    return (
      <div className="p-8 space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
            <Info className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">About {counselor && counselor.name}</h2>
        </div>

        {/* Bio Section */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              Hello! I'm <span className="font-semibold text-emerald-700">{counselor && counselor.name}</span>, a dedicated licensed counselor 
              specializing in <span className="font-semibold text-teal-700">{counselor && counselor.specialization}</span>. 
              My passion lies in creating a warm, safe, and judgment-free environment where you can explore your thoughts, 
              emotions, and experiences freely.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              I believe that every individual's journey is unique, which is why my therapeutic approach is deeply personalized 
              and client-centered. Together, we'll work at your pace, focusing on your specific needs, goals, and aspirations 
              for growth and healing.
            </p>
          </div>
        </div>

        {/* Credentials Section */}
        {counselor && counselor.licenseNumber && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Professional Credentials</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-gray-700">License Number</span>
                </div>
                <p className="text-lg font-mono bg-gray-50 px-4 py-2 rounded-lg">{counselor.licenseNumber}</p>
              </div>
              {counselor.counselorStatus && (
                <div className="bg-white p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-gray-700">Status</span>
                  </div>
                  <span className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold">
                    {counselor.counselorStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Specialization Highlight */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">My Specialization</h3>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-purple-100">
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-purple-700">{counselor && counselor.specialization}</span> - 
              I bring specialized expertise and evidence-based approaches to help you navigate challenges 
              and achieve meaningful progress in this area of mental health.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        
        {/* Main Profile Card */}
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200 hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.01]">
          
          {/* Enhanced Hero Banner */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-12 md:p-16 text-white overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-10">
                {/* Profile Image with Enhanced Styling */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-full blur-xl transform group-hover:scale-110 transition-transform duration-500"></div>
                  <img
                    src={
                      counselor.profileImageUrl ??
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        counselor.name
                      )}&background=6366f1&color=white&size=512&font-size=0.4&bold=true`
                    }
                    alt={`${counselor.name} - Licensed Counselor`}
                    className="relative z-10 rounded-full w-44 h-44 md:w-56 md:h-56 object-cover ring-4 ring-white/40 shadow-2xl group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-4 ring-4 ring-white/30 shadow-xl">
                    <Star className="w-6 h-6 fill-white text-white" />
                  </div>
                </div>
                
                {/* Profile Info */}
                <div className="text-center lg:text-left space-y-6 flex-1">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                      {counselor.name}
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-blue-100 mb-2">
                      Licensed Counselor
                    </p>
                    <p className="text-lg md:text-xl text-blue-200 font-medium bg-white/10 inline-block px-6 py-2 rounded-full">
                      {counselor.specialization}
                    </p>
                  </div>
                  
                  {/* Stats and Badges */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                    <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20 hover:bg-white/25 transition-colors duration-300">
                      <Star className="w-6 h-6 fill-yellow-300 text-yellow-300" />
                      <div className="text-left">
                        <div className="font-bold text-xl">
                          {counselor.ratings != null ? counselor.ratings.toFixed(1) : "New"}
                        </div>
                        <div className="text-sm text-blue-100">
                          {counselor.totalRatings || 0} review{(counselor.totalRatings || 0) !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    
                    {counselor.acceptsInsurance && (
                      <div className="flex items-center gap-2 bg-green-500/90 backdrop-blur-sm px-6 py-4 rounded-2xl border border-green-400/30 hover:bg-green-500 transition-colors duration-300">
                        <ShieldCheck className="w-5 h-5 text-white" />
                        <span className="font-semibold text-white">Accepts Insurance</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
                      <Clock className="w-5 h-5 text-white" />
                      <span className="text-white font-medium">Available Today</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Actions Section */}
          <div className="p-8 md:p-12 bg-gradient-to-b from-gray-50 to-white">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Connect With Me</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-10">
              {/* Contact Information */}
              <div className="space-y-6">
                <div className="group bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="p-4 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors duration-300">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2 text-gray-800">Email Contact</h3>
                      <a
                        href={`mailto:${counselor.email}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-lg hover:underline transition-colors duration-200"
                      >
                        {counselor.email}
                      </a>
                      <p className="text-gray-500 text-sm mt-1">I typically respond within 24 hours</p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="p-4 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors duration-300">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2 text-gray-800">Member Since</h3>
                      <p className="text-lg font-medium text-gray-700">
                        {counselor.createdAt
                          ? new Date(counselor.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Recently joined"}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">Trusted mental health professional</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-5">
                <button
                  onClick={() => setShowAppointmentModal(true)}
                  className="w-full group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center gap-4">
                    <Calendar className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Book Appointment</span>
                  </div>
                  <p className="text-blue-100 text-sm mt-2 font-normal">Schedule your personalized session</p>
                </button>

                <button
                  onClick={meetingButtonOnClick}
                  disabled={meetingButtonDisabled}
                  className={`w-full group p-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg ${
                    meetingButtonDisabled 
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                      : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105 active:scale-95 hover:shadow-xl"
                  }`}
                >
                  <div className="flex items-center justify-center gap-4">
                    <Video className={`w-7 h-7 ${!meetingButtonDisabled ? 'group-hover:scale-110' : ''} transition-transform duration-300`} />
                    <span>{meetingButtonText}</span>
                  </div>
                  <p className={`text-sm mt-2 font-normal ${meetingButtonDisabled ? 'text-gray-400' : 'text-green-100'}`}>
                    {meetingButtonDisabled ? 'Please wait for approval' : 'Instant video consultation'}
                  </p>
                </button>

                <button
                  onClick={() => setShowRatingModal(true)}
                  disabled={hasRated}
                  className={`w-full group p-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg ${
                    hasRated 
                      ? "bg-gray-100 text-gray-500 border-2 border-gray-200 cursor-not-allowed" 
                      : "bg-white text-gray-800 border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 hover:scale-105 active:scale-95"
                  }`}
                >
                  <div className="flex items-center justify-center gap-4">
                    <Star className={`w-7 h-7 ${!hasRated ? 'text-orange-500 group-hover:fill-orange-500' : 'text-gray-400'} transition-all duration-300`} />
                    <span>{hasRated ? "Thank You for Rating!" : "Rate & Review"}</span>
                  </div>
                  <p className={`text-sm mt-2 font-normal ${hasRated ? 'text-gray-400' : 'text-gray-600'}`}>
                    {hasRated ? 'Your feedback has been recorded' : 'Share your experience with others'}
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs Section */}
          <div className="bg-white border-t border-gray-100">
            <Tab.Group>
              <Tab.List className="flex bg-gradient-to-r from-gray-50 to-gray-100 p-2 gap-2">
                {tabs.map((tab, index) => (
                  <Tab
                    key={tab.id}
                    className={({ selected }) =>
                      `flex-1 py-6 px-4 text-center font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                        selected
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                          : "text-gray-600 hover:text-gray-800 hover:bg-white hover:shadow-md"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <div className="flex flex-col items-center gap-3">
                        <div className={`p-2 rounded-xl transition-all duration-300 ${
                          selected ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                          <tab.icon className={`w-6 h-6 ${selected ? "text-white" : "text-gray-600"}`} />
                        </div>
                        <span className="text-base font-bold">{tab.label}</span>
                      </div>
                    )}
                  </Tab>
                ))}
              </Tab.List>
              
              <Tab.Panels className="bg-white">
                {tabs.map((tab) => (
                  <Tab.Panel key={tab.id} className="focus:outline-none">
                    <div className="min-h-[400px]">
                      {tab.content}
                    </div>
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">Quick Response</h3>
            </div>
            <p className="text-gray-600">Typically responds within 24 hours to all inquiries and appointment requests.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors duration-300">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">Verified Professional</h3>
            </div>
            <p className="text-gray-600">Licensed and verified counselor with proven track record of helping clients.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors duration-300">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">Compassionate Care</h3>
            </div>
            <p className="text-gray-600">Dedicated to providing empathetic, personalized care for every client's unique needs.</p>
          </div>
        </div>
      </div>

      {/* Enhanced Modals */}
      <RatingModal
        counselorId={counselor.id}
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRateCounselor}
      />

      {showRequestModal && (
        <MeetingRequestModal
          onClose={() => setShowRequestModal(false)}
          onSubmit={handleRequestSubmit}
          error={requestError}
        />
      )}

      {showMeetingLauncher && currentRequest && (
        <MeetingLauncher
          meetingRequest={currentRequest}
          userRole="USER"
          onClose={() => setShowMeetingLauncher(false)}
        />
      )}

      {showAppointmentModal && (
        <BookingModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          onSuccess={() => {
            toast.success("Appointment requested successfully!", {
              icon: () => "🎉",
              style: { 
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
                color: 'white',
                borderRadius: '16px',
                padding: '16px'
              }
            });
            setShowAppointmentModal(false);
          }}
          preSelectedCounselor={appointmentsCounselor}
          counselors={[appointmentsCounselor]}
        />
      )}

      {/* Enhanced Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
        toastClassName="rounded-2xl shadow-xl border"
        // bodyClassName="text-base font-medium"
        progressClassName="bg-gradient-to-r from-blue-500 to-purple-500"
      />
    </div>
  );
};

export default CounselorProfilePage;