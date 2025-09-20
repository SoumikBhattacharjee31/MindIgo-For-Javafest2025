import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

// Types for Quiz API requests and responses
export interface QuizGenerationParams {
  file_url: string;
  num_questions: number;
  question_types: string[];
  assessment_areas: string[];
  difficulty: string;
}

export interface QuizQuestion {
  question: string;
  type: 'mcq' | 'scale' | 'descriptive';
  options?: string[] | null;
  scale_min?: number | null;
  scale_max?: number | null;
  scale_labels?: Record<string, string> | null;
}

export interface GeneratedQuizData {
  file_id: number;
  quizzes: QuizQuestion[];
}

export interface SaveQuizRequest {
  file_id: number;
  quizzes: QuizQuestion[];
}

export interface SaveQuizResponse {
  file_id: string;
  quizCode: string;
  totalQuestions: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Configure axios instance for quiz APIs
const quizApiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Response interceptor for better error handling
quizApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message) {
      console.error('Quiz API Error:', error.response.data.message);
    }
    throw error;
  }
);

export const quizApi = {
  /**
   * Fetch list of uploaded papers/files
   */
  getFilesList: async (): Promise<string[]> => {
    try {
      const response = await quizApiClient.get<ApiResponse<string[]>>('/api/v1/file/list/papers');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch files');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  },

  /**
   * Upload a new paper/file
   */
  uploadFile: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await quizApiClient.post<ApiResponse<string>>(
        '/api/v1/file/upload/papers',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'File upload failed');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  /**
   * Generate quiz from uploaded file
   */
  generateQuiz: async (params: QuizGenerationParams): Promise<GeneratedQuizData> => {
    try {
      // Validate the request data
      if (!params.file_url || !params.num_questions || !params.question_types?.length || !params.assessment_areas?.length || !params.difficulty) {
        throw new Error('Missing required fields for quiz generation');
      }

      const response = await quizApiClient.post<ApiResponse<GeneratedQuizData>>(
        '/api/v1/genai/quiz/generate',
        params,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Quiz generation failed');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  },

  /**
   * Save generated quiz
   */
  saveQuiz: async (saveQuizRequest: SaveQuizRequest): Promise<SaveQuizResponse> => {
    try {
      // Validate the request data
      if (!saveQuizRequest.file_id || !saveQuizRequest.quizzes?.length) {
        throw new Error('Missing required fields: file_id or quizzes');
      }

      const response = await quizApiClient.post<ApiResponse<SaveQuizResponse>>(
        '/api/v1/content/quiz/generate',
        saveQuizRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to save quiz');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error saving quiz:', error);
      throw error;
    }
  },
};

// Helper functions
export const getQuizApiErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 400) {
      return 'Invalid request parameters';
    } else if (error.response?.status === 401) {
      return 'Unauthorized access';
    } else if (error.response?.status === 403) {
      return 'Access denied';
    } else if (error.response?.status === 413) {
      return 'File too large';
    } else if (error.response?.status === 415) {
      return 'Unsupported file type';
    } else if (error.response?.status === 429) {
      return 'Too many requests. Please try again later.';
    } else if (error.response?.status === 500) {
      return 'Server error occurred';
    } else {
      return error.response?.data?.message || 'Request failed';
    }
  } else if (error.message) {
    return error.message;
  } else {
    return 'Network error occurred';
  }
};

export default quizApi;