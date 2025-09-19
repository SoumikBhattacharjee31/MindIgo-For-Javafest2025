import axios from 'axios';

// ============ BASE CONFIG ============
const BASE_URL = 'http://localhost:8080';

// ============ TYPE DEFINITIONS ============
export interface QuizStartRequest {
  quizCode: string;
}

export interface QuizAnswerRequest {
  sessionId: number;
  quizId: number;
  answer: string;
}

export interface Quiz {
  id: number;
  quizCode: string;
  fileId: string;
  question: string;
  sequenceNumber: number;
  type: 'SCALE' | 'MCQ' | 'DESCRIPTIVE';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { [key: string]: string };
  createdAt: string;
  updatedAt: string;
}

export interface QuizSessionResponse {
  sessionId: number;
  quizCode: string;
  currentQuestionSequence: number;
  totalQuestions: number;
  progressPercentage: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  startedAt: string;
  completedAt?: string;
  currentQuestion?: Quiz;
  message: string;
}

export interface UserQuizSession {
  id: number;
  userId: string;
  quizCode: string;
  currentQuestionSequence: number;
  totalQuestions: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  startedAt: string;
  completedAt?: string;
}

export interface UserQuizAnswer {
  id: number;
  userId: string;
  quiz: Quiz;
  session: UserQuizSession;
  answer: string;
  answeredAt: string;
}

export interface ApiResponseClass<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

// ============ AXIOS CONFIG ============
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout for quiz operations
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Quiz API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Quiz API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    let errorMessage = 'Network error occurred';
    
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('Quiz API Error:', errorMessage);
    
    // Return a more specific error based on status code
    if (error.response?.status === 400) {
      throw new Error(errorMessage);
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied: Insufficient permissions');
    } else if (error.response?.status === 404) {
      throw new Error('Resource not found');
    } else if (error.response?.status === 500) {
      throw new Error('Server error occurred');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out');
    } else if (!error.response) {
      throw new Error('Network connection failed');
    }
    
    throw new Error(errorMessage);
  }
);

