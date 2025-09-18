import { useState, useCallback } from 'react';
import { errorToast, warningToast } from '../../../../util/toastHelper';

interface UseErrorHandlerOptions {
  defaultMessage?: string;
  showToast?: boolean;
  onError?: (error: Error) => void;
}

interface ErrorState {
  error: Error | null;
  hasError: boolean;
  isLoading: boolean;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    defaultMessage = 'An unexpected error occurred',
    showToast = true,
    onError
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    hasError: false,
    isLoading: false
  });

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const message = customMessage || errorObj.message || defaultMessage;

    console.error('Error handled:', errorObj);

    setErrorState({
      error: errorObj,
      hasError: true,
      isLoading: false
    });

    if (showToast) {
      errorToast(message);
    }

    if (onError) {
      onError(errorObj);
    }
  }, [defaultMessage, showToast, onError]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      hasError: false,
      isLoading: false
    });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setErrorState(prev => ({
      ...prev,
      isLoading: loading
    }));
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    options: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
      showLoadingToast?: boolean;
    } = {}
  ): Promise<T | null> => {
    const {
      errorMessage,
      showLoadingToast = false
    } = options;

    try {
      setLoading(true);
      clearError();

      if (showLoadingToast && options.loadingMessage) {
        warningToast(options.loadingMessage);
      }

      const result = await asyncOperation();

      setLoading(false);
      return result;
    } catch (error) {
      handleError(error, errorMessage);
      return null;
    }
  }, [handleError, clearError, setLoading]);

  return {
    ...errorState,
    handleError,
    clearError,
    setLoading,
    executeWithErrorHandling
  };
};

// Predefined error handlers for common quiz operations
export const useQuizErrorHandler = () => {
  const baseHandler = useErrorHandler({
    defaultMessage: 'Quiz operation failed'
  });

  const handleApiError = useCallback((error: unknown) => {
    let message = 'Network error occurred';
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        message = 'Request timed out. Please check your connection and try again.';
      } else if (error.message.includes('Network')) {
        message = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('401')) {
        message = 'Please log in again to continue.';
      } else if (error.message.includes('403')) {
        message = 'You do not have permission to perform this action.';
      } else {
        message = error.message;
      }
    }
    
    baseHandler.handleError(error, message);
  }, [baseHandler]);

  const handleValidationError = useCallback((validationErrors: string[]) => {
    const message = validationErrors.length > 1 
      ? `Multiple issues found: ${validationErrors.slice(0, 2).join(', ')}${validationErrors.length > 2 ? '...' : ''}`
      : validationErrors[0];
    
    warningToast(message);
  }, []);

  return {
    ...baseHandler,
    handleApiError,
    handleValidationError
  };
};

// Helper function to extract meaningful error messages
export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    const errorObj = error as any;
    
    if (errorObj.response?.data?.error) {
      return errorObj.response.data.error;
    }
    
    if (errorObj.response?.data?.message) {
      return errorObj.response.data.message;
    }
    
    if (errorObj.message) {
      return errorObj.message;
    }
  }
  
  return 'An unknown error occurred';
};

// Retry utility with exponential backoff
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};