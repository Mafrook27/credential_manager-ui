// user.api.ts
import axiosInstance from '../../../services/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface UserStats {
  totalCredentials: number;
  sharedWithMe: number;
  recentActivities: number;
}

export interface UserStatsResponse {
  success: boolean;
  data: {
    stats: UserStats;
  };
}

export interface UserAuditLog {
  _id: string;
  id: string; // For DataTable
  user: {
    _id: string;
    name: string;
    email: string;
  };
  credential: string;
  credentialOwner: string;
  serviceName: string;
  subInstanceName: string;
  action: 'create' | 'view' | 'update' | 'delete' | 'decrypt' | 'share' | 'revoke';
  targetUser?: {
    _id: string;
    name: string;
    email: string;
  };
  timestamp: string;
  userAgent: string;
}

export interface GetUserAuditLogsParams {
  page?: number;
  limit?: number;
}

export interface GetUserAuditLogsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: {
    auditLogs: UserAuditLog[];
  };
}

export const userApi = {
  async getProfile(userId: string): Promise<User> {
    const res = await axiosInstance.get(`/users/${userId}`);
    const u = res.data.data.user;
    return { id: u._id, ...u }; // map _id to id
  },

  async updateProfile(userId: string, data: { name?: string; email?: string }): Promise<User> {
    const res = await axiosInstance.put(`/users/${userId}`, data);
    const u = res.data.data.user;
    return { id: u._id, ...u };
  },

  async deleteUser(userId: string) {
    return axiosInstance.delete(`/users/${userId}`);
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await axiosInstance.post('/users/change-password', {
      oldPassword,
      newPassword
    });
  },

  async getUserStats(userId: string): Promise<UserStatsResponse> {
    const response = await axiosInstance.get(`/users/${userId}/stats`);
    return response.data;
  },

  async getUserAuditLogs(userId: string, params?: GetUserAuditLogsParams): Promise<GetUserAuditLogsResponse> {
    const response = await axiosInstance.get(`/users/${userId}/audit-logs`, { params });
    return response.data;
  },
};
