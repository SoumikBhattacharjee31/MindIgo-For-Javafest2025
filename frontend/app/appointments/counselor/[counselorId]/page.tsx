"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Award,
  Users,
  ArrowLeft,
  Mail,
  BookOpen,
  Shield,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";

import {
  appointmentServiceApi,
  Counselor,
  TimeSlot,
} from "@/app/appointments/api";
import CalendarDatePicker from "@/app/appointments/components/CalendarDatePicker";
import TimeSlotPicker from "@/app/appointments/components/TimeSlotPicker";
import BookingModal from "@/app/appointments/components/BookingModal";

const CounselorBookingPage = () => {
  const params = useParams();
  const router = useRouter();
  const counselorId = parseInt(params.counselorId as string);

  const [counselor, setCounselor] = useState<Counselor | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    if (counselorId) {
      loadCounselorData();
    }
  }, [counselorId]);

  const loadCounselorData = async () => {
    setLoading(true);
    try {
      const [counselorResponse, datesResponse] = await Promise.all([
        appointmentServiceApi.getCounselorById(counselorId),
        appointmentServiceApi.getAvailableDates(counselorId),
      ]);

      if (counselorResponse.data.success) {
        setCounselor(counselorResponse.data.data);
      }

      if (datesResponse.data.success) {
        const dates = datesResponse.data.data;
        setAvailableDates(dates);
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
          fetchAvailableSlots(dates[0]);
        }
      }
    } catch (error) {
      toast.error("Failed to load counselor information");
      router.push("/appointments/client");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date: string) => {
    setSlotsLoading(true);
    try {
      const response = await appointmentServiceApi.getAvailableSlots(
        counselorId,
        date
      );
      if (response.data.success) {
        setAvailableSlots(response.data.data);
        setSelectedSlot(null);
      }
    } catch (error) {
      toast.error("Failed to load available slots");
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    fetchAvailableSlots(date);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleBookAppointment = () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">
            Loading counselor profile...
          </p>
        </div>
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Counselor Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested counselor could not be found.
          </p>
          <button
            onClick={() => router.push("/appointments/client")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Counselors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/appointments/client")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to All Counselors</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Counselor Info */}
          <div className="lg:col-span-1">
            {/* Counselor Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="absolute -bottom-12 left-6">
                  <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {counselor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-16 p-6">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {counselor.name}
                  </h1>
                  <p className="text-gray-600">
                    Licensed Professional Counselor
                  </p>
                </div>

                {counselor.bio && (
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {counselor.bio}
                  </p>
                )}

                {/* Contact Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{counselor.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Award className="w-4 h-4" />
                    <span className="text-sm">Licensed in Multiple States</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Specializations */}
            {counselor.specializations &&
              counselor.specializations.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Specializations
                  </h3>
                  <div className="space-y-3">
                    {counselor.specializations.map((spec, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700 font-medium">
                          {spec}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Right Column - Booking Interface */}
          <div className="lg:col-span-2">
            {/* Booking Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Book Your Session
              </h2>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Date Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Select Date
                  </h3>
                  <CalendarDatePicker
                    availableDates={availableDates}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    minDate={dayjs().format("YYYY-MM-DD")}
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Select Time
                  </h3>
                  {selectedDate && (
                    <TimeSlotPicker
                      slots={availableSlots}
                      selectedSlot={selectedSlot}
                      onSlotSelect={handleSlotSelect}
                      selectedDate={selectedDate}
                      loading={slotsLoading}
                    />
                  )}
                </div>
              </div>

              {/* Booking Summary */}
              {selectedSlot && (
                <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Booking Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Counselor</span>
                      <span className="font-medium">{counselor.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Date</span>
                      <span className="font-medium">
                        {dayjs(selectedDate).format("dddd, MMMM D, YYYY")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Time</span>
                      <span className="font-medium">
                        {dayjs(selectedSlot.startTime).format("h:mm A")} -{" "}
                        {dayjs(selectedSlot.endTime).format("h:mm A")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">
                        {selectedSlot.duration || 50} minutes
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBookAppointment}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Book Appointment
                  </button>
                </div>
              )}

              {!selectedSlot && (
                <div className="mt-8 text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a date and time to book your appointment</p>
                </div>
              )}
            </div>

            {/* About Section */}
            {counselor.bio && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  About {counselor.name}
                </h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {counselor.bio}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {counselor && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            toast.success("Appointment booked successfully!");
            router.push("/appointments/client");
          }}
          preSelectedCounselor={counselor}
          counselors={[counselor]}
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

export default CounselorBookingPage;
