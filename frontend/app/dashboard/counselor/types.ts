// types.ts
export interface Counselor {
  id: number;
  name: string;
  email: string;
  role?: string; // Optional, from response
  dateOfBirth?: string; // Optional
  gender?: string; // Optional
  emailVerified?: boolean; // Matches 'isEmailVerified' in DTO (serialized as camelCase)
  profileImageUrl?: string | null;
  specialization: string;
  acceptsInsurance: boolean;
  ratings?: number; // Optional: Now matches API (can be absent/null)
  createdAt: string;
  // Add other fields if used in the component
  licenseNumber?: string;
  counselorStatus?: string;
  verificationNotes?: string;
  // ... etc.
}

export interface PaginatedCounselorsResponse {
  content: Counselor[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // current page number
}
