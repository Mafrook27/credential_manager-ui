import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { forceLogout } from '../utils/sessionExpiry';

/**
 * Axios Instance Configuration
 * Handles session-based authentication with automatic token refresh
 */

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_PROD_API_URL || import.meta.env.VITE_API_URL_NGROK || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for HTTP-only cookies
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: Error | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor
 * Logs outgoing requests in development
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (import.meta.env.DEV) {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data
      });
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles automatic token refresh on 401 errors
 */
axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('📥 API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (import.meta.env.DEV) {
      console.log('📤 API Error:', {
        url: originalRequest?.url,
        status: error.response?.status,
        data: error.response?.data
      });
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && originalRequest) {
      const errorData = error.response.data as { code?: string; message?: string };

      // Check if error is TOKEN_EXPIRED (access token expired)
      if (errorData.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
        console.log('🔄 Access token expired, attempting refresh...');
        
        // If already refreshing, queue this request
        if (isRefreshing) {
          console.log('⏳ Refresh already in progress, queuing request:', originalRequest.url);
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              console.log('✅ Queued request retrying:', originalRequest.url);
              return axiosInstance(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log('🔑 Calling refresh token endpoint...');
          const refreshResponse = await axiosInstance.post('/auth/refresh');
          console.log('✅ Token refresh successful!', refreshResponse.data);
          
          // Token refreshed successfully, process queued requests
          console.log(`📦 Processing ${failedQueue.length} queued requests`);
          processQueue();
          isRefreshing = false;

          // Retry the original request
          console.log('🔁 Retrying original request:', originalRequest.url);
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          
          // Check if it's a "logged in elsewhere" error
          const refreshErrorData = (refreshError as any)?.response?.data;
          const isLoggedInElsewhere = refreshErrorData?.message?.includes('logged in from another device');
          
          // Refresh failed, clear queue and redirect to login
          processQueue(refreshError as Error);
          isRefreshing = false;

          // Force logout with appropriate message
          if (isLoggedInElsewhere) {
            forceLogout('Logged in from another device');
          } else {
            forceLogout('Token refresh failed');
          }
          return Promise.reject(refreshError);
        }
      }

      // Handle other 401 errors (NO_TOKEN, SESSION_EXPIRED, etc.)
      if (errorData.code === 'SESSION_EXPIRED' || errorData.code === 'NO_TOKEN' || errorData.code === 'INVALID_TOKEN') {
        // Force logout and redirect
        forceLogout(`Session invalid: ${errorData.code}`);
        return Promise.reject(error);
      }
    }

    // Handle 403 Forbidden (blocked account, etc.)
    if (error.response?.status === 403) {
      const errorData = error.response.data as { message?: string };
      console.error('🚫 Access Denied:', errorData.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
