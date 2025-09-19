// sleepApi.ts
import axios from "axios";

const BASE_URL = "http://localhost:8080";

// Types matching the backend DTOs
export interface SleepRequest {
  date: string; // YYYY-MM-DD format
  sleepTime: string; // HH:MM:SS format
  wakeTime: string; // HH:MM:SS format
}

export interface SleepResponse {
  date: string; // YYYY-MM-DD format
  sleepTime: string; // HH:MM:SS format
  wakeTime: string; // HH:MM:SS format
}

export interface ApiResponseClass<T> {
  data?: T;
  message: string;
  success: boolean;
  errorCode: string;
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
    console.error("Sleep API Error:", error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || "An unexpected error occurred");
  }
);

export const sleepApi = {
  /**
   * Save or update sleep data
   * @param sleepData - Sleep data to save/update
   */
  saveSleep: async (sleepData: SleepRequest): Promise<SleepResponse> => {
    try {
      console.log("Saving sleep data:", sleepData);

      // Validate the request data
      if (!sleepData.date || !sleepData.sleepTime || !sleepData.wakeTime) {
        throw new Error(
          "Missing required fields: date, sleepTime, or wakeTime"
        );
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(sleepData.date)) {
        throw new Error("Invalid date format. Expected YYYY-MM-DD");
      }

      // Validate time format (HH:MM:SS)
      const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
      if (
        !timeRegex.test(sleepData.sleepTime) ||
        !timeRegex.test(sleepData.wakeTime)
      ) {
        throw new Error("Invalid time format. Expected HH:MM:SS");
      }

      const response = await apiClient.post<ApiResponseClass<SleepResponse>>(
        `/api/v1/content/sleep`,
        sleepData
      );

      if (response.status !== 200 || !response.data.success) {
        throw new Error(response.data.message || "Failed to save sleep data");
      }

      return response.data.data!;
    } catch (error) {
      console.error("Error saving sleep data:", error);
      throw error;
    }
  },

  /**
   * Get all sleep records
   */
  getAllSleep: async (): Promise<SleepResponse[]> => {
    try {
      console.log("Fetching all sleep records");

      const response = await apiClient.get<ApiResponseClass<SleepResponse[]>>(
        `/api/v1/content/sleep`
      );

      console.log("Sleep records response:", response.data);
      if (response.status !== 200 || !response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch sleep records"
        );
      }

      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching sleep records:", error);
      throw error;
    }
  },

  /**
   * Delete sleep data by date
   * @param date - Date in YYYY-MM-DD format
   */
  deleteSleep: async (date: string): Promise<void> => {
    try {
      console.log("Deleting sleep data for date:", date);

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new Error("Invalid date format. Expected YYYY-MM-DD");
      }

      const response = await apiClient.delete<ApiResponseClass<void>>(
        `/api/v1/content/sleep`,
        {
          params: { date },
        }
      );

      if (response.status !== 200 || !response.data.success) {
        throw new Error(response.data.message || "Failed to delete sleep data");
      }
    } catch (error) {
      console.error("Error deleting sleep data:", error);
      throw error;
    }
  },

  /**
   * Get last N days of sleep records
   * @param days - Number of days to retrieve (default: 7)
   * @param today - Today's date in YYYY-MM-DD format
   */
  getLastNDaysSleep: async (
    days: number = 7,
    today: string
  ): Promise<SleepResponse[]> => {
    try {
      console.log("Fetching last N days sleep:", { days, today });

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(today)) {
        throw new Error("Invalid date format. Expected YYYY-MM-DD");
      }

      if (days < 1 || days > 365) {
        throw new Error("Days must be between 1 and 365");
      }

      const response = await apiClient.get<ApiResponseClass<SleepResponse[]>>(
        `/api/v1/content/sleep/last`,
        {
          params: { today, days },
        }
      );

      if (response.status !== 200 || !response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch sleep records"
        );
      }

      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching last N days sleep:", error);
      throw error;
    }
  },

  /**
   * Get sleep data for a specific date
   * @param date - Date in YYYY-MM-DD format
   */
  getSleepByDate: async (date: string): Promise<SleepResponse | null> => {
    try {
      const allSleep = await sleepApi.getAllSleep();
      return allSleep.find((sleep) => sleep.date === date) || null;
    } catch (error) {
      console.error("Error fetching sleep by date:", error);
      throw error;
    }
  },
};

// Helper function to format date for API (reusing from moodApi)
export const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to format time for API (HH:MM:SS)
export const formatTimeForApi = (time: string): string => {
  // If time is in HH:MM format, add :00 seconds
  if (time.match(/^\d{2}:\d{2}$/)) {
    return `${time}:00`;
  }
  return time;
};

// Helper function to format time for display (HH:MM)
export const formatTimeForDisplay = (time: string): string => {
  // Remove seconds if present
  return time.substring(0, 5);
};

// Helper function to calculate sleep duration
export const calculateSleepDuration = (
  sleepTime: string,
  wakeTime: string
): string => {
  const sleep = new Date(`2000-01-01T${sleepTime}`);
  let wake = new Date(`2000-01-01T${wakeTime}`);

  // If wake time is earlier than sleep time, assume it's next day
  if (wake < sleep) {
    wake = new Date(`2000-01-02T${wakeTime}`);
  }

  const diffMs = wake.getTime() - sleep.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${diffHours}h ${diffMinutes}m`;
};
