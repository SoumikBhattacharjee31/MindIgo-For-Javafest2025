// app/dashboard/counselor/api/index.ts
import axios from "axios";
import { PaginatedCounselorsResponse, Counselor, PaginatedRatingsResponse, RateCounselorRequest } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/auth`,
  withCredentials: true,
});

// Interface for the API call parameters
interface GetCounselorsParams {
  page: number;
  size: number;
  search?: string;
  specialization?: string;
  acceptsInsurance?: boolean;
  sort: string;
}

// Fetches the list of counselors with pagination and filtering
export const getCounselors = async (
  params: GetCounselorsParams
): Promise<PaginatedCounselorsResponse> => {
  const response = await apiClient.get("/counselor", { params });
  return response.data.data;
};

// Fetches a single counselor by their ID
export const getCounselorById = async (id: string): Promise<Counselor> => {
  const response = await apiClient.get(`/counselorprofilebyid/${id}`);
  return response.data.data;
};

// Rate a counselor
export const rateCounselor = async (request: RateCounselorRequest): Promise<void> => {
  await apiClient.post("/ratings/counselor", request);
};

// Get ratings for a counselor
export const getRatingsForCounselor = async (
  counselorId: string,
  page: number = 0,
  size: number = 5
): Promise<PaginatedRatingsResponse> => {
  const response = await apiClient.get(`/ratings/counselor/${counselorId}`, {
    params: { page, size }
  });
  return response.data.data;
};