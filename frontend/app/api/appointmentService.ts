import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1";

const axiosConfig = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
};

export const appointmentApi = {
  // Appointment APIs
  createAppointment: (appointmentData) =>
    axios.post(`${API_BASE_URL}/appointments`, appointmentData, axiosConfig),

  updateAppointmentStatus: (statusData) =>
    axios.put(`${API_BASE_URL}/appointments/status`, statusData, axiosConfig),

  getMyAppointments: () =>
    axios.get(`${API_BASE_URL}/appointments/my`, axiosConfig),

  getAvailableSlots: (counselorId, date) =>
    axios.get(`${API_BASE_URL}/appointments/available-slots`, {
      ...axiosConfig,
      params: { counselorId, date },
    }),

  getAvailableDates: (counselorId) =>
    axios.get(`${API_BASE_URL}/appointments/available-dates`, {
      ...axiosConfig,
      params: { counselorId },
    }),

  // Availability APIs
  createAvailability: (availabilityData) =>
    axios.post(
      `${API_BASE_URL}/appointments/availability`,
      availabilityData,
      axiosConfig
    ),

  getMyAvailability: () =>
    axios.get(`${API_BASE_URL}/appointments/availability/my`, axiosConfig),

  getCounselorAvailability: (counselorId) =>
    axios.get(
      `${API_BASE_URL}/appointments/availability/counselor/${counselorId}`,
      axiosConfig
    ),

  updateAvailability: (availabilityId, availabilityData) =>
    axios.put(
      `${API_BASE_URL}/appointments/availability/${availabilityId}`,
      availabilityData,
      axiosConfig
    ),

  deleteAvailability: (availabilityId) =>
    axios.delete(
      `${API_BASE_URL}/appointments/availability/${availabilityId}`,
      axiosConfig
    ),

  // Date-specific availability APIs
  createDateSpecificAvailability: (dateSpecificData) =>
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

  getCounselorDateSpecificAvailability: (counselorId, date = null) =>
    axios.get(
      `${API_BASE_URL}/appointments/availability/date-specific/counselor/${counselorId}`,
      {
        ...axiosConfig,
        params: date ? { date } : {},
      }
    ),

  updateDateSpecificAvailability: (availabilityId, dateSpecificData) =>
    axios.put(
      `${API_BASE_URL}/appointments/availability/date-specific/${availabilityId}`,
      dateSpecificData,
      axiosConfig
    ),

  deleteDateSpecificAvailability: (availabilityId) =>
    axios.delete(
      `${API_BASE_URL}/appointments/availability/date-specific/${availabilityId}`,
      axiosConfig
    ),

  // Counselor APIs
  getApprovedCounselors: () =>
    axios.get(`${API_BASE_URL}/auth/counselors`, axiosConfig),

  getCounselorSettings: () =>
    axios.get(`${API_BASE_URL}/appointments/counselors/settings`, axiosConfig),

  updateCounselorSettings: (settingsData) =>
    axios.put(
      `${API_BASE_URL}/appointments/counselors/settings`,
      settingsData,
      axiosConfig
    ),
};
