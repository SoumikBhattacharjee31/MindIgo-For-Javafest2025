// breathingApi.ts
import axios from 'axios';
import { BreathingExercise, BreathingTask, Cycle, LastSession } from '../dataTypes';

// ============ BASE CONFIG ============
const BASE_URL = 'http://localhost:8080';

// Types matching your backend DTOs
export interface BreathingRequest {
  id: number;
  duration: number; // in minutes
}

export interface TaskRequest {
  order: number;
  type: string;
  duration: number;
}

export interface CycleRequest {
  task: TaskRequest[];
}

export interface BreathingResponse {
  id: number;
  title: string;
  description: string;
  pattern: string;
  duration: number; // in minutes
  cycle?: CycleResponse; // Added cycle field
}

export interface CycleResponse {
  duration: number; // in seconds
  task: BreathingTaskResponse[];
}

export interface BreathingTaskResponse {
  order: number;
  type: string;
  duration: number;
}

export interface BreathingSessionRequest {
  exerciseId: number;
  exerciseTitle: string;
  completedCycles: number;
  totalCycles: number;
  date: string;
  duration: number; // in seconds
}

export interface BreathingSessionResponse {
  exerciseId: number;
  exerciseTitle: string;
  completedCycles: number;
  totalCycles: number;
  data: string;
  duration: number; // in seconds
}

export interface ApiResponseClass<T> {
  data: T;
  message: string;
  status: string;
  success: boolean;
}

// ============ AXIOS CONFIG ============
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message) {
      console.error('API Error:', error.response.data.message);
      throw new Error(error.response.data.message);
    }
    throw error;
  }
);

// ============ BREATHING API ============
export const breathingApi = {
  /**
   * Get all breathing exercises
   */
  getBreathingExercises: async (): Promise<BreathingResponse[]> => {
    const response = await apiClient.get<ApiResponseClass<BreathingResponse[]>>(
      `/api/v1/content/breathing`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch breathing exercises');
    }

    return response.data.data;
  },

  /**
   * Customize a breathing exercise
   */
  customizeBreathingExercise: async (
    breathingData: BreathingRequest
  ): Promise<BreathingResponse> => {
    if (!breathingData.duration || !breathingData.id) {
      throw new Error('Missing required fields: id or duration');
    }

    const response = await apiClient.put<ApiResponseClass<BreathingResponse>>(
      `/api/v1/content/breathing`,
      breathingData
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to customize breathing exercise');
    }

    return response.data.data;
  },

  /**
   * Store a breathing session
   */
  storeBreathingSession: async (
    sessionData: BreathingSessionRequest
  ): Promise<BreathingSessionResponse> => {
    const response = await apiClient.post<ApiResponseClass<BreathingSessionResponse>>(
      `/api/v1/content/breathing/session`,
      sessionData
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to store breathing session');
    }

    return response.data.data;
  },

  /**
   * Get latest session for a date
   */
  getLatestSession: async (date: string): Promise<BreathingSessionResponse> => {
    const response = await apiClient.get<ApiResponseClass<BreathingSessionResponse>>(
      `/api/v1/content/breathing/session`,
      { params: { date } }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch latest session');
    }

    return response.data.data;
  },
};


export const toBreathingExercise = (res: BreathingResponse): BreathingExercise => {
  let cycle: Cycle = { duration: 0, task: [] };

  if (res.cycle) {
    cycle = {
      duration: res.cycle.duration,
      task: res.cycle.task.map((t) => ({
        order: t.order,
        type: t.type as BreathingTask['type'], // Type assertion if needed
        duration: t.duration,
      })),
    };
  } else {
    // Fallback to parsing pattern if cycle not provided
    try {
      cycle = JSON.parse(res.pattern) as Cycle;
    } catch (e) {
      console.warn("Invalid pattern JSON in BreathingResponse:", res.pattern);
    }
  }

  return {
    id: res.id,
    title: res.title,
    description: res.description,
    pattern: res.pattern,
    duration: res.duration,
    cycle,
  };
};

export const toLastSession = (res: BreathingSessionResponse): LastSession => ({
  exerciseId: res.exerciseId,
  exerciseTitle: res.exerciseTitle,
  completedCycles: res.completedCycles,
  totalCycles: res.totalCycles,
  date: new Date().toISOString(), // backend doesn’t return date, inject here if needed
  duration: res.duration,
});

// ==================== Frontend → Request ====================

export const toBreathingRequest = (exercise: BreathingExercise): BreathingRequest => ({
  id: exercise.id,
  duration: exercise.duration,
});

export const toBreathingSessionRequest = (
  session: LastSession
): BreathingSessionRequest => ({
  exerciseId: session.exerciseId,
  exerciseTitle: session.exerciseTitle,
  completedCycles: session.completedCycles,
  totalCycles: session.totalCycles,
  date: session.date,
  duration: session.duration,
});

// ==================== Utility ====================

export const cloneCycle = (cycle: Cycle): Cycle => ({
  duration: cycle.duration,
  task: cycle.task.map((t) => ({ ...t })),
});

export const createTask = (
  order: number,
  type: BreathingTask["type"],
  duration: number
): BreathingTask => ({
  order,
  type,
  duration,
});