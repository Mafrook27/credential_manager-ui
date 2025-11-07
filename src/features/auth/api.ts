import axiosInstance from '../../services/axios';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ResetPasswordRequest,
  ResetPasswordVerify
} from './redux/types';

/**
 * Authentication API Service
 * Handles all auth-related API calls with session-based authentication
 */

/**
 * Login user with email and password
 * Sets HTTP-only cookies (accessToken, refreshToken) automatically
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

/**
 * Register new user account
 * User will be in pending status until approved by admin
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

/**
 * Logout current user
 * Clears HTTP-only cookies and invalidates session
 */
export const logout = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout');
};

/**
 * Refresh access token using refresh token from cookie
 * Called automatically by axios interceptor when access token expires
 */
export const refreshToken = async (): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post('/auth/refresh');
  return response.data;
};

/**
 * Get user profile by ID
 * Users can only access their own profile
 */
export const getUserProfile = async (userId: string): Promise<AuthResponse> => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

/**
 * Request password reset code
 * Sends 6-digit code to user's email (expires in 10 minutes)
 */
export const resetPasswordRequest = async (data: ResetPasswordRequest): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/reset-password', data);
  return response.data;
};

/**
 * Verify reset code and set new password
 */
export const resetPasswordVerify = async (data: ResetPasswordVerify): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/reset-password/verify', data);
  return response.data;
};
