// app/counselor/api.ts

import axios from 'axios';
import { ApiResponseClass, CounselorProfileResponse, CounselorRatingResponse, Page, UserProfileResponse, RateCounselorRequest, Appointment, Availability, DateSpecificAvailability, UpdateDateSpecificAvailability, CounselorSettings, TimeSlot, Counselor } from "@/app/counselor/types";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export const getCurrentUserProfile = async (): Promise<UserProfileResponse> => {
  try {
    const response = await axios.get<ApiResponseClass<UserProfileResponse>>(`${API_BASE_URL}/api/v1/auth/profile`, {
      withCredentials: true,
    });
    const data = response.data;
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Invalid response');
    }
    return data.data;
  } catch (error) {
    throw new Error('Failed to fetch current user profile');
  }
};

export const getCounselorProfileById = async (id: string): Promise<CounselorProfileResponse> => {
  try {
    const response = await axios.get<ApiResponseClass<CounselorProfileResponse>>(`${API_BASE_URL}/api/v1/auth/counselorprofilebyid/${id}`, {
      withCredentials: true,
    });
    const data = response.data;
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Invalid response');
    }
    return data.data;
  } catch (error) {
    throw new Error('Failed to fetch counselor profile');
  }
};

export const getRatingsForCounselor = async (counselorId: number, page: number, size: number): Promise<Page<CounselorRatingResponse>> => {
  try {
    const response = await axios.get<ApiResponseClass<Page<CounselorRatingResponse>>>(`${API_BASE_URL}/api/v1/auth/ratings/counselor/${counselorId}?page=${page}&size=${size}`, {
      withCredentials: true,
    });
    const data = response.data;
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Invalid response');
    }
    return data.data;
  } catch (error) {
    throw new Error('Failed to fetch ratings');
  }
};

export const rateCounselor = async (request: RateCounselorRequest): Promise<void> => {
  try {
    const response = await axios.post<ApiResponseClass<void>>(`${API_BASE_URL}/api/v1/auth/ratings/counselor`, request, {
      withCredentials: true,
    });
    const data = response.data;
    if (!data.success) {
      throw new Error(data.message || 'Invalid response');
    }
  } catch (error) {
    throw new Error('Failed to submit rating');
  }
};

