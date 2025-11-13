// Error handler utility for API errors
// This helps TypeScript understand error types properly

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
export function shouldShowError(error: unknown): boolean {
  const apiError = error as ApiError;
  
  // If error is marked as handled by interceptor, don't show it
  if (apiError.handledByInterceptor || apiError.isAuthError) {
    console.log('🔕 Error already handled by interceptor, suppressing toast');
    return false;
  }
  
  return true;
}

/**
 * Safely extracts error message from caught errors
 * @param error - The caught error (unknown type)
 * @param defaultMessage - Fallback message if extraction fails
 * @returns A user-friendly error message
 */
export function getErrorMessage(error: unknown, defaultMessage = 'An error occurred'): string {
  // Don't return message if error is handled by interceptor
  if (!shouldShowError(error)) {
    return '';
  }
  
  // Check if it's an Error instance
  if (error instanceof Error) {
    // Check if it has response property (Axios error)
    if ('response' in error) {
      const apiError = error as ApiError;
      return apiError.response?.data?.message || error.message || defaultMessage;
    }
    return error.message || defaultMessage;
  }
  
  // If it's a string, return it
  if (typeof error === 'string') {
    return error;
  }
  
  // If it's an object with a message property
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message) || defaultMessage;
  }
  
  // Fallback
  return defaultMessage;
}

/**
 * Type guard to check if error is an API error with response
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'response' in error &&
    typeof (error as any).response === 'object'
  );
}
