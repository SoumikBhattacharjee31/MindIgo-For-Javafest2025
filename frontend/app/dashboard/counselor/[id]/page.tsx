// app/dashboard/counselor/[id]/page.tsx
"use client";

export const dynamic = "force-dynamic";
import React, { useState, useEffect } from "react";
import { getCounselorById, rateCounselor } from "@/app/dashboard/counselor/api";
import { Counselor, RateCounselorRequest, MeetingRequest, MeetingType } from "@/app/dashboard/counselor/types";
import { Star, Mail, ShieldCheck, Calendar, Info, Users, MessageCircle } from "lucide-react";
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

// Loading Skeleton with better styling
const LoadingProfile = () => (
  <div className="container mx-auto px-4 py-12 animate-pulse">
    <div className="flex flex-col md:flex-row gap-10 items-center">
      <div className="md:w-1/3 flex flex-col items-center space-y-6">
        <div className="skeleton h-56 w-56 rounded-full bg-base-300"></div>
        <div className="skeleton h-8 w-3/4 bg-base-300 rounded"></div>
        <div className="skeleton h-5 w-1/2 bg-base-300 rounded"></div>
      </div>
      <div className="md:w-2/3 space-y-5">
        <div className="skeleton h-10 w-1/3 bg-base-300 rounded"></div>
        <div className="skeleton h-5 w-full bg-base-300 rounded"></div>
        <div className="skeleton h-5 w-full bg-base-300 rounded"></div>
        <div className="skeleton h-5 w-4/5 bg-base-300 rounded"></div>
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
      
      toast.success("Thank you for your feedback!");
    } catch (error: any) {
      console.error("Failed to submit rating:", error);
      toast.error("Failed to submit rating. Please try again.");
    }
  };

  const latestRequest = userRequests
    .filter((r) => r.counselorId === counselor?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  let meetingButtonText = "Request Meeting";
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
      toast.success("Meeting request sent successfully!");
    } catch (error: any) {
      setRequestError(error.response?.data || "Failed to send request. Please try again.");
      toast.error("Failed to send request.");
    }
  };

  if (loading) return <LoadingProfile />;
  if (!counselor)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-12 bg-base-200 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold text-error">Counselor not found.</h2>
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
    <div className="p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-primary">
        <Calendar className="w-6 h-6" /> Appointments
      </h3>
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-base-100 rounded-2xl border border-dashed border-base-300">
          <Calendar className="w-16 h-16 text-base-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-base-content mb-2">No appointments yet</h3>
          <p className="text-base-content/70 max-w-md mx-auto mb-6">
            Start your journey by booking your first session with {counselor.name}.
          </p>
          <button
            onClick={() => setShowAppointmentModal(true)}
            className="btn btn-primary px-8 py-3 rounded-full font-medium hover:scale-105 transition-transform duration-200"
          >
            📅 Book Your Session
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              userRole="CLIENT"
            />
          ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: "about", icon: Info, label: "About", content: renderAboutTab() },
    { id: "reviews", icon: Users, label: "Reviews", content: <ReviewsTab counselorId={counselor.id} /> },
    { id: "appointments", icon: Calendar, label: "Appointments", content: <AppointmentsTab /> },
  ];

  function renderAboutTab() {
    return (
      <div className="space-y-8">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-primary">
            <Info className="w-6 h-6" /> About {counselor && counselor.name}
          </h2>
          <p className="text-lg leading-relaxed text-base-content/90">
            I'm <strong>{counselor && counselor.name}</strong>, a licensed counselor specializing in{" "}
            <em>{counselor && counselor.specialization}</em>. I believe in creating a safe, compassionate, and
            non-judgmental space where you can freely explore your thoughts and emotions.
            My approach is deeply client-centered — tailored uniquely to your needs, goals, and pace.
          </p>
        </div>

        {counselor && counselor.licenseNumber && (
          <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-primary">
              <ShieldCheck className="w-5 h-5" /> Credentials & Verification
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>License #:</strong> {counselor.licenseNumber}</p>
              {counselor.counselorStatus && (
                <p><strong>Status:</strong>{" "}
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {counselor.counselorStatus}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-50 via-base-100 to-base-200 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="card bg-white shadow-2xl rounded-3xl overflow-hidden border border-base-200 hover:shadow-3xl transition-shadow duration-300">
          
          {/* Hero Banner with Soft Gradient */}
          <div className="bg-gradient-to-r from-primary/90 via-secondary/90 to-accent/90 p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent opacity-30"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <img
                  src={
                    counselor.profileImageUrl ??
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      counselor.name
                    )}&background=random&size=512`
                  }
                  alt={`Profile of ${counselor.name}`}
                  className="rounded-full w-36 h-36 md:w-48 md:h-48 object-cover ring-4 ring-white/30 shadow-2xl hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -bottom-2 -right-2 bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Star className="w-5 h-5 fill-white text-white" />
                </div>
              </div>
              
              <div className="text-center md:text-left space-y-3">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  {counselor.name}
                </h1>
                <p className="text-xl md:text-2xl font-medium opacity-95 mb-2">
                  {counselor.specialization}
                </p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20">
                    <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                    <span className="font-bold text-lg">
                      {counselor.ratings != null
                        ? counselor.ratings.toFixed(1)
                        : "—"}
                    </span>
                    <span className="text-sm opacity-90">
                      ({counselor.totalRatings || 0} reviews)
                    </span>
                  </div>
                  
                  {counselor.acceptsInsurance && (
                    <div className="badge badge-lg badge-success gap-2 border border-success/30">
                      <ShieldCheck className="w-5 h-5" /> Accepts Insurance
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="p-6 md:p-10 space-y-10">
            
            {/* Contact & Actions */}
            <section>
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-primary">
                <Mail className="w-6 h-6" /> Get in Touch
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-5 p-5 bg-base-100 hover:bg-base-200 rounded-2xl border border-base-200 transition-all duration-200 group">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-200">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-lg mb-1">Email</div>
                      <a
                        href={`mailto:${counselor.email}`}
                        className="link link-primary text-base hover:underline"
                      >
                        {counselor.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 p-5 bg-base-100 hover:bg-base-200 rounded-2xl border border-base-200 transition-all duration-200 group">
                    <div className="p-3 bg-secondary/10 rounded-xl group-hover:bg-secondary/20 transition-colors duration-200">
                      <Calendar className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <div className="font-medium text-lg mb-1">Member Since</div>
                      <div className="text-base">
                        {counselor.createdAt
                          ? new Date(counselor.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Unknown"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setShowAppointmentModal(true)}
                    className="btn btn-primary btn-wide py-4 text-lg font-medium rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md"
                  >
                    📅 Book a Session
                  </button>
                  
                  <button
                    onClick={() => setShowRatingModal(true)}
                    disabled={hasRated}
                    className={`btn btn-wide py-4 text-lg font-medium rounded-xl transition-all duration-200 shadow-md ${
                      hasRated 
                        ? "btn-disabled cursor-not-allowed opacity-70" 
                        : "btn-secondary hover:btn-primary hover:scale-105 active:scale-95"
                    }`}
                  >
                    {hasRated ? (
                      <>
                        <Star className="w-5 h-5 mr-2" />
                        Thank You for Rating!
                      </>
                    ) : (
                      <>
                        <Star className="w-5 h-5 mr-2" />
                        Rate & Review
                      </>
                    )}
                  </button>

                  <button
                    onClick={meetingButtonOnClick}
                    disabled={meetingButtonDisabled}
                    className={`btn btn-wide py-4 text-lg font-medium rounded-xl transition-all duration-200 shadow-md ${
                      meetingButtonDisabled 
                        ? "btn-disabled cursor-not-allowed opacity-70" 
                        : "btn-accent hover:btn-primary hover:scale-105 active:scale-95"
                    }`}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {meetingButtonText}
                  </button>
                </div>
              </div>
            </section>

            {/* Tabs Section */}
            <section className="mt-8">
              <div className="card bg-base-50 border border-base-200 rounded-3xl overflow-hidden">
                <Tab.Group>
                  <Tab.List className="flex p-2 bg-base-100 rounded-t-3xl">
                    {tabs.map((tab) => (
                      <Tab
                        key={tab.id}
                        className={({ selected }) =>
                          `flex-1 py-4 px-2 text-center font-medium rounded-2xl transition-all duration-200 ${
                            selected
                              ? "bg-white text-primary shadow-md"
                              : "text-base-content/70 hover:text-base-content hover:bg-base-200"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <div className="flex flex-col items-center gap-2">
                            <tab.icon className={`w-5 h-5 ${selected ? "text-primary" : "text-inherit"}`} />
                            <span>{tab.label}</span>
                          </div>
                        )}
                      </Tab>
                    ))}
                  </Tab.List>
                  <Tab.Panels className="p-6 bg-white rounded-b-3xl">
                    {tabs.map((tab) => (
                      <Tab.Panel key={tab.id} className="focus:outline-none">
                        {tab.content}
                      </Tab.Panel>
                    ))}
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Modals */}
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
            toast.success("Appointment requested successfully!");
            setShowAppointmentModal(false);
          }}
          preSelectedCounselor={appointmentsCounselor}
          counselors={[appointmentsCounselor]}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
      />
    </div>
  );
};

export default CounselorProfilePage;