// user.credential.api.ts
import axiosInstance from '../../../services/axios';

// ==================== TYPES & INTERFACES ====================

export interface Credential {
  _id: string;
  // Nested structure (matches admin API)
  rootInstance?: {
    _id: string;
    serviceName: string;
    type: string;
  };
  subInstance?: {
    _id: string;
    name: string;
  };
  credentialData?: {
    username: string;
    password: string;
    url?: string;
    notes?: string;
  };
  // Flat structure (fallback)
  serviceName?: string;
  type?: string;
  subInstanceName?: string;
  username?: string;
  password?: string; // "[ENCRYPTED]" or decrypted value
  url?: string;
  notes?: string;
  // Common fields
  isOwner: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  sharedWith?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export interface GetCredentialsParams {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface GetCredentialsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: {
    credentials: Credential[];
  };
}

export interface GetCredentialResponse {
  success: boolean;
  data: {
    displaycred: Credential;
  };
}

export interface CreateCredentialData {
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

export interface CreateCredentialResponse {
  success: boolean;
  message: string;
  data: {
    credential: Credential;
  };
}

export interface UpdateCredentialData {
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

export interface UpdateCredentialResponse {
  success: boolean;
  message: string;
  data: {
    credential: Credential;
  };
}

export interface DeleteCredentialResponse {
  success: boolean;
  message: string;
}

export interface ShareCredentialData {
  userId: string;
}

export interface ShareCredentialResponse {
  success: boolean;
  message: string;
  data: {
    credential: Credential;
  };
}

export interface RevokeAccessResponse {
  success: boolean;
  message: string;
}

export interface AuditLog {
  _id: string;
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
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
}

export interface GetAuditLogsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: {
    auditLogs: AuditLog[];
  };
}

export interface GetDecryptedCredentialResponse {
  success: boolean;
  data: {
    credential: Credential;
  };
}


export interface ShareableUser {
  _id: string;
  name: string;

}

export interface GetShareableUsersResponse {
  success: boolean;
  data: {
    users: ShareableUser[];
  };
}

// ==================== API FUNCTIONS ====================

export const userCredentialApi = {
  /**
   * Get all credentials (owned and shared)
   * GET /api/users/credentials
   * Supports search, filtering by type, and pagination
   */
  getCredentials: async (params?: GetCredentialsParams): Promise<GetCredentialsResponse> => {
    const response = await axiosInstance.get('/users/credentials', { params });
    return response.data;
  },

  /**
   * Get a specific credential by ID (encrypted)
   * GET /api/users/credentials/:id
   */
  getCredential: async (credentialId: string): Promise<GetCredentialResponse> => {
    const response = await axiosInstance.get(`/users/credentials/${credentialId}`);
    return response.data;
  },

  /**
   * Create a new credential
   * POST /api/users/credentials?rootId={rootId}&subId={subId}
   * @param rootId - Root instance ID (service)
   * @param subId - Sub-instance ID (folder)
   * @param data - Credential data (username, password, url, notes)
   */
  createCredential: async (
    rootId: string,
    subId: string,
    data: CreateCredentialData
  ): Promise<CreateCredentialResponse> => {
    const response = await axiosInstance.post(
      `/users/credentials?rootId=${rootId}&subId=${subId}`,
      data
    );
    return response.data;
  },

  /**
   * Update a credential (owner only)
   * PUT /api/users/credentials/:credId
   */
  updateCredential: async (
    credentialId: string,
    data: UpdateCredentialData
  ): Promise<UpdateCredentialResponse> => {
    const response = await axiosInstance.put(`/users/credentials/${credentialId}`, data);
    return response.data;
  },

  /**
   * Delete a credential (owner only)
   * DELETE /api/users/credentials/:id
   */
  deleteCredential: async (credentialId: string): Promise<DeleteCredentialResponse> => {
    const response = await axiosInstance.delete(`/users/credentials/${credentialId}`);
    return response.data;
  },

  /**
   * Get decrypted credential (logs action in audit)
   * GET /api/users/credentials/:id/decrypt
   */
  getCredentialDecrypted: async (
    credentialId: string
  ): Promise<GetDecryptedCredentialResponse> => {
    const response = await axiosInstance.get(`/users/credentials/${credentialId}/decrypt`);
    return response.data;
  },

  /**
   * Share credential with another user (owner only)
   * POST /api/users/credentials/:id/share
   */
  shareCredential: async (
    credentialId: string,
    data: ShareCredentialData
  ): Promise<ShareCredentialResponse> => {
    const response = await axiosInstance.post(
      `/users/credentials/${credentialId}/share`,
      data
    );
    return response.data;
  },

  /**
   * Revoke shared access from a user (owner only)
   * DELETE /api/users/credentials/:id/share/:userId
   */
  revokeAccess: async (
    credentialId: string,
    userId: string
  ): Promise<RevokeAccessResponse> => {
    const response = await axiosInstance.delete(
      `/users/credentials/${credentialId}/share/${userId}`
    );
    return response.data;
  },

  /**
   * Get audit logs for a credential (owner only)
   * GET /api/users/credentials/:id/audit-logs
   */
  getAuditLogs: async (
    credentialId: string,
    params?: GetAuditLogsParams
  ): Promise<GetAuditLogsResponse> => {
    const response = await axiosInstance.get(
      `/users/credentials/${credentialId}/audit-logs`,
      { params }
    );
    return response.data;
  },



  getShareableUsers: async (query?: string, page = 1, limit = 10): Promise<GetShareableUsersResponse> => {

    const response = await axiosInstance.get('/users/list', {
      params: {
        ...(query ? { search: query } : {}),
        page,
        limit,
      },
    });
    return response.data;
  },

};

export default userCredentialApi;

