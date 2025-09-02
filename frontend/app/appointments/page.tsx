"use client"
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Settings, Plus, X, Check, AlertCircle } from 'lucide-react';
import { appointmentApi } from '../api/appointmentService';
import { toast } from 'react-toastify';

const AppointmentDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [userRole, setUserRole] = useState('CLIENT'); // This would come from auth context
  const [appointments, setAppointments] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch appointments
      const appointmentsResponse = await appointmentApi.getMyAppointments();
      setAppointments(appointmentsResponse.data.data || []);

      // Fetch counselors if client
      if (userRole === 'CLIENT') {
        const counselorsResponse = await appointmentApi.getApprovedCounselors();
        setCounselors(counselorsResponse.data.data || []);
      }

      // Fetch availability if counselor
      if (userRole === 'COUNSELOR') {
        const availabilityResponse = await appointmentApi.getMyAvailability();
        setAvailability(availabilityResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, status, notes = '', rejectionReason = '') => {
    try {
      await appointmentApi.updateAppointmentStatus({
        appointmentId,
        status,
        notes,
        rejectionReason
      });
      
      toast.success(`Appointment ${status.toLowerCase()} successfully`);
      fetchInitialData(); // Refresh data
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const AppointmentCard = ({ appointment }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'CONFIRMED': return 'bg-green-100 text-green-800';
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'REJECTED': return 'bg-red-100 text-red-800';
        case 'CANCELLED': return 'bg-gray-100 text-gray-800';
        default: return 'bg-blue-100 text-blue-800';
      }
    };

    const formatDateTime = (dateTimeString) => {
      const date = new Date(dateTimeString);
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    };

    const { date, time } = formatDateTime(appointment.startTime);

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {userRole === 'CLIENT' ? appointment.counselorName : appointment.clientName}
              </h3>
              <p className="text-gray-600">
                {userRole === 'CLIENT' ? appointment.counselorEmail : appointment.clientEmail}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
            {appointment.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{time}</span>
          </div>
        </div>

        {appointment.clientNotes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Client Notes:</p>
            <p className="text-gray-800 bg-gray-50 p-2 rounded">{appointment.clientNotes}</p>
          </div>
        )}

        {appointment.counselorNotes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Counselor Notes:</p>
            <p className="text-gray-800 bg-gray-50 p-2 rounded">{appointment.counselorNotes}</p>
          </div>
        )}

        {appointment.rejectionReason && (
          <div className="mb-4">
            <p className="text-sm text-red-600 mb-1">Rejection Reason:</p>
            <p className="text-red-800 bg-red-50 p-2 rounded">{appointment.rejectionReason}</p>
          </div>
        )}

        {userRole === 'COUNSELOR' && appointment.status === 'PENDING' && (
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => handleStatusUpdate(appointment.id, 'CONFIRMED')}
              className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              <Check className="w-4 h-4" />
              <span>Accept</span>
            </button>
            <button
              onClick={() => {
                const reason = prompt('Please provide a rejection reason:');
                if (reason) {
                  handleStatusUpdate(appointment.id, 'REJECTED', '', reason);
                }
              }}
              className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
            >
              <X className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const CreateAppointmentModal = () => {
    const [selectedCounselor, setSelectedCounselor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [notes, setNotes] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);

    useEffect(() => {
      if (selectedCounselor) {
        fetchAvailableDates();
      }
    }, [selectedCounselor]);

    useEffect(() => {
      if (selectedCounselor && selectedDate) {
        fetchAvailableSlots();
      }
    }, [selectedCounselor, selectedDate]);

    const fetchAvailableDates = async () => {
      try {
        const response = await appointmentApi.getAvailableDates(selectedCounselor);
        setAvailableDates(response.data.data || []);
      } catch (error) {
        console.error('Error fetching available dates:', error);
        toast.error('Failed to fetch available dates');
      }
    };

    const fetchAvailableSlots = async () => {
      try {
        const response = await appointmentApi.getAvailableSlots(selectedCounselor, selectedDate);
        setAvailableSlots(response.data.data || []);
      } catch (error) {
        console.error('Error fetching available slots:', error);
        toast.error('Failed to fetch available slots');
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!selectedCounselor || !selectedSlot || !notes.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }

      try {
        await appointmentApi.createAppointment({
          counselorId: parseInt(selectedCounselor),
          startTime: selectedSlot,
          notes: notes.trim()
        });

        toast.success('Appointment request created successfully');
        setShowCreateModal(false);
        fetchInitialData();
        
        // Reset form
        setSelectedCounselor('');
        setSelectedDate('');
        setSelectedSlot('');
        setNotes('');
      } catch (error) {
        console.error('Error creating appointment:', error);
        toast.error('Failed to create appointment');
      }
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Book Appointment</h2>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Counselor *
              </label>
              <select
                value={selectedCounselor}
                onChange={(e) => setSelectedCounselor(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a counselor...</option>
                {counselors.map((counselor) => (
                  <option key={counselor.id} value={counselor.id}>
                    {counselor.name} ({counselor.email})
                  </option>
                ))}
              </select>
            </div>

            {selectedCounselor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Date *
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a date...</option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedDate && availableSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Time Slot *
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a time slot...</option>
                  {availableSlots
                    .filter(slot => slot.isAvailable)
                    .map((slot, index) => (
                      <option key={index} value={slot.startTime}>
                        {new Date(slot.startTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {new Date(slot.endTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes *
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Please describe what you'd like to discuss..."
                rows={3}
                maxLength={500}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">{notes.length}/500 characters</p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              >
                Book Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AvailabilityManager = () => {
    const [showCreateAvailability, setShowCreateAvailability] = useState(false);
    const [newAvailability, setNewAvailability] = useState({
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      slotDurationMinutes: 60
    });

    const handleCreateAvailability = async (e) => {
      e.preventDefault();
      try {
        // Create a new object with the corrected time format
        const availabilityPayload = {
          ...newAvailability,
          startTime: `${newAvailability.startTime}:00`,
          endTime: `${newAvailability.endTime}:00`
        };

        // Pass the corrected payload to the API call
        await appointmentApi.createAvailability(availabilityPayload);
        
        toast.success('Availability created successfully');
        setShowCreateAvailability(false);
        setNewAvailability({
          dayOfWeek: '',
          startTime: '',
          endTime: '',
          slotDurationMinutes: 60
        });
        
        // Refresh availability
        const response = await appointmentApi.getMyAvailability();
        setAvailability(response.data.data || []);
      } catch (error) {
        console.error('Error creating availability:', error);
        toast.error('Failed to create availability');
      }
    };

    const handleDeleteAvailability = async (availabilityId) => {
      if (window.confirm('Are you sure you want to delete this availability?')) {
        try {
          await appointmentApi.deleteAvailability(availabilityId);
          toast.success('Availability deleted successfully');
          
          // Refresh availability
          const response = await appointmentApi.getMyAvailability();
          setAvailability(response.data.data || []);
        } catch (error) {
          console.error('Error deleting availability:', error);
          toast.error('Failed to delete availability');
        }
      }
    };

    const dayOptions = [
      'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
    ];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Manage Availability</h2>
          <button
            onClick={() => setShowCreateAvailability(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Availability</span>
          </button>
        </div>

        {showCreateAvailability && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Create New Availability</h3>
            <form onSubmit={handleCreateAvailability} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                <select
                  value={newAvailability.dayOfWeek}
                  onChange={(e) => setNewAvailability({...newAvailability, dayOfWeek: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select day...</option>
                  {dayOptions.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (minutes)</label>
                <select
                  value={newAvailability.slotDurationMinutes}
                  onChange={(e) => setNewAvailability({...newAvailability, slotDurationMinutes: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={newAvailability.startTime}
                  onChange={(e) => setNewAvailability({...newAvailability, startTime: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={newAvailability.endTime}
                  onChange={(e) => setNewAvailability({...newAvailability, endTime: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateAvailability(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                >
                  Create Availability
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {availability.map((avail) => (
            <div key={avail.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg capitalize">
                    {avail.dayOfWeek.toLowerCase()}
                  </h3>
                  <p className="text-gray-600">
                    {avail.startTime} - {avail.endTime}
                  </p>
                  <p className="text-sm text-gray-500">
                    {avail.slotDurationMinutes} minute slots
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    avail.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {avail.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => handleDeleteAvailability(avail.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CounselorSettings = () => {
    const [settings, setSettings] = useState({
      maxBookingDays: 10,
      defaultSlotDurationMinutes: 60,
      autoAcceptAppointments: false
    });

    useEffect(() => {
      fetchSettings();
    }, []);

    const fetchSettings = async () => {
      try {
        const response = await appointmentApi.getCounselorSettings();
        setSettings(response.data.data || settings);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    const handleUpdateSettings = async (e) => {
      e.preventDefault();
      try {
        await appointmentApi.updateCounselorSettings(settings);
        toast.success('Settings updated successfully');
      } catch (error) {
        console.error('Error updating settings:', error);
        toast.error('Failed to update settings');
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Counselor Settings</h2>
        
        <form onSubmit={handleUpdateSettings} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Booking Days in Advance
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.maxBookingDays}
              onChange={(e) => setSettings({...settings, maxBookingDays: parseInt(e.target.value)})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Clients can book appointments up to this many days in advance</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Slot Duration (minutes)
            </label>
            <select
              value={settings.defaultSlotDurationMinutes}
              onChange={(e) => setSettings({...settings, defaultSlotDurationMinutes: parseInt(e.target.value)})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoAccept"
              checked={settings.autoAcceptAppointments}
              onChange={(e) => setSettings({...settings, autoAcceptAppointments: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoAccept" className="text-sm font-medium text-gray-700">
              Auto-accept appointment requests
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Update Settings
          </button>
        </form>
      </div>
    );
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
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {userRole === 'CLIENT' ? 'My Appointments' : 'Counselor Dashboard'}
          </h1>
          <p className="text-gray-600">
            {userRole === 'CLIENT' 
              ? 'Book and manage your therapy appointments' 
              : 'Manage your appointments and availability'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                activeTab === 'appointments'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Appointments
            </button>
            {userRole === 'COUNSELOR' && (
              <>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                    activeTab === 'availability'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Availability
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-6 py-2 rounded-md font-medium transition duration-200 ${
                    activeTab === 'settings'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Settings
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        {activeTab === 'appointments' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {userRole === 'CLIENT' ? 'My Appointments' : 'Appointment Requests'}
              </h2>
              {userRole === 'CLIENT' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
              )}
            </div>

            {appointments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Appointments Found</h3>
                <p className="text-gray-500">
                  {userRole === 'CLIENT' 
                    ? 'You haven\'t booked any appointments yet. Click "Book Appointment" to get started.'
                    : 'No appointment requests at the moment.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'availability' && userRole === 'COUNSELOR' && (
          <AvailabilityManager />
        )}

        {activeTab === 'settings' && userRole === 'COUNSELOR' && (
          <CounselorSettings />
        )}

        {/* Role Switcher for Demo */}
        <div className="fixed bottom-4 right-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Demo Role:</p>
            <select
              value={userRole}
              onChange={(e) => {
                setUserRole(e.target.value);
                setActiveTab('appointments');
                fetchInitialData();
              }}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="CLIENT">Client</option>
              <option value="COUNSELOR">Counselor</option>
            </select>
          </div>
        </div>

        <CreateAppointmentModal />
      </div>
    </div>
  );
};

export default AppointmentDashboard;