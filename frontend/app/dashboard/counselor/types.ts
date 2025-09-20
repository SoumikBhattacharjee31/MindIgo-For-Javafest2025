// app/dashboard/counselor/types.ts (updated)
export interface Counselor {
  id: number;
  name: string;
  email: string;
  role?: string;
  dateOfBirth?: string;
  gender?: string;
  emailVerified?: boolean;
  profileImageUrl?: string | null;
  specialization: string;
  acceptsInsurance: boolean;
  ratings?: number;
  createdAt: string;
  licenseNumber?: string;
  counselorStatus?: string;
  verificationNotes?: string;
  totalRatings?: number;
}

export interface PaginatedCounselorsResponse {
  content: Counselor[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface CounselorRating {
  userName: string;
  userProfileImageUrl?: string | null;
  rating: number;
  review?: string | null;
  createdAt: string;
}

export interface PaginatedRatingsResponse {
  content: CounselorRating[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface RateCounselorRequest {
  counselorId: number;
  rating: number;
  review?: string;
}

export type MeetingStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
export type MeetingType = "VIDEO" | "AUDIO";

export interface MeetingRequest {
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