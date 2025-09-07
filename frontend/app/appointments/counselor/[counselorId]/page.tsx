// app/appointments/counselor/[counselorId]/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Star, 
  MapPin, 
  Award, 
  Users, 
  MessageSquare, 
  CheckCircle,
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  BookOpen,
  Heart,
  Brain,
  Shield,
  Loader2,
  ChevronRight,
  Quote
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';

import { appointmentServiceApi, Counselor, TimeSlot } from '@/app/api/appointmentService';
import CalendarDatePicker from '@/app/components/appointments/CalendarDatePicker';
import TimeSlotPicker from '@/app/components/appointments/TimeSlotPicker';
import BookingModal from '@/app/components/appointments/BookingModal';

const CounselorBookingPage = () => {
  const params = useParams();
  const router = useRouter();
  const counselorId = parseInt(params.counselorId as string);
  
  const [counselor, setCounselor] = useState<Counselor | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Mock reviews data -in a real app, this would come from an API
  const mockReviews = [
    {
      id: 1,
      clientName: "Sarah M.",
      rating: 5,
      comment: "Dr. Johnson helped me tremendously with my anxiety. Very professional and caring approach.",
      date: "2024-02-15",
      verified: true
    },
    {
      id: 2,
      clientName: "Michael R.",
      rating: 5,
      comment: "Excellent counselor. Great communication skills and very understanding.",
      date: "2024-02-10",
      verified: true
    },
    {
      id: 3,
      clientName: "Jennifer L.",
      rating: 4,
      comment: "Really helped me work through my challenges. Highly recommend!",
      date: "2024-02-05",
      verified: true
    }
  ];

  const mockSpecializations = [
    { name: "Anxiety Disorders", icon: Brain, color: "blue" },
    { name: "Depression", icon: Heart, color: "green" },
    { name: "Trauma Therapy", icon: Shield, color: "purple" },
    { name: "Couples Counseling", icon: Users, color: "pink" },
    { name: "Cognitive Behavioral Therapy", icon: BookOpen, color: "indigo" },
    { name: "Mindfulness-Based Therapy", icon: Brain, color: "teal" }
  ];

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
        appointmentServiceApi.getAvailableDates(counselorId)
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
      toast.error('Failed to load counselor information');
      router.push('/appointments/client');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date: string) => {
    setSlotsLoading(true);
    try {
      const response = await appointmentServiceApi.getAvailableSlots(counselorId, date);
      if (response.data.success) {
        setAvailableSlots(response.data.data);
        setSelectedSlot(null);
      }
    } catch (error) {
      toast.error('Failed to load available slots');
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
      toast.error('Please select a time slot');
      return;
    }
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">Loading counselor profile...</p>
        </div>
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Counselor Not Found</h2>
          <p className="text-gray-600 mb-6">The requested counselor could not be found.</p>
          <button
            onClick={() => router.push('/appointments/client')}
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
          onClick={() => router.push('/appointments/client')}
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
                        {counselor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-16 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{counselor.name}</h1>
                    <p className="text-gray-600">Licensed Professional Counselor</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold text-gray-900">{counselor.rating || 4.8}</span>
                    <span className="text-gray-500 text-sm">({counselor.totalReviews || 156})</span>
                  </div>
                </div>

                {counselor.bio && (
                  <p className="text-gray-600 mb-6 leading-relaxed">{counselor.bio}</p>
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
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">500+ Clients Helped</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">8+</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">95%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specializations</h3>
              <div className="space-y-3">
                {mockSpecializations.slice(0, 6).map((spec, index) => {
                  const Icon = spec.icon;
                  return (
                    <div key={index} className={`flex items-center space-x-3 p-3 bg-${spec.color}-50 rounded-lg border border-${spec.color}-200`}>
                      <Icon className={`w-5 h-5 text-${spec.color}-600`} />
                      <span className="text-gray-700 font-medium">{spec.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Credentials */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Credentials & Education</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Award className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Licensed Professional Counselor</p>
                    <p className="text-sm text-gray-600">State Board Certified</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Master's in Clinical Psychology</p>
                    <p className="text-sm text-gray-600">University of Psychology</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">EMDR Certified</p>
                    <p className="text-sm text-gray-600">Trauma Therapy Specialist</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Session Duration</span>
                  <span className="font-medium">50 minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Session Type</span>
                  <span className="font-medium">Individual Therapy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Format</span>
                  <span className="font-medium">Video Call</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-medium">Within 24 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Interface */}
          <div className="lg:col-span-2">
            {/* Booking Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Book Your Session</h2>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Starting at</div>
                  <div className="text-2xl font-bold text-blue-600">$120</div>
                  <div className="text-sm text-gray-500">per session</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Date Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
                  <CalendarDatePicker
                    availableDates={availableDates}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    minDate={dayjs().format('YYYY-MM-DD')}
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Time</h3>
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
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Counselor</span>
                      <span className="font-medium">{counselor.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Date</span>
                      <span className="font-medium">{dayjs(selectedDate).format('dddd, MMMM D, YYYY')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Time</span>
                      <span className="font-medium">
                        {dayjs(selectedSlot.startTime).format('h:mm A')} - {dayjs(selectedSlot.endTime).format('h:mm A')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">50 minutes</span>
                    </div>
                    <div className="border-t border-blue-200 pt-3 flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-xl text-blue-600">$120</span>
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">About Dr. {counselor.name}</h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Dr. {counselor.name} is a licensed professional counselor with over 8 years of experience 
                  helping individuals overcome anxiety, depression, and trauma. She specializes in evidence-based 
                  approaches including Cognitive Behavioral Therapy (CBT) and EMDR.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Her compassionate and client-centered approach creates a safe space for healing and growth. 
                  She has worked with diverse populations and understands the unique challenges each person faces.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Dr. {counselor.name} believes in empowering her clients with practical tools and strategies 
                  that can be applied in daily life, fostering long-term resilience and well-being.
                </p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Client Reviews</h3>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{counselor.rating || 4.8}</span>
                  <span className="text-gray-500">({counselor.totalReviews || 156} reviews)</span>
                </div>
              </div>

              <div className="space-y-6">
                {mockReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {review.clientName.split(' ')[0][0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.clientName}</p>
                          <p className="text-sm text-gray-500">{dayjs(review.date).format('MMM D, YYYY')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <Quote className="absolute -top-2 -left-2 w-6 h-6 text-gray-300" />
                      <p className="text-gray-700 pl-4 italic leading-relaxed">{review.comment}</p>
                    </div>
                    {review.verified && (
                      <div className="mt-3 flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Verified Client</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2 mx-auto transition-colors">
                  <span>View All Reviews</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {counselor && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            toast.success('Appointment booked successfully!');
            router.push('/appointments/client');
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