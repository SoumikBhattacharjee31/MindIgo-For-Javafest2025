import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1/discussion';

const axiosConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

const multipartConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

export interface CreatePostRequest {
  title: string;
  content: string;
  category: string;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  category: string;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: number;
}

export interface ReactToPostRequest {
  reactionType: string;
}

export interface ReactToCommentRequest {
  reactionType: string;
}

export interface ReportPostRequest {
  reason: string;
  description?: string;
}

export interface ReportCommentRequest {
  reason: string;
  description?: string;
}

export interface ModerationRequest {
  reason: string;
}

export interface RestrictUserRequest {
  restrictionType: string;
  durationInHours: number;
  reason: string;
}

export const discussionApi = {
  // Health check
  healthCheck: () =>
    axios.get(`${API_BASE_URL}/health`, axiosConfig),

  // Post APIs
  createPost: (postData: CreatePostRequest, images?: FileList) => {
    const formData = new FormData();

    // 1. Create a Blob from your JSON data with the correct MIME type.
    const postBlob = new Blob([JSON.stringify(postData)], {
      type: 'application/json'
    });

    // 2. Append the Blob instead of the raw string.
    formData.append('post', postBlob);
    
    if (images && images.length > 0) {
      Array.from(images).forEach((image, index) => {
        formData.append('images', image);
      });
    }
    
    return axios.post(`${API_BASE_URL}/posts`, formData, multipartConfig);
  },

  getPosts: (params?: {
    category?: string;
    authorRole?: string;
    keyword?: string;
    sortBy?: string;
    page?: number;
    size?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.authorRole) queryParams.append('authorRole', params.authorRole);
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    return axios.get(`${API_BASE_URL}/posts?${queryParams.toString()}`, axiosConfig);
  },

  getPostById: (id: number) =>
    axios.get(`${API_BASE_URL}/posts/${id}`, axiosConfig),

  updatePost: (id: number, postData: UpdatePostRequest, newImages?: FileList) => {
    const formData = new FormData();
    formData.append('post', JSON.stringify(postData));
    
    if (newImages && newImages.length > 0) {
      Array.from(newImages).forEach((image) => {
        formData.append('newImages', image);
      });
    }
    
    return axios.put(`${API_BASE_URL}/posts/${id}`, formData, multipartConfig);
  },

  deletePost: (id: number) =>
    axios.delete(`${API_BASE_URL}/posts/${id}`, axiosConfig),

  // Comment APIs
  createComment: (postId: number, commentData: CreateCommentRequest) =>
    axios.post(`${API_BASE_URL}/posts/${postId}/comments`, commentData, axiosConfig),

  getComments: (postId: number, params?: {
    sortBy?: string;
    page?: number;
    size?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    return axios.get(`${API_BASE_URL}/posts/${postId}/comments?${queryParams.toString()}`, axiosConfig);
  },

  getCommentReplies: (commentId: number) =>
    axios.get(`${API_BASE_URL}/comments/${commentId}/replies`, axiosConfig),

  deleteComment: (id: number) =>
    axios.delete(`${API_BASE_URL}/comments/${id}`, axiosConfig),

  // Reaction APIs
  reactToPost: (postId: number, reactionData: ReactToPostRequest) =>
    axios.post(`${API_BASE_URL}/posts/${postId}/react`, reactionData, axiosConfig),

  reactToComment: (commentId: number, reactionData: ReactToCommentRequest) =>
    axios.post(`${API_BASE_URL}/comments/${commentId}/react`, reactionData, axiosConfig),

  // Report APIs
  reportPost: (postId: number, reportData: ReportPostRequest) =>
    axios.post(`${API_BASE_URL}/posts/${postId}/report`, reportData, axiosConfig),

  reportComment: (commentId: number, reportData: ReportCommentRequest) =>
    axios.post(`${API_BASE_URL}/comments/${commentId}/report`, reportData, axiosConfig),

  // Admin APIs
  getDiscussionStats: () =>
    axios.get(`${API_BASE_URL}/admin/stats`, axiosConfig),

  getPostReports: (params?: { page?: number; size?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    return axios.get(`${API_BASE_URL}/admin/reports/posts?${queryParams.toString()}`, axiosConfig);
  },

  getCommentReports: (params?: { page?: number; size?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    
    return axios.get(`${API_BASE_URL}/admin/reports/comments?${queryParams.toString()}`, axiosConfig);
  },

  moderatePost: (postId: number, moderationData: ModerationRequest) =>
    axios.post(`${API_BASE_URL}/admin/posts/${postId}/moderate`, moderationData, axiosConfig),

  moderateComment: (commentId: number, moderationData: ModerationRequest) =>
    axios.post(`${API_BASE_URL}/admin/comments/${commentId}/moderate`, moderationData, axiosConfig),

  restrictUser: (userId: number, restrictionData: RestrictUserRequest) =>
    axios.post(`${API_BASE_URL}/admin/users/${userId}/restrict`, restrictionData, axiosConfig),
};

// Types for responses
export interface PostResponse {
  id: number;
  authorId: number;
  authorName: string;
  authorRole: string;
  title: string;
  content: string;
  category: string;
  imageUrls: string[];
  reactionCount: number;
  commentCount: number;
  reactionBreakdown: { [key: string]: number };
  hasUserReacted: boolean;
  userReactionType: string;
  canEdit: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponse {
  id: number;
  postId: number;
  authorId: number;
  authorName: string;
  authorRole: string;
  content: string;
  parentCommentId?: number;
  reactionCount: number;
  replyCount: number;
  reactionBreakdown: { [key: string]: number };
  hasUserReacted: boolean;
  userReactionType: string;
  canEdit: boolean;
  replies: CommentResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
  timestamp: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface DiscussionStatsResponse {
  totalPosts: number;
  totalComments: number;
  totalReactions: number;
  pendingReports: number;
  activeRestrictions: number;
  postsToday: number;
  commentsToday: number;
}

export interface ReportResponse {
  id: number;
  postId?: number;
  commentId?: number;
  reporterEmail: string;
  reason: string;
  description?: string;
  status: string;
  reviewedByEmail?: string;
  reviewedAt?: string;
  createdAt: string;
  authorId: number; // Added: ID of the author of the reported content (for restriction)
  authorEmail: string; // Added: Email of the author
}

// Constants
export const POST_CATEGORIES = {
  PROBLEM: 'PROBLEM',
  SUGGESTION: 'SUGGESTION',
  SOLUTION: 'SOLUTION'
};

export const REACTION_TYPES = {
  LIKE: 'LIKE',
  LOVE: 'LOVE',
  HELPFUL: 'HELPFUL',
  INSIGHTFUL: 'INSIGHTFUL'
};

export const REPORT_REASONS = {
  SPAM: 'SPAM',
  HARASSMENT: 'HARASSMENT',
  INAPPROPRIATE_CONTENT: 'INAPPROPRIATE_CONTENT',
  MISINFORMATION: 'MISINFORMATION',
  HATE_SPEECH: 'HATE_SPEECH',
  OTHER: 'OTHER'
};

export const USER_ROLES = {
  USER: 'USER',
  COUNSELOR: 'COUNSELOR',
  ADMIN: 'ADMIN'
};

export const COMMENT_SORT_TYPES = {
  NEWEST: 'NEWEST',
  OLDEST: 'OLDEST',
  MOST_REACTIONS: 'MOST_REACTIONS',
  MOST_REPLIES: 'MOST_REPLIES'
};

export const RESTRICTION_TYPES = {
  POST_ONLY: 'POST_ONLY',
  COMMENT_ONLY: 'COMMENT_ONLY',
  FULL_RESTRICTION: 'FULL_RESTRICTION'
};
