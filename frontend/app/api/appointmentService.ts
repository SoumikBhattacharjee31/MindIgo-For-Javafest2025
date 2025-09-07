import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1";

const axiosConfig = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
};

export const appointmentServiceApi = {
  // Appointment APIs
  createAppointment: (appointmentData: {
    counselorId: number;
    startTime: string;
    notes: string;
  }) =>
    axios.post(`${API_BASE_URL}/appointments`, appointmentData, axiosConfig),

  updateAppointmentStatus: (statusData: {
    appointmentId: number;
    status: string;
    notes?: string;
    rejectionReason?: string;
  }) =>
    axios.put(`${API_BASE_URL}/appointments/status`, statusData, axiosConfig),

  getMyAppointments: () =>
    axios.get(`${API_BASE_URL}/appointments/my`, axiosConfig),

  getAppointmentById: (appointmentId: number) =>
    axios.get(`${API_BASE_URL}/appointments/${appointmentId}`, axiosConfig),

  cancelAppointment: (appointmentId: number, reason?: string) =>
    axios.put(
      `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
      { reason },
      axiosConfig
    ),

  rescheduleAppointment: (appointmentId: number, newStartTime: string) =>
    axios.put(
      `${API_BASE_URL}/appointments/${appointmentId}/reschedule`,
      { newStartTime },
      axiosConfig
    ),

  getAvailableSlots: (counselorId: number, date: string) =>
    axios.get(`${API_BASE_URL}/appointments/available-slots`, {
      ...axiosConfig,
      params: { counselorId, date },
    }),

  getAvailableDates: (counselorId: number) =>
    axios.get(`${API_BASE_URL}/appointments/available-dates`, {
      ...axiosConfig,
      params: { counselorId },
    }),

  // Availability APIs
  createAvailability: (availabilityData: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
  }) =>
    axios.post(
      `${API_BASE_URL}/appointments/availability`,
      availabilityData,
      axiosConfig
    ),

  getMyAvailability: () =>
    axios.get(`${API_BASE_URL}/appointments/availability/my`, axiosConfig),

  getCounselorAvailability: (counselorId: number) =>
    axios.get(
      `${API_BASE_URL}/appointments/availability/counselor/${counselorId}`,
      axiosConfig
    ),

  updateAvailability: (
    availabilityId: number,
    availabilityData: {
      dayOfWeek?: string;
      startTime?: string;
      endTime?: string;
      slotDurationMinutes?: number;
      isActive?: boolean;
    }
  ) =>
    axios.put(
      `${API_BASE_URL}/appointments/availability/${availabilityId}`,
      availabilityData,
      axiosConfig
    ),

  deleteAvailability: (availabilityId: number) =>
    axios.delete(
      `${API_BASE_URL}/appointments/availability/${availabilityId}`,
      axiosConfig
    ),

  toggleAvailability: (availabilityId: number) =>
    axios.patch(
      `${API_BASE_URL}/appointments/availability/${availabilityId}/toggle`,
      {},
      axiosConfig
    ),

  // Date-specific availability APIs
  createDateSpecificAvailability: (dateSpecificData: {
    date: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    isAvailable?: boolean;
  }) =>
    axios.post(
      `${API_BASE_URL}/appointments/availability/date-specific`,
      dateSpecificData,
      axiosConfig
    ),

  getMyDateSpecificAvailability: () =>
    axios.get(
      `${API_BASE_URL}/appointments/availability/date-specific/my`,
      axiosConfig
    ),

  getCounselorDateSpecificAvailability: (counselorId: number, date?: string) =>
    axios.get(
      `${API_BASE_URL}/appointments/availability/date-specific/counselor/${counselorId}`,
      {
        ...axiosConfig,
        params: date ? { date } : {},
      }
    ),

  updateDateSpecificAvailability: (
    availabilityId: number,
    dateSpecificData: {
      date?: string;
      startTime?: string;
      endTime?: string;
      slotDurationMinutes?: number;
      isAvailable?: boolean;
    }
  ) =>
    axios.put(
      `${API_BASE_URL}/appointments/availability/date-specific/${availabilityId}`,
      dateSpecificData,
      axiosConfig
    ),

  deleteDateSpecificAvailability: (availabilityId: number) =>
    axios.delete(
      `${API_BASE_URL}/appointments/availability/date-specific/${availabilityId}`,
      axiosConfig
    ),

  // Counselor APIs
  getApprovedCounselors: () =>
    axios.get(`${API_BASE_URL}/auth/counselors`, axiosConfig),

  getCounselorById: (counselorId: number) =>
    axios.get(`${API_BASE_URL}/auth/counselors/${counselorId}`, axiosConfig),

  getCounselorSettings: () =>
    axios.get(`${API_BASE_URL}/appointments/counselors/settings`, axiosConfig),

  updateCounselorSettings: (settingsData: {
    maxBookingDays?: number;
    defaultSlotDurationMinutes?: number;
    autoAcceptAppointments?: boolean;
    requireApproval?: boolean;
    bufferTimeMinutes?: number;
  }) =>
    axios.put(
      `${API_BASE_URL}/appointments/counselors/settings`,
      settingsData,
      axiosConfig
    ),

  // Statistics APIs
  getAppointmentStats: (period: "week" | "month" | "year" = "month") =>
    axios.get(`${API_BASE_URL}/appointments/stats`, {
      ...axiosConfig,
      params: { period },
    }),

  getCounselorStats: (period: "week" | "month" | "year" = "month") =>
    axios.get(`${API_BASE_URL}/appointments/counselor/stats`, {
      ...axiosConfig,
      params: { period },
    }),

  // Notification APIs
  getNotifications: () =>
    axios.get(`${API_BASE_URL}/notifications`, axiosConfig),

  markNotificationRead: (notificationId: number) =>
    axios.patch(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {},
      axiosConfig
    ),

  // Search and Filter APIs
  searchAppointments: (filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    counselorId?: number;
    clientId?: number;
  }) =>
    axios.get(`${API_BASE_URL}/appointments/search`, {
      ...axiosConfig,
      params: filters,
    }),
};

// Export types
export interface Counselor {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string;
  specializations?: string[];
  bio?: string;
  rating?: number;
  totalReviews?: number;
  isActive: boolean;
  approvedAt?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  duration?: number;
}

export interface Appointment {
  id: number;
  clientId: number;
  counselorId: number;
  clientEmail: string;
  counselorEmail: string;
  clientName?: string;
  counselorName: string;
  startTime: string;
  endTime: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "REJECTED"
    | "CANCELLED"
    | "COMPLETED"
    | "RESCHEDULED";
  clientNotes?: string;
  counselorNotes?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Availability {
  id: number;
  counselorId: number;
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DateSpecificAvailability {
  id: number;
  counselorId: number;
  date: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CounselorSettings {
  id: number;
  counselorId: number;
  maxBookingDays: number;
  defaultSlotDurationMinutes: number;
  autoAcceptAppointments: boolean;
  requireApproval: boolean;
  bufferTimeMinutes: number;
  allowWeekendBookings: boolean;
  createdAt: string;
  updatedAt: string;
}
