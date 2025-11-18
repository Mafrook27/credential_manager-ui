import * as types from './actionTypes';
import type { LoginCredentials, RegisterData, AuthResponse, ResetPasswordRequest, ResetPasswordVerify } from './types';
import { login as loginAPI, register as registerAPI, resetPasswordRequest as resetPasswordRequestAPI, resetPasswordVerify as resetPasswordVerifyAPI, getUserProfile as getUserProfileAPI, logout as logoutAPI } from '../api';
import type { Dispatch } from 'redux';
import { getAuthErrorMessage } from '../utils/authErrorHandler';
import { resetRefreshState } from '../../../services/axios';

export const loginRequest = () => ({
  type: types.LOGIN_REQUEST,
});

export const loginSuccess = (data: AuthResponse) => ({
  type: types.LOGIN_SUCCESS,
  payload: data,
});

export const loginFailure = (error: string) => ({
  type: types.LOGIN_FAILURE,
  payload: error,
});

export const registerRequest = () => ({
  type: types.REGISTER_REQUEST,
});

export const registerSuccess = (data: AuthResponse) => ({
  type: types.REGISTER_SUCCESS,
  payload: data,
});

export const registerFailure = (error: string) => ({
  type: types.REGISTER_FAILURE,
  payload: error,
});

export const logoutSuccess = () => ({
  type: types.LOGOUT,
});

// Thunk action for logout
export const logout = () => async (dispatch: Dispatch) => {
  try {
    // Reset axios refresh state to prevent stale refresh attempts
    resetRefreshState();
    
    await logoutAPI();
    dispatch(logoutSuccess());
    
    // Clear browser history and prevent back button
    window.history.replaceState(null, '', '/login');
    
    // Force redirect to login page
    setTimeout(() => {
      window.location.replace('/login');
    }, 100);
  } catch (error: any) {
    // Even if logout API fails, clear local state
    console.error('Logout API error:', error);
    
    // Still reset refresh state
    resetRefreshState();
    dispatch(logoutSuccess());
    
    // Clear browser history and prevent back button
    window.history.replaceState(null, '', '/login');
    
    // Force redirect to login page
    setTimeout(() => {
      window.location.replace('/login');
    }, 100);
  }
};

export const clearError = () => ({
  type: types.CLEAR_ERROR,
});


export const getUserProfileRequest = () => ({
  type: types.GET_USER_PROFILE_REQUEST,
});

export const getUserProfileSuccess = (data: AuthResponse) => ({
  type: types.GET_USER_PROFILE_SUCCESS,
  payload: data,
});

export const getUserProfileFailure = (error: string) => ({
  type: types.GET_USER_PROFILE_FAILURE,
  payload: error,
});

// Thunk actions
export const login = (credentials: LoginCredentials) => async (dispatch: Dispatch) => {
  try {
    dispatch(loginRequest());
    const response = await loginAPI(credentials);
    dispatch(loginSuccess({
      success: response.success,
      data: response.data,
      message: response.message
    }));
    return response;
  } catch (error: any) {
    const errorMessage = getAuthErrorMessage(error);
    dispatch(loginFailure(errorMessage));
    throw error;
  }
};

export const register = (data: RegisterData) => async (dispatch: Dispatch) => {
  try {
    dispatch(registerRequest());
    const response = await registerAPI(data);
    dispatch(registerSuccess({
      success: response.success,
      data: response.data,
      message: response.message
    }));
    return response;
  } catch (error: any) {
    const errorMessage = getAuthErrorMessage(error);
    dispatch(registerFailure(errorMessage));
    throw error;
  }
};

// Reset password action creators
export const resetPasswordRequest = () => ({
  type: types.RESET_PASSWORD_REQUEST,
});

export const resetPasswordSuccess = (message: string) => ({
  type: types.RESET_PASSWORD_SUCCESS,
  payload: message,
});

export const resetPasswordFailure = (error: string) => ({
  type: types.RESET_PASSWORD_FAILURE,
  payload: error,
});

export const resetPasswordVerifyRequest = () => ({
  type: types.RESET_PASSWORD_VERIFY_REQUEST,
});

export const resetPasswordVerifySuccess = (message: string) => ({
  type: types.RESET_PASSWORD_VERIFY_SUCCESS,
  payload: message,
});

export const resetPasswordVerifyFailure = (error: string) => ({
  type: types.RESET_PASSWORD_VERIFY_FAILURE,
  payload: error,
});

// Reset password thunk actions
export const resetPassword = (data: ResetPasswordRequest) => async (dispatch: Dispatch) => {
  try {
    dispatch(resetPasswordRequest());
    const response = await resetPasswordRequestAPI(data);
    dispatch(resetPasswordSuccess(response.message));
    return response;
  } catch (error: any) {
    const errorMessage = getAuthErrorMessage(error);
    dispatch(resetPasswordFailure(errorMessage));
    throw error;
  }
};

export const verifyResetPassword = (data: ResetPasswordVerify) => async (dispatch: Dispatch) => {
  try {
    dispatch(resetPasswordVerifyRequest());
    const response = await resetPasswordVerifyAPI(data);
    dispatch(resetPasswordVerifySuccess(response.message));
    return response;
  } catch (error: any) {
    const errorMessage = getAuthErrorMessage(error);
    dispatch(resetPasswordVerifyFailure(errorMessage));
    throw error;
  }
};

// Get user profile thunk action
export const getUserProfile = (userId: string) => async (dispatch: Dispatch) => {
  try {
    dispatch(getUserProfileRequest());
    const response = await getUserProfileAPI(userId);
    dispatch(getUserProfileSuccess({
      success: response.success,
      data: response.data,
      message: response.message
    }));
    return response;
  } catch (error: any) {
    const errorMessage = getAuthErrorMessage(error);
    dispatch(getUserProfileFailure(errorMessage));
    throw error;
  }
};
