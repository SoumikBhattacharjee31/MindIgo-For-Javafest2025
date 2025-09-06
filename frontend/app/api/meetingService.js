import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1/meeting";

const axiosConfig = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
};

export const meetingApi = {
  // Counselor APIs
  getCounselorSettings: () =>
    axios.get(`${API_BASE_URL}/counselor/settings`, axiosConfig),

  updateCounselorSettings: (settings) =>
    axios.put(`${API_BASE_URL}/counselor/settings`, settings, axiosConfig),

  getCounselorRequests: () =>
    axios.get(`${API_BASE_URL}/counselor/requests`, axiosConfig),

  getCounselorPendingRequests: () =>
    axios.get(`${API_BASE_URL}/counselor/requests/pending`, axiosConfig),

  acceptMeetingRequest: (requestId) =>
    axios.put(
      `${API_BASE_URL}/counselor/requests/${requestId}/accept`,
      {},
      axiosConfig
    ),

  rejectMeetingRequest: (requestId, rejectionReason) =>
    axios.put(
      `${API_BASE_URL}/counselor/requests/${requestId}/reject`,
      { rejectionReason },
      axiosConfig
    ),

  // User APIs
  createMeetingRequest: (counselorId, meetingType) =>
    axios.post(
      `${API_BASE_URL}/user/request`,
      { counselorId, meetingType },
      axiosConfig
    ),

  getUserRequests: () =>
    axios.get(`${API_BASE_URL}/user/requests`, axiosConfig),
};
