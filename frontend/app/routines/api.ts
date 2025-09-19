// services/routineService.ts
import axios from "axios";
import {
  CreateRoutineRequest,
  RoutineResponse,
  AssignRoutineRequest,
} from "@/app/routines/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/routines`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
});

// Add request interceptor to include doctor ID header where needed
api.interceptors.request.use((config) => {
  const doctorId = localStorage.getItem("doctorId");
  if (doctorId && (config.method === "put" || config.method === "delete")) {
    config.headers["X-Doctor-Id"] = doctorId;
  }
  return config;
});

export const routineService = {
  // Create a new routine
  createRoutine: async (
    request: CreateRoutineRequest
  ): Promise<RoutineResponse> => {
    const response = await api.post<RoutineResponse>("/", request);
    return response.data;
  },

  // Update an existing routine
  updateRoutine: async (
    routineId: number,
    request: CreateRoutineRequest,
    doctorId: number
  ): Promise<RoutineResponse> => {
    const response = await api.put<RoutineResponse>(`/${routineId}`, request, {
      headers: { "X-Doctor-Id": doctorId.toString() },
    });
    return response.data;
  },

  // Get routine by ID
  getRoutineById: async (routineId: number): Promise<RoutineResponse> => {
    const response = await api.get<RoutineResponse>(`/${routineId}`);
    return response.data;
  },

  // Get all routines by doctor
  getRoutinesByDoctor: async (doctorId: number): Promise<RoutineResponse[]> => {
    const response = await api.get<RoutineResponse[]>(`/doctor/${doctorId}`);
    return response.data;
  },

  // Delete routine
  deleteRoutine: async (routineId: number, doctorId: number): Promise<void> => {
    await api.delete(`/${routineId}`, {
      headers: { "X-Doctor-Id": doctorId.toString() },
    });
  },

  // Assign routine to patient
  assignRoutineToPatient: async (
    request: AssignRoutineRequest
  ): Promise<void> => {
    await api.post("/assign", request);
  },

  // Unassign routine from patient
  unassignRoutineFromPatient: async (
    patientId: number,
    routineId: number
  ): Promise<void> => {
    await api.delete(`/unassign/patient/${patientId}/routine/${routineId}`);
  },

  // Get patient routines
  getPatientRoutines: async (patientId: number): Promise<RoutineResponse[]> => {
    const response = await api.get<RoutineResponse[]>(`/patient/${patientId}`);
    return response.data;
  },
};
