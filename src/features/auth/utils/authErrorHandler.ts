/**
 * Authentication Error Handler
 * Centralized error handling for auth-related errors
 */

import { AxiosError } from 'axios';
import { toast } from '../../../common/utils/toast';

interface AuthErrorResponse {
  success: false;
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Error messages mapping
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Session errors
  TOKEN_EXPIRED: 'Your session has expired. Please login again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  NO_TOKEN: 'Authentication required. Please login.',
  INVALID_TOKEN: 'Invalid session. Please login again.',
  
  // Login errors
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_BLOCKED: 'Your account has been blocked. Please contact administrator.',
  ACCOUNT_NOT_VERIFIED: 'Your account is not verified. Please contact administrator.',
  
  // Registration errors
  EMAIL_EXISTS: 'Email already exists. Please use a different email.',
  WEAK_PASSWORD: 'Password is too weak. Please use a stronger password.',
  
  // Password reset errors
  INVALID_RESET_TOKEN: 'Invalid or expired reset code. Please request a new one.',
  RESET_TOKEN_EXPIRED: 'Reset code has expired. Please request a new one.',
  
  // Generic errors
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  
  // Special messages that should be shown as-is from backend
  LOGGED_IN_ELSEWHERE: 'You have been logged out because you logged in from another device.',
};

/**
 * Get user-friendly error message
 */
export const getAuthErrorMessage = (error: unknown): string => {
  if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR;

  // Handle Axios errors
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as AuthErrorResponse;
    
    // Check for specific backend messages that should be shown as-is
    if (errorData?.message?.includes('logged in from another device')) {
      return 'You have been logged out because you logged in from another device.';
    }
    
    // Check for specific error codes
    if (errorData?.code && ERROR_MESSAGES[errorData.code]) {
      return ERROR_MESSAGES[errorData.code];
    }
    
    // Use backend message if available
    if (errorData?.message) {
      return errorData.message;
    }
    
    // Handle HTTP status codes
    switch (error.response?.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return ERROR_MESSAGES.NO_TOKEN;
      case 403:
        return 'Access denied. You do not have permission.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. Resource already exists.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  // Handle network errors
  if (error instanceof Error) {
    if (error.message.includes('Network Error')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Handle auth error with toast notification
 */
export const handleAuthError = (error: unknown, customMessage?: string): void => {
  const errorMessage = customMessage || getAuthErrorMessage(error);
  
  console.error('🔐 Auth Error:', {
    error,
    message: errorMessage,
  });

  toast.error(errorMessage);
};

/**
 * Check if error is a session expiry error
 */
export const isSessionExpiredError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as AuthErrorResponse;
    return (
      errorData?.code === 'TOKEN_EXPIRED' ||
      errorData?.code === 'SESSION_EXPIRED' ||
      errorData?.code === 'NO_TOKEN' ||
      errorData?.code === 'INVALID_TOKEN'
    );
  }
  return false;
};

/**
 * Check if error is a blocked account error
 */
export const isAccountBlockedError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as AuthErrorResponse;
    return (
      errorData?.code === 'ACCOUNT_BLOCKED' ||
      errorData?.message?.toLowerCase().includes('blocked')
    );
  }
  return false;
};

/**
 * Check if error requires re-authentication
 */
export const requiresReauth = (error: unknown): boolean => {
  return isSessionExpiredError(error) || isAccountBlockedError(error);
};

/**
 * Extract validation errors from response
 */
export const extractValidationErrors = (error: unknown): Record<string, string> | null => {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as any;
    
    // Check for validation errors array
    if (errorData?.errors && Array.isArray(errorData.errors)) {
      return errorData.errors.reduce((acc: Record<string, string>, err: any) => {
        if (err.field && err.message) {
          acc[err.field] = err.message;
        }
        return acc;
      }, {});
    }
    
    // Check for validation errors object
    if (errorData?.validationErrors && typeof errorData.validationErrors === 'object') {
      return errorData.validationErrors;
    }
  }
  
  return null;
};
