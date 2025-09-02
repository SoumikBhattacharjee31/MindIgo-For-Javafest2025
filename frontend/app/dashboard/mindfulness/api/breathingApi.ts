// breathingApi.ts
import axios from 'axios';
import { BreathingExercise, BreathingTask, Cycle, LastSession } from '../dataTypes';

// ============ BASE CONFIG ============
const BASE_URL = 'http://localhost:8080';

// Types matching your backend DTOs
export interface BreathingRequest {
  id: number;
  duration: number; // in minutes
  cycle: CycleRequest;
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
  cycle?: CycleResponse;
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
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'Network error occurred';
    console.error('API Error:', errorMessage);
    
    // Return a more specific error based on status code
    if (error.response?.status === 404) {
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

// ============ OFFLINE QUEUE MANAGEMENT ============
interface QueuedOperation {
  id: string;
  type: 'UPDATE_EXERCISE' | 'STORE_SESSION';
  data: any;
  timestamp: number;
  retries: number;
}

class OfflineQueue {
  private queue: QueuedOperation[] = [];
  private isProcessing = false;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  add(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries'>) {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: `${operation.type}_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      retries: 0,
    };
    
    this.queue.push(queuedOp);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const operation = this.queue[0];
      
      try {
        await this.executeOperation(operation);
        this.queue.shift(); // Remove successful operation
      } catch (error) {
        console.error(`Failed to execute operation ${operation.id}:`, error);
        
        operation.retries++;
        if (operation.retries >= this.MAX_RETRIES) {
          console.error(`Operation ${operation.id} exceeded max retries, removing from queue`);
          this.queue.shift();
        } else {
          // Move to end of queue for retry
          const failedOp = this.queue.shift()!;
          this.queue.push(failedOp);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * operation.retries));
        }
      }
    }
    
    this.isProcessing = false;
  }

  private async executeOperation(operation: QueuedOperation): Promise<void> {
    switch (operation.type) {
      case 'UPDATE_EXERCISE':
        await breathingApi.customizeBreathingExercise(operation.data);
        break;
      case 'STORE_SESSION':
        await breathingApi.storeBreathingSession(operation.data);
        break;
      default:
        throw new Error(`Unknown operation type: ${(operation as any).type}`);
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }
}

