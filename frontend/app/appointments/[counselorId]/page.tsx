// app/appointments/[counselorId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  User, 
  MessageCircle, 
  CheckCircle, 
  XCircle,
  ChevronLeft
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';

import { appointmentServiceApi } from '@/app/api/appointmentService';

interface Counselor {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Appointment {
  id: number;
  clientId: number;
  counselorId: number;
  clientEmail: string;
  counselorEmail: string;
  startTime: string;
  endTime: string;
  status: string;
  clientNotes?: string;
  counselorNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  counselorName: string;
}

const CounselorAppointmentPage = () => {
  const pathname = usePathname();
  const counselorId = parseInt(pathname.split('/')[2]);
  
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [counselor, setCounselor] = useState<Counselor | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Get cookies
  useEffect(() => {
    const role = localStorage.getItem('role') || '';
    const id = localStorage.getItem('id');
    
    if (!role || !id) {
      window.location.href = '/login';
      return;
    }
    
    setUserRole(role);
    setUserId(parseInt(id));
    setLoading(false);
  }, []);

  // Load counselor data
  useEffect(() => {
    if (!userRole || !userId) return;
    
    const loadData = async () => {
      try {
        // Load counselor details
        const counselorsResponse = await appointmentServiceApi.getMyAppointments(); // This will include counselor info
        const counselorData = counselorsResponse.data.data.find((app: Appointment) => app.counselorId === counselorId);
        
        if (counselorData) {
          setCounselor({
            id: counselorData.counselorId,
            name: counselorData.counselorName,
            email: counselorData.counselorEmail,
            // Note: We don't have profile image in the appointment response
            // In a real app, we would need a separate endpoint to get counselor details
          });
        }
        
        // Load available dates
        const datesResponse = await appointmentServiceApi.getAvailableDates(counselorId);
        if (datesResponse.data.success) {
          setAvailableDates(datesResponse.data.data);
          // Set the first available date as selected
          if (datesResponse.data.data.length > 0) {
            setSelectedDate(datesResponse.data.data[0]);
          }
        }
        
        // Load my appointments
        const appointmentsResponse = await appointmentServiceApi.getMyAppointments();
        if (appointmentsResponse.data.success) {
          setMyAppointments(appointmentsResponse.data.data);
        }
      } catch (error) {
        toast.error('Failed to load data');
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, [userRole, userId, counselorId]);

  // Load available slots when date is selected
  useEffect(() => {
    if (counselor && selectedDate) {
      const loadAvailableSlots = async () => {
        try {
          const response = await appointmentServiceApi.getAvailableSlots(
            counselor.id, 
            selectedDate
          );
          if (response.data.success) {
            setAvailableSlots(response.data.data);
          }
        } catch (error) {
          toast.error('Failed to load available slots');
          console.error('Error loading available slots:', error);
        }
      };
      
      loadAvailableSlots();
    }
  }, [counselor, selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.isAvailable) {
      setSelectedSlot(slot);
    }
  };

  const handleBookAppointment = async () => {
    if (!counselor || !selectedSlot || !userId) {
      toast.error('Please select a time slot');
      return;
    }

    setBookingLoading(true);
    try {
      const response = await appointmentServiceApi.createAppointment({
        counselorId: counselor.id,
        startTime: selectedSlot.startTime,
        notes: appointmentNotes
      });
      
      if (response.data.success) {
        toast.success('Appointment booked successfully!');
        
        // Refresh appointments
        const appointmentsResponse = await appointmentServiceApi.getMyAppointments();
        if (appointmentsResponse.data.success) {
          setMyAppointments(appointmentsResponse.data.data);
        }
        
        // Reset form
        setSelectedSlot(null);
        setAppointmentNotes('');
      } else {
        toast.error(response.data.message || 'Failed to book appointment');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
      console.error('Error booking appointment:', error);
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Counselor Not Found</h1>
            <p className="text-gray-600">The counselor you're looking for doesn't exist.</p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <ChevronLeft className="w-4 h-4 inline mr-2" />
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              {counselor.profileImageUrl ? (
                <img
                  className="h-48 w-full object-cover md:w-48"
                  src={counselor.profileImageUrl}
                  alt={counselor.name}
                />
              ) : (
                <div className="h-48 w-full bg-blue-100 flex items-center justify-center md:w-48">
                  <User className="w-24 h-24 text-blue-600" />
                </div>
              )}
            </div>
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900">{counselor.name}</h1>
              <p className="mt-2 text-gray-600">{counselor.email}</p>
              <div className="mt-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  Counselor
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Dates */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Available Dates</h2>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableDates.length > 0 ? (
                  availableDates.map(date => (
                    <button
                      key={date}
                      onClick={() => handleDateSelect(date)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedDate === date
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {dayjs(date).format('dddd, MMMM D, YYYY')}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500">No available dates</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Available Time Slots */}
          <div className="lg:col-span-2">
            {selectedDate && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Available Time Slots for {dayjs(selectedDate).format('MMMM D, YYYY')}
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!slot.isAvailable}
                        className={`
                          p-4 rounded-lg border-2 text-sm font-medium transition-all
                          ${slot.isAvailable 
                            ? selectedSlot?.startTime === slot.startTime
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        <div>{dayjs(slot.startTime).format('h:mm A')}</div>
                        <div className="text-xs mt-1">
                          {dayjs.duration(
                            dayjs(slot.endTime).diff(dayjs(slot.startTime))
                          ).asMinutes()} min
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No available slots for this date
                    </div>
                  )}
                </div>
                
                {selectedSlot && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={handleBookAppointment}
                        disabled={bookingLoading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                      >
                        {bookingLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            <span>Booking...</span>
                          </>
                        ) : (
                          'Book Appointment'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* My Appointments */}
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">My Appointments with {counselor.name}</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {myAppointments.filter(app => app.counselorId === counselorId).length > 0 ? (
              myAppointments
                .filter(app => app.counselorId === counselorId)
                .map(appointment => (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {appointment.counselorName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1">{appointment.status}</span>
                          </span>
                        </div>
                        
                        <div className="flex flex-col space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {dayjs(appointment.startTime).format('MMMM D, YYYY')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {dayjs(appointment.startTime).format('h:mm A')} - {dayjs(appointment.endTime).format('h:mm A')}
                            <span className="ml-2">
                              ({dayjs.duration(dayjs(appointment.endTime).diff(dayjs(appointment.startTime))).asMinutes()} min)
                            </span>
                          </div>
                          {appointment.clientNotes && (
                            <div className="flex items-start">
                              <MessageCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{appointment.clientNotes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {appointment.status === 'PENDING' && userRole === 'CLIENT' && (
                          <button
                            onClick={() => {
                              // This would require implementing the update status functionality
                              toast.info('Cancel functionality not implemented in this demo');
                            }}
                            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                You don't have any appointments with this counselor yet.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
};

export default CounselorAppointmentPage;