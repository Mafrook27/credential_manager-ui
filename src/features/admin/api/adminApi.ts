import axiosInstance from "../../../services/axios";

// Backend response types
interface BackendUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface GetUsersResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: {
    users: BackendUser[];
  };
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
}

export interface UpdateUserData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  newPassword: string;
}




/*_____________type check for activity log _________________*/

export interface Activity {
  _id: string;
  requestId: string;
  timestamp: string;
  method: string;
  url: string;
  route?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  isAuthenticated: boolean;
  operation?: string;
  resourceId?: string;
  statusCode: number;
  responseTime?: number;
  isSlowResponse: boolean;
  slowThreshold?: number;
  ipAddress?: string;
  userAgent?: string;
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
  };
  hasError: boolean;
  errorMessage?: string | null;
  errorStack?: string | null;
}

export interface ActivityLogParams {
  page?: number;
  limit?: number;
  username?: string;
  isslow?: boolean;
  iserror?: boolean;
  startdate?: string;
  enddate?: string;
  sortby?: string;
  sortorder?: 'asc' | 'desc';
}

export interface ActivityLogResponse {
  success: boolean;
  data: Activity[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}


// API Functions
export const adminApi = {
  // Get all users with pagination
  getAllUsers: async (page = 1, limit = 10): Promise<GetUsersResponse> => {
    const response = await axiosInstance.get(
      `/admin/users?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Create new user
  createUser: async (data: CreateUserData) => {
    const response = await axiosInstance.post("/admin/users", data);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId: string) => {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId: string, data: UpdateUserData) => {
    const response = await axiosInstance.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Set user verification status
  setUserVerification: async (userId: string, isVerified: boolean) => {
    const response = await axiosInstance.patch(
      `/admin/users/${userId}/verify`,
      { isVerified }
    );
    return response.data;
  },

  // Set user active status (block/unblock)
  setUserActiveStatus: async (userId: string, isActive: boolean) => {
    const response = await axiosInstance.patch(
      `/admin/users/${userId}/active`,
      { isActive }
    );
    return response.data;
  },

  // Change user password
  changeUserPassword: async (userId: string, data: ChangePasswordData) => {
    const response = await axiosInstance.post(
      `/admin/users/${userId}/change-password`,
      data
    );
    return response.data;
  },

  // Get user stats
  getUserStats: async (userId: string) => {
    const response = await axiosInstance.get(`/admin/users/${userId}/stats`);
    return response.data;
  },

  getStats:async()=>{
    const res = await axiosInstance.get("/admin/stats");
    return res.data.data.stats;
  },
  // Get user access details
  getUserAccess: async (params?: any) => {
    const response = await axiosInstance.get("/admin/access", { params });
    return response.data;
  },

  // Get users list (for dropdowns)
  getUsersList: async () => {
    const response = await axiosInstance.get("/admin/users-list");
    return response.data;
  },
  fetchActivityLogs: async (
    params: ActivityLogParams
  ): Promise<ActivityLogResponse> => {
    const response = await axiosInstance.get("/admin/activity-logs", {
      params,
    });
    return response.data;
  },
};

// Utility functions for downloading activity logs
export const activityLogUtils = {
  // Download ALL activity data as JSON (complete details)
  downloadAsJson: (activities: Activity[], filename = "activity-logs.json") => {
    // Download the complete Activity objects with all fields
    const blob = new Blob([JSON.stringify(activities, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
