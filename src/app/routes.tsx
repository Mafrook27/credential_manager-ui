import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import GlobalLoader from '../common/components/GlobalLoader';

// Lazy load pages
const LoginPage = lazy(() => import('../features/auth/pages/index').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../features/auth/pages/index').then(m => ({ default: m.RegisterPage })));
const ResetPasswordPage = lazy(() => import('../features/auth/pages/index').then(m => ({ default: m.ResetPasswordPage })));
const DashboardLayout = lazy(() => import('../layouts/DashboardLayout'));
const AdminDashboard = lazy(() => import('../features/admin/pages/AdminDashboard'));
const UserManagementPage = lazy(() => import('../features/admin/pages/UserManagementPage').then(m => ({ default: m.UserManagementPage })));
const AuditLogPage = lazy(() => import('../features/admin/pages/AuditLogPage').then(m => ({ default: m.AuditLogPage })));
const AllCredentialsPage = lazy(() => import('../features/admin/pages/AllCredentialsPage').then(m => ({ default: m.AllCredentialsPage })));
const AccessControlPage = lazy(() => import('../features/admin/pages/AccessControlPage').then(m => ({ default: m.AccessControlPage })));
const Profile = lazy(() => import('../features/user/pages/profile').then(m => ({ default: m.Profile })));
const UserCredentialPage = lazy(() => import('../features/user/pages/Credentialpage.user').then(m => ({ default: m.UserCredentialPage })));
const UserDashboard = lazy(() => import('../features/user/pages/userDashboardpg').then(m => ({ default: m.UserDashboard })));
const AppRoutes: React.FC = () => {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);

  // Show loader on route change
  useEffect(() => {
    setIsNavigating(true);
    
    const animationFrame = requestAnimationFrame(() => {
      setIsNavigating(false);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [location.pathname]);

  return (
    <>
      {/* Show GlobalLoader during navigation */}
      {isNavigating && <GlobalLoader />}

      <Suspense fallback={<GlobalLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/credentials" element={<UserCredentialPage />} />
     
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagementPage/>} />
            <Route path="/admin/credentials" element={<AllCredentialsPage />} />
            <Route path="/admin/access-control" element={<AccessControlPage />} />
            <Route path="/admin/audit-logs" element={<AuditLogPage/>} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>

      <ToastContainer limit={2}/>
    </>
  );
};

export default AppRoutes;
