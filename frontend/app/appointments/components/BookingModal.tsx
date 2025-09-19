// app/components/appointments/BookingModal.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  MessageCircle,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import dayjs from "dayjs";
import {
  Counselor,
  TimeSlot,
  appointmentServiceApi,
} from "@/app/appointments/api";
import CalendarDatePicker from "./CalendarDatePicker";
import TimeSlotPicker from "./TimeSlotPicker";
import { toast } from "react-toastify";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedCounselor?: Counselor;
  counselors: Counselor[];
}

type BookingStep = "counselor" | "datetime" | "notes" | "confirmation";

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preSelectedCounselor,
  counselors,
}) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>("counselor");
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(
    preSelectedCounselor || null
  );
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-advance to next step if counselor is pre-selected
  useEffect(() => {
    if (preSelectedCounselor && isOpen) {
      setSelectedCounselor(preSelectedCounselor);
      setCurrentStep("datetime");
      fetchAvailableDates(preSelectedCounselor.id);
    }
  }, [preSelectedCounselor, isOpen]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && !preSelectedCounselor) {
      setCurrentStep("counselor");
      setSelectedCounselor(null);
      setAvailableDates([]);
      setSelectedDate("");
      setAvailableSlots([]);
      setSelectedSlot(null);
      setNotes("");
    }

    if (!isOpen) {
      // Reset everything when closing
      setTimeout(() => {
        setCurrentStep("counselor");
        setSelectedCounselor(preSelectedCounselor || null);
        setAvailableDates([]);
        setSelectedDate("");
        setAvailableSlots([]);
        setSelectedSlot(null);
        setNotes("");
      }, 300);
    }
  }, [isOpen, preSelectedCounselor]);

  const fetchAvailableDates = async (counselorId: number) => {
    try {
      setLoading(true);
      const response = await appointmentServiceApi.getAvailableDates(
        counselorId
      );
      if (response.data.success) {
        setAvailableDates(response.data.data);
        // Auto-select first available date
        if (response.data.data.length > 0) {
          setSelectedDate(response.data.data[0]);
          fetchAvailableSlots(counselorId, response.data.data[0]);
        }
      }
    } catch (error) {
      toast.error("Failed to load available dates");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (counselorId: number, date: string) => {
    try {
      setSlotsLoading(true);
      const response = await appointmentServiceApi.getAvailableSlots(
        counselorId,
        date
      );
      if (response.data.success) {
        setAvailableSlots(response.data.data);
        setSelectedSlot(null); // Reset selected slot when date changes
      }
    } catch (error) {
      toast.error("Failed to load available slots");
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleCounselorSelect = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
    setCurrentStep("datetime");
    fetchAvailableDates(counselor.id);
  };

  const handleDateSelect = (date: string) => {
    if (selectedCounselor) {
      setSelectedDate(date);
      fetchAvailableSlots(selectedCounselor.id, date);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = async () => {
    if (!selectedCounselor || !selectedSlot || !notes.trim()) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await appointmentServiceApi.createAppointment({
        counselorId: selectedCounselor.id,
        startTime: selectedSlot.startTime,
        notes: notes.trim(),
      });

      toast.success("Appointment booked successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to book appointment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepProgress = () => {
    const steps = ["counselor", "datetime", "notes", "confirmation"];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case "counselor":
        return selectedCounselor !== null;
      case "datetime":
        return selectedDate && selectedSlot;
      case "notes":
        return notes.trim().length > 0;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold mb-2">Book Appointment</h2>
          <p className="text-blue-100">Schedule your therapy session</p>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${getStepProgress()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {currentStep === "counselor" && (
            <div>
              <h3 className="text-xl font-semibold mb-6">
                Choose Your Counselor
              </h3>
              <div className="grid gap-4">
                {counselors.map((counselor) => (
                  <button
                    key={counselor.id}
                    onClick={() => handleCounselorSelect(counselor)}
                    className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                      selectedCounselor?.id === counselor.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {counselor.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {counselor.email}
                        </p>
                        {counselor.specializations && (
                          <p className="text-xs text-gray-500 mt-1">
                            {counselor.specializations.slice(0, 3).join(", ")}
                          </p>
                        )}
                      </div>
                      {counselor.rating && (
                        <div className="text-right">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(counselor.rating!)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              >
                                ★
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            {counselor.totalReviews} reviews
                          </p>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === "datetime" && selectedCounselor && (
            <div>
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Selected Counselor:
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {selectedCounselor.name}
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Date</h3>
                  {loading ? (
                    <div className="bg-gray-100 rounded-xl p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">Loading dates...</p>
                    </div>
                  ) : (
                    <CalendarDatePicker
                      availableDates={availableDates}
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                      minDate={dayjs().format("YYYY-MM-DD")}
                    />
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Time</h3>
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
            </div>
          )}

          {currentStep === "notes" && (
            <div>
              <h3 className="text-xl font-semibold mb-6">
                Tell us about your session
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{selectedCounselor?.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{dayjs(selectedDate).format("MMM D, YYYY")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {selectedSlot &&
                        dayjs(selectedSlot.startTime).format("h:mm A")}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to discuss?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Please describe what you'd like to discuss in this session. This helps your counselor prepare and provide the best support possible."
                  rows={6}
                  maxLength={1000}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    This information helps your counselor prepare for your
                    session
                  </p>
                  <span className="text-xs text-gray-500">
                    {notes.length}/1000 characters
                  </span>
                </div>
              </div>
            </div>
          )}

          {currentStep === "confirmation" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Confirm Your Appointment
              </h3>
              <p className="text-gray-600 mb-8">
                Please review your appointment details before booking
              </p>

              <div className="bg-gray-50 rounded-xl p-6 text-left max-w-md mx-auto">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Counselor</p>
                      <p className="font-medium">{selectedCounselor?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">
                        {dayjs(selectedDate).format("dddd, MMMM D, YYYY")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium">
                        {selectedSlot &&
                          `${dayjs(selectedSlot.startTime).format(
                            "h:mm A"
                          )} - ${dayjs(selectedSlot.endTime).format("h:mm A")}`}
                      </p>
                    </div>
                  </div>
                  {notes && (
                    <div className="flex items-start space-x-3">
                      <MessageCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Notes</p>
                        <p className="font-medium text-sm">{notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Your appointment request will be sent to the counselor for
                approval. You'll receive a notification once it's confirmed.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex justify-between">
            <div className="flex space-x-3">
              {currentStep !== "counselor" && (
                <button
                  onClick={() => {
                    if (currentStep === "datetime") setCurrentStep("counselor");
                    else if (currentStep === "notes")
                      setCurrentStep("datetime");
                    else if (currentStep === "confirmation")
                      setCurrentStep("notes");
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>

              {currentStep === "confirmation" ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Booking...</span>
                    </>
                  ) : (
                    <span>Book Appointment</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (currentStep === "counselor" && canProceedToNext())
                      setCurrentStep("datetime");
                    else if (currentStep === "datetime" && canProceedToNext())
                      setCurrentStep("notes");
                    else if (currentStep === "notes" && canProceedToNext())
                      setCurrentStep("confirmation");
                  }}
                  disabled={!canProceedToNext()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
