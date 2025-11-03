// src/features/admin/api/credentialsApi.ts

import axios from '../../../services/axios';
import type {
//   Credential,
  CredentialsResponse,
  SingleCredentialResponse,
  CreateCredentialPayload,
  UpdateCredentialPayload,
  ShareCredentialPayload,
  AuditLogsResponse,
} from '../types/credential.types';

// ============================================================================
// REQUEST PARAMS TYPES (Not in credential.types.ts)
// ============================================================================

export interface GetCredentialsParams {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  userId?: string;
  credentialId?: string;
  credentialOwner?: string;
}

// ============================================================================
// ADMIN CREDENTIALS API
// ============================================================================

/**
 * GET /api/admin/credentials
 * Get all credentials (Admin only)
 * Retrieve paginated list of all credentials with search and filter options
 */
export const getAllCredentials = async (
  params: GetCredentialsParams = {}
): Promise<CredentialsResponse> => {
  const response = await axios.get<CredentialsResponse>('/admin/credentials', {
    params: {
      search: params.search || undefined,
      type: params.type || undefined,
      page: params.page || 1,
      limit: params.limit || 5,
    },
  });
  return response.data;
};

/**
 * POST /api/admin/credentials
 * Create credential (Admin only)
 * Requires rootId and subId as query parameters
 */
export const createCredential = async (
  data: CreateCredentialPayload,
  rootId: string,
  subId: string
) => {
  const response = await axios.post('/admin/credentials', data, {
    params: { rootId, subId },
  });
  return response.data;
};

/**
 * GET /api/admin/credentials/:id
 * Get any credential (Admin only)
 * Password remains encrypted
 */
export const getCredentialById = async (
  id: string
): Promise<SingleCredentialResponse> => {
  const response = await axios.get<SingleCredentialResponse>(
    `/admin/credentials/${id}`
  );
  return response.data;
};

/**
 * PUT /api/admin/credentials/:credId
 * Update any credential (Admin only)
 * Can update username, password, url, notes
 */
export const updateCredential = async (
  credId: string,
  data: UpdateCredentialPayload
) => {
  const response = await axios.put(`/admin/credentials/${credId}`, data);
  return response.data;
};

/**
 * DELETE /api/admin/credentials/:id
 * Delete any credential (Admin only)
 * Permanently delete credential from system
 */
export const deleteCredential = async (id: string) => {
  const response = await axios.delete(`/admin/credentials/${id}`);
  return response.data;
};

/**
 * GET /api/admin/credentials/:id/decrypt
 * Get decrypted credential (Admin only)
 * Returns credential with decrypted password (creates audit log)
 */
export const decryptCredential = async (
  id: string
): Promise<SingleCredentialResponse> => {
  const response = await axios.get<SingleCredentialResponse>(
    `/admin/credentials/${id}/decrypt`
  );
  return response.data;
};

/**
 * GET /api/admin/credentials/:id/audit-logs
 * Get credential audit logs (Admin only)
 * Retrieve all audit logs for specific credential
 */
export const getCredentialAuditLogs = async (
  id: string,
  page: number = 1,
  limit: number = 5
): Promise<AuditLogsResponse> => {
  const response = await axios.get<AuditLogsResponse>(
    `/admin/credentials/${id}/audit-logs`,
    {
      params: { page, limit },
    }
  );
  return response.data;
};

/**
 * GET /api/admin/audit-logs
 * Get all audit logs (Admin only)
 * Retrieve system-wide audit logs with filtering
 */
export const getAllAuditLogs = async (
  params: GetAuditLogsParams = {}
): Promise<AuditLogsResponse> => {
  const response = await axios.get<AuditLogsResponse>('/admin/audit-logs', {
    params: {
      page: params.page || 1,
      limit: params.limit || 20,
      userId: params.userId || undefined,
      credentialId: params.credentialId || undefined,
      credentialOwner: params.credentialOwner || undefined,
    },
  });
  return response.data;
};

// ============================================================================
// SHARING API (Available to both Admin & Users)
// ============================================================================

/**
 * POST /api/users/credentials/:id/share
 * Share credential with another user
 * Only owner can share. Shared users can view/decrypt but not modify/delete.
 */
export const shareCredential = async (
  id: string,
  payload: ShareCredentialPayload
) => {
  const response = await axios.post(`/users/credentials/${id}/share`, payload);
  return response.data;
};

/**
 * DELETE /api/users/credentials/:id/share/:userId
 * Revoke shared access
 * Remove user's access to shared credential. Only owner can revoke.
 */
export const revokeSharedAccess = async (id: string, userId: string) => {
  const response = await axios.delete(
    `/users/credentials/${id}/share/${userId}`
  );
  return response.data;
};

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Admin version of share credential
 * Uses the same endpoint as users since it's available to both
 */
export const adminShareCredential = shareCredential;

/**
 * Admin version of revoke shared access
 * Uses the same endpoint as users since it's available to both
 */
export const adminRevokeSharedAccess = revokeSharedAccess;
