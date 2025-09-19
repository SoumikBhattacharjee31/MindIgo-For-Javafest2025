// hooks/useSessionValidation.ts
import { useState, useEffect, useCallback } from 'react';
import { sessionCache } from '@/util/sessionCache';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/genai/gemini`;

export interface SessionValidationResult {
  isValidSession: boolean;
  sessionId: string | null;
  needsNewSession: boolean;
  error: string | null;
}

export const useSessionValidation = () => {
  const [validationResult, setValidationResult] = useState<SessionValidationResult>({
    isValidSession: false,
    sessionId: null,
    needsNewSession: false,
    error: null,
  });

  /**
   * Validate if a session exists and is accessible from the backend
   */
  const validateSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/session/${sessionId}?page=1&per_page=1`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.success;
      }
      
      // 404 means session doesn't exist or is inaccessible
      if (response.status === 404) {
        return false;
      }
      
      // Other errors might be temporary, so we'll consider session potentially valid
      // but log the error
      console.warn(`Session validation returned ${response.status}, assuming invalid`);
      return false;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }, []);

  /**
   * Create a new session
   */
  const createNewSession = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/session/new`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success && data.data?.session_id) {
        const newSessionId = data.data.session_id;
        // Cache the new session
        sessionCache.cacheSession(newSessionId);
        return newSessionId;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating new session:', error);
      return null;
    }
  }, []);

  /**
   * Get or create a valid session
   */
  const getValidSession = useCallback(async (): Promise<SessionValidationResult> => {
    try {
      // First, try to get a cached session
      const cachedSessionId = sessionCache.getCachedSession();
      
      if (cachedSessionId) {
        // Validate the cached session
        const isValid = await validateSession(cachedSessionId);
        
        if (isValid) {
          return {
            isValidSession: true,
            sessionId: cachedSessionId,
            needsNewSession: false,
            error: null,
          };
        } else {
          // Cached session is invalid, clear it
          sessionCache.clearCache();
        }
      }

      // No valid cached session, create a new one
      const newSessionId = await createNewSession();
      
      if (newSessionId) {
        return {
          isValidSession: true,
          sessionId: newSessionId,
          needsNewSession: true,
          error: null,
        };
      } else {
        return {
          isValidSession: false,
          sessionId: null,
          needsNewSession: true,
          error: 'Failed to create session',
        };
      }
    } catch (error) {
      return {
        isValidSession: false,
        sessionId: null,
        needsNewSession: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, [validateSession, createNewSession]);

  /**
   * Force refresh - clears cache and gets new session
   */
  const forceRefreshSession = useCallback(async (): Promise<SessionValidationResult> => {
    sessionCache.clearCache();
    return await getValidSession();
  }, [getValidSession]);

  return {
    validationResult,
    getValidSession,
    validateSession,
    createNewSession,
    forceRefreshSession,
  };
};