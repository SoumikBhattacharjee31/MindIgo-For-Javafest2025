// moodApi.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Types matching your backend DTOs
export interface MoodRequest {
  mood: string;
  date: string; // LocalDate as string in ISO format (YYYY-MM-DD)
  description: string;
  reason: string;
}

export interface MoodResponse {
  mood: string;
  date: string; // LocalDate as string in ISO format (YYYY-MM-DD)
  description: string;
  reason: string;
}

export interface ApiResponseClass<T> {
  data: T;
  message: string;
  status: string;
  success: boolean;
}

// Configure axios instance
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

export const moodApi = {
  /**
   * Get moods for the last N days
   * @param days - Number of days to retrieve (default: 7)
   * @param today - Today's date in YYYY-MM-DD format
   */
  getMoods: async (days: number = 7, today: string): Promise<MoodResponse[]> => {
    try {
      console.log('Fetching moods:', { days, today });
      
      const response = await apiClient.get<ApiResponseClass<MoodResponse[]>>(
        `/api/v1/content/mood/get-mood`,
        {
          params: { days, today }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch moods');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching moods:', error);
      throw error;
    }
  },

  /**
   * Set/Update mood for a specific date
   * @param moodData - Mood data to set
   */
  setMood: async (moodData: MoodRequest): Promise<MoodResponse> => {
    try {
      console.log('Setting mood with data:', moodData);
      
      // Validate the request data
      if (!moodData.mood || !moodData.date || !moodData.description || !moodData.reason) {
        throw new Error('Missing required fields: mood, date, description, or reason');
      }
      
      // Ensure date is in correct format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(moodData.date)) {
        throw new Error('Invalid date format. Expected YYYY-MM-DD');
      }

      const response = await apiClient.post<ApiResponseClass<MoodResponse>>(
        `/api/v1/content/mood/set-mood`,
        moodData
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to set mood');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error setting mood:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          console.error('400 Bad Request - Request data:', moodData);
          console.error('400 Bad Request - Response:', error.response.data);
        }
      }
      throw error;
    }
  },
};

// Helper function to format date for API
export const formatDateForApi = (date: Date): string => {
  // Use local date formatting to avoid timezone conversion issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to convert MoodResponse to Entry format
export const convertMoodResponseToEntry = (moodResponse: MoodResponse) => {
  return {
    date: moodResponse.date,
    mood: moodResponse.mood,
    description: moodResponse.description,
    reason: moodResponse.reason,
  };
};

// Helper function to convert Entry to MoodRequest format
export const convertEntryToMoodRequest = (entry: {
  date: string;
  mood: string;
  description: string;
  reason: string;
}): MoodRequest => {
  return {
    mood: entry.mood,
    date: entry.date,
    description: entry.description,
    reason: entry.reason,
  };
};