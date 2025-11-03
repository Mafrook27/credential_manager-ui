import axiosInstance from '../../services/axios';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ResetPasswordRequest,
  ResetPasswordVerify
} from './redux/types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout');
};

export const getUserProfile = async (userId: string): Promise<AuthResponse> => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

export const resetPasswordRequest = async (data: ResetPasswordRequest): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/reset-password', data);
  return response.data;
};

export const resetPasswordVerify = async (data: ResetPasswordVerify): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/reset-password/verify', data);
  return response.data;
};
