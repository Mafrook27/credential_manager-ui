import * as types from './actionTypes';
import type { AuthState, AuthResponse } from './types';

const initialState: AuthState = {
  user: null,
  token: null, // Backend uses HTTP-only cookies, no token in localStorage
  isAuthenticated: false, // Will be determined by API calls
  isVerified: false,
  isActive: true,
  loading: false,
  error: null,
};

interface AuthSuccessAction {
  type: string;
  payload: AuthResponse;
}

interface AuthFailureAction {
  type: string;
  payload: string;
}

type AuthAction = AuthSuccessAction | AuthFailureAction | { type: string; payload?: never };

const authReducer = (state = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    case types.LOGIN_REQUEST:
    case types.REGISTER_REQUEST:
    case types.GET_USER_PROFILE_REQUEST:
    case types.RESET_PASSWORD_REQUEST:
    case types.RESET_PASSWORD_VERIFY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.LOGIN_SUCCESS:
    case types.REGISTER_SUCCESS:
    case types.GET_USER_PROFILE_SUCCESS:
      // Backend uses HTTP-only cookies, no token handling needed
      // console.log('🔍 Auth Success Payload:', action.payload);
      // console.log('🔍 User Data:', action.payload.data.user);
      // console.log('🔍 isVerified from backend:', action.payload.data.user?.isVerified);
      
      if (action.payload && typeof action.payload === 'object' && 'data' in action.payload) {
        const successPayload = action.payload as AuthResponse;
        return {
          ...state,
          user: successPayload.data.user,
          token: null, // No token needed with cookie auth
          isAuthenticated: true,
          isVerified: successPayload.data.user?.isVerified ?? false,
          isActive: successPayload.data.user?.isActive ?? true,
          loading: false,
          error: null,
        };
      }
      return state;

    case types.LOGIN_FAILURE:
    case types.REGISTER_FAILURE:
    case types.GET_USER_PROFILE_FAILURE:
    case types.RESET_PASSWORD_FAILURE:
    case types.RESET_PASSWORD_VERIFY_FAILURE:
      return {
        ...state,
        loading: false,
        error: typeof action.payload === 'string' ? action.payload : null,
        isAuthenticated: false, // Set to false on auth failures
        isVerified: false,
        isActive: true,
      };

    case types.RESET_PASSWORD_SUCCESS:
    case types.RESET_PASSWORD_VERIFY_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case types.LOGOUT:
      // Cookie will be cleared by backend, just update state
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isVerified: false,
        isActive: true,
        loading: false,
        error: null,
      };

    case types.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export default authReducer;
