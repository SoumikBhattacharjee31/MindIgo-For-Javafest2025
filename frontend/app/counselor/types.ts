// app/counselor/types.ts

export interface ApiResponseClass<T> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  timestamp: string;
}

export interface TestResponse {
  api: string;
  status: string;
  timestamp: number;
}

export interface AuthenticationResponse {
  // Add fields based on your needs, e.g., token, userId, etc.
  token?: string;
  refreshToken?: string;
  user?: UserProfileResponse;
}

export interface ValidateResponse {
  valid: boolean;
  userId?: number;
  roles?: string[];
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  dateOfBirth?: string;
  gender?: string;
  isEmailVerified: boolean;
  profileImageUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface CounselorProfileResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  dateOfBirth?: string;
  gender?: string;
  isEmailVerified: boolean;
  profileImageUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  licenseNumber?: string;
  specialization?: string;
  verificationDocumentUrl?: string;
  counselorStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'; // Assuming enum values
  adminVerifiedBy?: number;
  adminVerifiedAt?: string;
  verificationNotes?: string;
  acceptsInsurance?: boolean;
  ratings?: number;
  totalRatings?: number; // Added for convenience
}

export interface CounselorStatusResponse {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  verifiedAt?: string;
}

export interface UserStatsResponse {
  totalUsers: number;
  totalCounselors: number;
  activeUsers: number;
}

export interface CounselorRatingResponse {
  userName: string;
  userProfileImageUrl?: string;
  rating: number;
  review?: string;
  createdAt: string;
}

export interface RateCounselorRequest {
  counselorId: number;
  rating: number;
  review?: string;
}

// Add other types as needed, e.g., for MeetingRequest, Appointment, etc.
export interface MeetingRequest {
  id: number;
  counselorId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  meetingRoomId?: string;
  // Add other fields
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
  specificDate: string;
  startTime: string;
  endTime: string;
  type: "AVAILABLE" | "UNAVAILABLE";
  slotDurationMinutes: number;
  reason: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface UpdateDateSpecificAvailability {
  specificDate: string;
  startTime: string;
  endTime: string;
  type: "AVAILABLE" | "UNAVAILABLE";
  slotDurationMinutes: number;
  reason: string | null;
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

export interface Counselor {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string | null;
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

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}