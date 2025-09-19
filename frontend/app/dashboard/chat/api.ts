import axios from "axios";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});
