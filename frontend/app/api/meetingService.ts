import axios from "axios";

type MeetingStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
type MeetingType = "VIDEO" | "AUDIO";

interface MeetingRequest {
  id: number;
  userId: number;
  counselorId?: number;
  userUsername: string;
  counselorUsername?: string;
  meetingType: MeetingType;
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string | null;
  meetingRoomId?: string | null;
}

interface CounselorSettings {
  audioMeetingsEnabled: boolean;
  videoMeetingsEnabled: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const API_BASE_URL = "http://localhost:8080/api/v1/meeting";

const axiosConfig = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
};

export const meetingApi = {
  getCounselorSettings: () =>
    axios.get<CounselorSettings>(
      `${API_BASE_URL}/counselor/settings`,
      axiosConfig
    ),

  updateCounselorSettings: (settings: CounselorSettings) =>
    axios.put<ApiResponse<CounselorSettings>>(
      `${API_BASE_URL}/counselor/settings`,
      settings,
      axiosConfig
    ),

  getCounselorRequests: () =>
    axios.get<MeetingRequest[]>(
      `${API_BASE_URL}/counselor/requests`,
      axiosConfig
    ),

  getCounselorPendingRequests: () =>
    axios.get<MeetingRequest[]>(
      `${API_BASE_URL}/counselor/requests/pending`,
      axiosConfig
    ),

  acceptMeetingRequest: (requestId: number) =>
    axios.put<ApiResponse<MeetingRequest>>(
      `${API_BASE_URL}/counselor/requests/${requestId}/accept`,
      {},
      axiosConfig
    ),

  rejectMeetingRequest: (requestId: number, rejectionReason: string) =>
    axios.put<ApiResponse<MeetingRequest>>(
      `${API_BASE_URL}/counselor/requests/${requestId}/reject`,
      { rejectionReason },
      axiosConfig
    ),

  createMeetingRequest: (counselorId: number, meetingType: MeetingType) =>
    axios.post<ApiResponse<MeetingRequest>>(
      `${API_BASE_URL}/user/request`,
      { counselorId, meetingType },
      axiosConfig
    ),

  getUserRequests: () =>
    axios.get<MeetingRequest[]>(
      `${API_BASE_URL}/user/requests`,
      axiosConfig
    ),
};