// ============ QUIZ API ============
export const quizApi = {
  /**
   * Get available quiz codes that the user has not undertaken
   */
  getAvailableQuizzes: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponseClass<string[]>>(
      '/api/v1/content/quiz/available-quizzes'
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch available quizzes');
    }

    return response.data.data || [];
  },

  /**
   * Start a new quiz session or resume an in-progress one
   */
  startQuiz: async (request: QuizStartRequest): Promise<QuizSessionResponse> => {
    if (!request.quizCode?.trim()) {
      throw new Error('Quiz code is required');
    }

    const response = await apiClient.post<ApiResponseClass<QuizSessionResponse>>(
      '/api/v1/content/quiz/start',
      request
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to start quiz');
    }

    if (!response.data.data) {
      throw new Error('Invalid response: missing quiz session data');
    }

    return response.data.data;
  },

  /**
   * Submit an answer for the current question
   */
  submitAnswer: async (request: QuizAnswerRequest): Promise<QuizSessionResponse> => {
    if (!request.sessionId || request.sessionId <= 0) {
      throw new Error('Valid session ID is required');
    }
    if (!request.quizId || request.quizId <= 0) {
      throw new Error('Valid quiz ID is required');
    }
    if (!request.answer?.trim()) {
      throw new Error('Answer is required');
    }

    const response = await apiClient.post<ApiResponseClass<QuizSessionResponse>>(
      '/api/v1/content/quiz/answer',
      request
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to submit answer');
    }

    if (!response.data.data) {
      throw new Error('Invalid response: missing quiz session data');
    }

    return response.data.data;
  },

  /**
   * Get the status of a specific quiz session
   */
  getSessionStatus: async (sessionId: number): Promise<QuizSessionResponse> => {
    if (!sessionId || sessionId <= 0) {
      throw new Error('Valid session ID is required');
    }

    const response = await apiClient.get<ApiResponseClass<QuizSessionResponse>>(
      `/api/v1/content/quiz/session/${sessionId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch session status');
    }

    if (!response.data.data) {
      throw new Error('Invalid response: missing session data');
    }

    return response.data.data;
  },

  /**
   * Get all quiz sessions for the authenticated user
   */
  getUserSessions: async (): Promise<UserQuizSession[]> => {
    const response = await apiClient.get<ApiResponseClass<UserQuizSession[]>>(
      '/api/v1/content/quiz/sessions'
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch user sessions');
    }

    return response.data.data || [];
  },

  /**
   * Get all answers for a specific quiz session
   */
  getSessionAnswers: async (sessionId: number): Promise<UserQuizAnswer[]> => {
    if (!sessionId || sessionId <= 0) {
      throw new Error('Valid session ID is required');
    }

    const response = await apiClient.get<ApiResponseClass<UserQuizAnswer[]>>(
      `/api/v1/content/quiz/session/${sessionId}/answers`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch session answers');
    }

    return response.data.data || [];
  },

  /**
   * Get analysis link for a completed quiz
   */
  getAnalysisLink: async (quizCode: string): Promise<string> => {
    if (!quizCode?.trim()) {
      throw new Error('Quiz code is required');
    }

    const response = await apiClient.get<ApiResponseClass<string>>(
      `/api/v1/content/quiz/completed/${quizCode}/analysis-link`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch analysis link');
    }

    return response.data.data || '';
  },

  /**
   * Check if analysis is available for a completed quiz
   */
  checkAnalysisAvailability: async (quizCode: string): Promise<boolean> => {
    if (!quizCode?.trim()) {
      throw new Error('Quiz code is required');
    }

    try {
      const analysisUrl = await quizApi.getAnalysisLink(quizCode);
      return !!(analysisUrl && analysisUrl.trim());
    } catch (error) {
      // If getting the analysis link fails, assume analysis is not available
      console.warn(`Analysis not available for quiz ${quizCode}:`, error);
      return false;
    }
  },

  /**
   * Fetch analysis report from URL
   */
  getAnalysisReport: async (analysisUrl: string): Promise<any> => {
    if (!analysisUrl?.trim()) {
      throw new Error('Analysis URL is required');
    }

    try {
      const response = await axios.get(analysisUrl);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch analysis report');
    }
  },
};

// ============ UTILITY FUNCTIONS ============

/**
 * Format progress percentage for display
 */
export const formatProgressPercentage = (percentage: number): string => {
  return Math.round(percentage).toString();
};

/**
 * Check if a quiz session is completed
 */
export const isSessionCompleted = (session: QuizSessionResponse): boolean => {
  return session.status === 'COMPLETED';
};

/**
 * Check if a quiz session is in progress
 */
export const isSessionInProgress = (session: QuizSessionResponse): boolean => {
  return session.status === 'IN_PROGRESS';
};

/**
 * Get the display text for quiz status
 */
export const getStatusDisplayText = (status: string): string => {
  switch (status) {
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Completed';
    case 'ABANDONED':
      return 'Abandoned';
    default:
      return status;
  }
};

/**
 * Validate answer based on quiz type
 */
export const validateAnswer = (quiz: Quiz, answer: string): string[] => {
  const errors: string[] = [];
  
  if (!answer?.trim()) {
    errors.push('Answer is required');
    return errors;
  }
  
  switch (quiz.type) {
    case 'SCALE':
      const scaleValue = parseInt(answer);
      if (isNaN(scaleValue)) {
        errors.push('Please select a valid scale value');
      } else if (quiz.scaleMin && scaleValue < quiz.scaleMin) {
        errors.push(`Value must be at least ${quiz.scaleMin}`);
      } else if (quiz.scaleMax && scaleValue > quiz.scaleMax) {
        errors.push(`Value must be at most ${quiz.scaleMax}`);
      }
      break;
      
    case 'MCQ':
      if (quiz.options && !quiz.options.includes(answer)) {
        errors.push('Please select a valid option');
      }
      break;
      
    case 'DESCRIPTIVE':
      if (answer.trim().length < 5) {
        errors.push('Please provide a more detailed answer (at least 5 characters)');
      }
      if (answer.length > 1000) {
        errors.push('Answer is too long (maximum 1000 characters)');
      }
      break;
      
    default:
      errors.push('Unknown quiz type');
      break;
  }
  
  return errors;
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Calculate estimated time remaining based on current progress
 */
export const estimateTimeRemaining = (
  session: QuizSessionResponse,
  avgTimePerQuestion: number = 30 // seconds
): string => {
  const remainingQuestions = session.totalQuestions - session.currentQuestionSequence + 1;
  const estimatedSeconds = remainingQuestions * avgTimePerQuestion;
  
  if (estimatedSeconds < 60) {
    return `${estimatedSeconds}s`;
  } else if (estimatedSeconds < 3600) {
    const minutes = Math.ceil(estimatedSeconds / 60);
    return `${minutes}m`;
  } else {
    const hours = Math.floor(estimatedSeconds / 3600);
    const minutes = Math.ceil((estimatedSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};

/**
 * Retry operation with exponential backoff
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Quiz API attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError!;
};