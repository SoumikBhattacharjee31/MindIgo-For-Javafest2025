import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth`;

const axiosConfig = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
};

export const authApi = {
  // Get all counselors (for users to select when requesting meetings)
  getCounselors: () => axios.get(`${API_BASE_URL}/counselors`, axiosConfig),

  // Get current user info (if needed)
  getCurrentUser: () => axios.get(`${API_BASE_URL}/me`, axiosConfig),

  // Verify user session (if needed)
  verifySession: () => axios.get(`${API_BASE_URL}/verify`, axiosConfig),
};
