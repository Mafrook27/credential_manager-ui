import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../../features/auth/redux/actions';
import GlobalLoader from './GlobalLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerification?: boolean;
  requireAdmin?: boolean;
}


const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireVerification = true,
  requireAdmin = false 
}) => {
  const { isAuthenticated, isVerified, isActive, isAdmin, loading, user } = useAuth();
  const dispatch = useDispatch();
  const hasShownAlert = useRef(false);
  const hasShownBlockedAlert = useRef(false);

  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  
  // Check if user is blocked
  useEffect(() => {
    if (isActive === false && isAuthenticated && !hasShownBlockedAlert.current) {
      console.log('🚫 User is blocked, logging out and redirecting');
      hasShownBlockedAlert.current = true;
      dispatch(logout());
      alert('🚫 Your account has been blocked. Please contact the administrator.');
    }
  }, [isActive, dispatch, isAuthenticated]);

  // Authenticated but not verified - logout and redirect to login
  useEffect(() => {
    if (requireVerification && isVerified === false && isAuthenticated && !hasShownAlert.current) {
      console.log('⏳ User not verified, logging out and redirecting');
      hasShownAlert.current = true;
      dispatch(logout());
      alert('⚠️ Your account is pending admin approval. Please wait for verification.');
    }
  }, [isVerified, requireVerification, dispatch, isAuthenticated]);

  // Debug logging
  console.log('🔐 ProtectedRoute Check:', {
    isAuthenticated,
    isVerified,
    isActive,
    isAdmin,
    loading,
    userRole: user?.role,
    userIsVerified: user?.isVerified,
    userIsActive: user?.isActive
  });

  // NOW ALL CONDITIONAL RETURNS COME AFTER ALL HOOKS
  
  if (loading) {
    return (
      <div>
        <GlobalLoader/>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (isActive === false) {
    return <Navigate to="/login" replace />;
  }

  if (requireVerification && isVerified === false) {
    return <Navigate to="/login" replace />;
  }

  // Requires admin but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
