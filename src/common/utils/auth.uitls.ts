// src/utils/authUtils.ts
export const getDefaultDashboard = (userRole: string | undefined): string => {
  if (!userRole) return '/login';
  return userRole === 'admin' ? '/admin/dashboard' : '/dashboard';
};
