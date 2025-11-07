export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
  lastLogin?: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  isActive: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token?: string;
  };
  message?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordVerify {
  email: string;
  token: string;
  newPassword: string;
}
