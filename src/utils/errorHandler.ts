/**
 * Error Handler Utility
 * Centralized error handling to prevent duplicate error messages
 */

interface ApiError {
  response?: {
    data?: {
      message?: string;
      code?: string;
    };
    status?: number;
  };
  message?: string;
  isAuthError?: boolean;
  handledByInterceptor?: boolean;
}

/**
 * Check if error should be displayed to user
 * Returns false if error is already handled by interceptor (auth errors)
 */
export const shouldShowError = (error: unknown): boolean => {
  const apiError = error as ApiError;
  
  // If error is marked as handled by interceptor, don't show it
  if (apiError.handledByInterceptor || apiError.isAuthError) {
    console.log('🔕 Error already handled by interceptor, suppressing toast');
    return false;
  }
  
  return true;
};

/**
 * Get user-friendly error message from API error
 */
export const getErrorMessage = (error: unknown, fallback: string = 'An error occurred'): string => {
  const apiError = error as ApiError;
  
  // Don't return message if error is handled by interceptor
  if (!shouldShowError(error)) {
    return '';
  }
  
  return apiError?.response?.data?.message || apiError?.message || fallback;
};

/**
 * Check if error is a network/timeout error
 */
export const isNetworkError = (error: unknown): boolean => {
  const apiError = error as ApiError;
  return apiError?.message?.includes('Network Error') || 
         apiError?.message?.includes('timeout') ||
         !apiError?.response;
};