export const appointmentServiceApi = {
  // Appointment APIs
  createAppointment: async (appointmentData: {
    counselorId: number;
    startTime: string;
    notes: string;
  }) => 
    await axios.post<ApiResponseClass<Appointment>>(`${API_BASE_URL}/api/v1/appointments`, appointmentData, { withCredentials: true }),

  updateAppointmentStatus: async (statusData: {
    appointmentId: number;
    status: string;
    notes?: string;
    rejectionReason?: string;
  }) => 
    await axios.put<ApiResponseClass<void>>(`${API_BASE_URL}/api/v1/appointments/status`, statusData, { withCredentials: true }),

  getMyAppointments: async () => 
    await axios.get<ApiResponseClass<Appointment[]>>(`${API_BASE_URL}/api/v1/appointments/my`, { withCredentials: true }),

  getAppointmentById: async (appointmentId: number) => 
    await axios.get<ApiResponseClass<Appointment>>(`${API_BASE_URL}/api/v1/appointments/${appointmentId}`, { withCredentials: true }),

  cancelAppointment: async (appointmentId: number, reason?: string) => 
    await axios.put<ApiResponseClass<void>>(`${API_BASE_URL}/api/v1/appointments/${appointmentId}/cancel`, { reason }, { withCredentials: true }),

  rescheduleAppointment: async (appointmentId: number, newStartTime: string) => 
    await axios.put<ApiResponseClass<void>>(`${API_BASE_URL}/api/v1/appointments/${appointmentId}/reschedule`, { newStartTime }, { withCredentials: true }),

  getAvailableSlots: async (counselorId: number, date: string) => 
    await axios.get<ApiResponseClass<TimeSlot[]>>(`${API_BASE_URL}/api/v1/appointments/available-slots`, {
      withCredentials: true,
      params: { counselorId, date },
    }),

  getAvailableDates: async (counselorId: number) => 
    await axios.get<ApiResponseClass<string[]>>(`${API_BASE_URL}/api/v1/appointments/available-dates`, {
      withCredentials: true,
      params: { counselorId },
    }),

  // Availability APIs
  createAvailability: async (availabilityData: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
  }) => 
    await axios.post<ApiResponseClass<Availability>>(`${API_BASE_URL}/api/v1/appointments/availability`, availabilityData, { withCredentials: true }),

  getMyAvailability: async () => 
    await axios.get<ApiResponseClass<Availability[]>>(`${API_BASE_URL}/api/v1/appointments/availability/my`, { withCredentials: true }),

  getCounselorAvailability: async (counselorId: number) => 
    await axios.get<ApiResponseClass<Availability[]>>(`${API_BASE_URL}/api/v1/appointments/availability/counselor/${counselorId}`, { withCredentials: true }),

  updateAvailability: async (
    availabilityId: number,
    availabilityData: {
      dayOfWeek?: string;
      startTime?: string;
      endTime?: string;
      slotDurationMinutes?: number;
      isActive?: boolean;
    }
  ) => 
    await axios.put<ApiResponseClass<void>>(`${API_BASE_URL}/api/v1/appointments/availability/${availabilityId}`, availabilityData, { withCredentials: true }),

  deleteAvailability: async (availabilityId: number) => 
    await axios.delete<ApiResponseClass<void>>(`${API_BASE_URL}/api/v1/appointments/availability/${availabilityId}`, { withCredentials: true }),

  toggleAvailability: async (availabilityId: number) => 
    await axios.patch<ApiResponseClass<void>>(`${API_BASE_URL}/api/v1/appointments/availability/${availabilityId}/toggle`, {}, { withCredentials: true }),

  // Date-specific availability APIs
  createDateSpecificAvailability: async (dateSpecificData: {
    specificDate: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    type: string;
    reason: string;
  }) => 
    await axios.post<ApiResponseClass<DateSpecificAvailability>>(`${API_BASE_URL}/api/v1/appointments/availability/date-specific`, dateSpecificData, { withCredentials: true }),

  getMyDateSpecificAvailability: async () => 
    await axios.get<ApiResponseClass<DateSpecificAvailability[]>>(`${API_BASE_URL}/api/v1/appointments/availability/date-specific/my`, { withCredentials: true }),

  getCounselorDateSpecificAvailability: async (counselorId: number, date?: string) => 
    await axios.get<ApiResponseClass<DateSpecificAvailability[]>>(`${API_BASE_URL}/api/v1/appointments/availability/date-specific/counselor/${counselorId}`, {
      withCredentials: true,
      params: date ? { date } : {},
    }),

  updateDateSpecificAvailability: async (
    availabilityId: number,
    dateSpecificData: Partial<UpdateDateSpecificAvailability>
  ) => 
    await axios.put<ApiResponseClass<void>>(`${API_BASE_URL}/api/v1/appointments/availability/date-specific/${availabilityId}`, dateSpecificData, { withCredentials: true }),

  deleteDateSpecificAvailability: async (availabilityId: number) => 
    await axios.delete<ApiResponseClass<void>>(`${API_BASE_URL}/api/v1/appointments/availability/date-specific/${availabilityId}`, { withCredentials: true }),

  // Counselor APIs
  getApprovedCounselors: async () => 
    await axios.get<ApiResponseClass<Counselor[]>>(`${API_BASE_URL}/api/v1/auth/counselors`, { withCredentials: true }),

  getCounselorById: async (counselorId: number) => 
    await axios.get<ApiResponseClass<Counselor>>(`${API_BASE_URL}/api/v1/auth/counselors/${counselorId}`, { withCredentials: true }),

  getCounselorSettings: async () => 
    await axios.get<ApiResponseClass<CounselorSettings>>(`${API_BASE_URL}/api/v1/appointments/counselors/settings`, { withCredentials: true }),

  updateCounselorSettings: async (settingsData: Partial<CounselorSettings>) => 
    await axios.put<ApiResponseClass<void>>(`${API_BASE_URL}/api/v1/appointments/counselors/settings`, settingsData, { withCredentials: true }),

  // Statistics APIs
  getAppointmentStats: async (period: "week" | "month" | "year" = "month") => 
    await axios.get<ApiResponseClass<any>>(`${API_BASE_URL}/api/v1/appointments/stats`, {
      withCredentials: true,
      params: { period },
    }),

  getCounselorStats: async (period: "week" | "month" | "year" = "month") => 
    await axios.get<ApiResponseClass<any>>(`${API_BASE_URL}/api/v1/appointments/counselor/stats`, {
      withCredentials: true,
      params: { period },
    }),

  // Notification APIs
  getNotifications: async () => 
    await axios.get<ApiResponseClass<any>>(`${API_BASE_URL}/api/v1/notifications`, { withCredentials: true }),

  markNotificationRead: async (notificationId: number) => 
    await axios.patch<ApiResponseClass<void>>(`${API_BASE_URL}/api/v1/notifications/${notificationId}/read`, {}, { withCredentials: true }),

  // Search and Filter APIs
  searchAppointments: async (filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    counselorId?: number;
    clientId?: number;
  }) => 
    await axios.get<ApiResponseClass<Appointment[]>>(`${API_BASE_URL}/api/v1/appointments/search`, {
      withCredentials: true,
      params: filters,
    }),
};