// Global offline queue instance
const offlineQueue = new OfflineQueue();

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
  getLatestSession: async (date: string): Promise<BreathingSessionResponse | null> => {
    try {
      const response = await apiClient.get<ApiResponseClass<BreathingSessionResponse>>(
        `/api/v1/content/breathing/session`,
        { params: { date } }
      );

      if (!response.data.success) {
        // If no session found, return null instead of throwing
        if (response.data.message?.includes('not found') || response.data.message?.includes('No session')) {
          return null;
        }
        throw new Error(response.data.message || 'Failed to fetch latest session');
      }

      return response.data.data;
    } catch (error) {
      // Handle 404 gracefully
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

// ============ OPTIMISTIC UPDATE HELPERS ============

/**
 * Performs an optimistic update with automatic API sync and rollback on failure
 */
export const optimisticUpdate = {
  updateExercise: (
    exercise: BreathingExercise,
    updateFn: (exercise: BreathingExercise) => BreathingExercise,
    onSuccess?: (updated: BreathingExercise) => void,
    onError?: (error: Error, original: BreathingExercise) => void
  ) => {
    const updated = updateFn(exercise);
    
    // Queue the API call for background processing
    offlineQueue.add({
      type: 'UPDATE_EXERCISE',
      data: toBreathingRequest(updated),
    });
    
    return updated;
  },

  storeSession: (
    session: LastSession,
    onSuccess?: (stored: LastSession) => void,
    onError?: (error: Error) => void
  ) => {
    // Queue the API call for background processing
    offlineQueue.add({
      type: 'STORE_SESSION',
      data: toBreathingSessionRequest(session),
    });
    
    return session;
  },
};

// ============ MAPPERS ============

export const toBreathingExercise = (res: BreathingResponse): BreathingExercise => {
  let cycle: Cycle = { duration: 0, task: [] };

  if (res.cycle) {
    cycle = {
      duration: res.cycle.duration,
      task: res.cycle.task.map((t) => ({
        order: t.order,
        type: t.type as BreathingTask['type'],
        duration: t.duration,
      })),
    };
  } else {
    // Fallback to parsing pattern if cycle not provided
    try {
      cycle = JSON.parse(res.pattern) as Cycle;
    } catch (e) {
      console.warn("Invalid pattern JSON in BreathingResponse:", res.pattern);
      // Provide a default cycle if parsing fails
      cycle = { duration: 240, task: [] }; // 4 minutes default
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
  date: new Date().toISOString(),
  duration: res.duration,
});

// ==================== Frontend → Request ====================

export const toBreathingRequest = (exercise: BreathingExercise): BreathingRequest => ({
  id: exercise.id,
  duration: exercise.duration,
  cycle: {
    task: exercise.cycle.task.map((t) => ({
      order: t.order,
      type: t.type,
      duration: t.duration,
    })),
  },
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

// ==================== Cache Management ====================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

export const breathingCache = new SimpleCache();

// ==================== Enhanced API with Caching ====================

export const cachedBreathingApi = {
  ...breathingApi,

  /**
   * Get exercises with caching
   */
  getBreathingExercises: async (): Promise<BreathingResponse[]> => {
    const cacheKey = 'breathing_exercises';
    const cached = breathingCache.get<BreathingResponse[]>(cacheKey);
    
    if (cached) {
      console.log('Using cached breathing exercises');
      return cached;
    }

    const data = await breathingApi.getBreathingExercises();
    breathingCache.set(cacheKey, data);
    return data;
  },

  /**
   * Get latest session with caching
   */
  getLatestSession: async (date: string): Promise<BreathingSessionResponse | null> => {
    const cacheKey = `latest_session_${date}`;
    const cached = breathingCache.get<BreathingSessionResponse | null>(cacheKey);
    
    if (cached !== undefined) {
      console.log('Using cached latest session');
      return cached;
    }

    const data = await breathingApi.getLatestSession(date);
    breathingCache.set(cacheKey, data, 2 * 60 * 1000); // Cache for 2 minutes only
    return data;
  },

  /**
   * Invalidate cache when updating
   */
  customizeBreathingExercise: async (breathingData: BreathingRequest): Promise<BreathingResponse> => {
    const result = await breathingApi.customizeBreathingExercise(breathingData);
    // Invalidate exercises cache
    breathingCache.delete('breathing_exercises');
    return result;
  },

  /**
   * Invalidate session cache when storing new session
   */
  storeBreathingSession: async (sessionData: BreathingSessionRequest): Promise<BreathingSessionResponse> => {
    const result = await breathingApi.storeBreathingSession(sessionData);
    // Invalidate session cache for this date
    breathingCache.delete(`latest_session_${sessionData.date}`);
    return result;
  },
};

// ==================== Error Recovery ====================

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
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError!;
};

// ==================== Validation Helpers ====================

export const validateBreathingExercise = (exercise: BreathingExercise): string[] => {
  const errors: string[] = [];
  
  if (!exercise.id || exercise.id <= 0) {
    errors.push('Invalid exercise ID');
  }
  
  if (!exercise.title?.trim()) {
    errors.push('Exercise title is required');
  }
  
  if (!exercise.duration || exercise.duration <= 0) {
    errors.push('Duration must be greater than 0');
  }
  
  if (!exercise.cycle?.task?.length) {
    errors.push('Exercise must have at least one task');
  } else {
    exercise.cycle.task.forEach((task, index) => {
      if (!task.type) {
        errors.push(`Task ${index + 1}: type is required`);
      }
      if (!task.duration || task.duration <= 0) {
        errors.push(`Task ${index + 1}: duration must be greater than 0`);
      }
    });
  }
  
  return errors;
};

export const validateLastSession = (session: LastSession): string[] => {
  const errors: string[] = [];
  
  if (!session.exerciseId || session.exerciseId <= 0) {
    errors.push('Invalid exercise ID');
  }
  
  if (!session.exerciseTitle?.trim()) {
    errors.push('Exercise title is required');
  }
  
  if (session.completedCycles < 0) {
    errors.push('Completed cycles cannot be negative');
  }
  
  if (session.totalCycles <= 0) {
    errors.push('Total cycles must be greater than 0');
  }
  
  if (session.completedCycles > session.totalCycles) {
    errors.push('Completed cycles cannot exceed total cycles');
  }
  
  if (!session.date) {
    errors.push('Session date is required');
  }
  
  if (!session.duration || session.duration <= 0) {
    errors.push('Session duration must be greater than 0');
  }
  
  return errors;
};