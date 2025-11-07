// src/common/hooks/useAuth.ts
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated, selectIsVerified, selectIsActive, selectAuthLoading } from '../../features/auth/redux/selectors';


export const useAuth = () => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isVerified = useSelector(selectIsVerified);
  const isActive = useSelector(selectIsActive);
  const loading = useSelector(selectAuthLoading);

  return {
    user,
    isAuthenticated,
    isVerified,
    isActive,
    loading,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    userName: user?.name || 'User',
    userEmail: user?.email || '',
    userInitials: user?.name ? user.name.split(' ').map((n:any) => n[0]).join('').toUpperCase().slice(0, 2): 'N'
  };
};
