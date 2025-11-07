/**
 * Auth Session Hook
 * Manages authentication session lifecycle
 */

import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutSuccess } from '../redux/actions';
import { logout as logoutAPI } from '../api';
import { sessionMonitor } from '../../../utils/sessionMonitor';
import { useAuth } from '../../../common/hooks/useAuth';
import { toast } from '../../../common/utils/toast';

/**
 * Hook to manage authentication session
 * Handles session monitoring, logout, and session expiry
 */
export const useAuthSession = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  /**
   * Start session monitoring when user is authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      sessionMonitor.start();
    } else {
      sessionMonitor.stop();
    }

    return () => {
      sessionMonitor.stop();
    };
  }, [isAuthenticated]);

  /**
   * Handle user logout
   */
  const handleLogout = useCallback(async () => {
    try {
      // Call backend logout API
      await logoutAPI();
      
      // Stop session monitoring
      sessionMonitor.stop();
      
      // Clear Redux state
      dispatch(logoutSuccess());
      
      // Clear any local storage
      localStorage.removeItem('lastActivity');
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if API call fails, clear local state
      sessionMonitor.stop();
      dispatch(logoutSuccess());
      navigate('/login');
      
      toast.error('Logout failed, but session cleared locally');
    }
  }, [dispatch, navigate]);

  /**
   * Handle session expiry
   */
  const handleSessionExpiry = useCallback(() => {
    sessionMonitor.stop();
    dispatch(logoutSuccess());
    toast.warning('Your session has expired. Please login again.');
    navigate('/login?expired=1');
  }, [dispatch, navigate]);

  /**
   * Manually refresh session
   */
  const refreshSession = useCallback(async () => {
    try {
      await sessionMonitor.refresh();
      toast.success('Session refreshed');
      return true;
    } catch (error) {
      console.error('Session refresh failed:', error);
      handleSessionExpiry();
      return false;
    }
  }, [handleSessionExpiry]);

  return {
    isAuthenticated,
    user,
    logout: handleLogout,
    refreshSession,
    handleSessionExpiry,
  };
};
