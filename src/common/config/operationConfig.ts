/**
 * OPERATION CONFIGURATION
 * 
 * This file defines all operation metadata in one place.
 * When backend adds new operations, just update this config file.
 * 
 * Benefits:
 * 1. Single source of truth
 * 2. Easy to maintain
 * 3. No code changes needed - just config updates
 * 4. Can be loaded from API in future
 */

export interface OperationConfig {
  code: string;
  label: string;
  category: 'auth' | 'instance' | 'user' | 'admin';
  iconType: 'login' | 'logout' | 'registration' | 'password' | 'create' | 'delete' | 'update' | 'read' | 'share' | 'decrypt' | 'credential' | 'instance' | 'approve' | 'audit' | 'stats' | 'default';
  color: 'blue' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
}

/**
 * MASTER OPERATION REGISTRY
 * Add new operations here when backend creates them
 */
export const OPERATIONS: OperationConfig[] = [
  // ==================== AUTH OPERATIONS (5) ====================
  {
    code: 'USER_REGISTRATION',
    label: 'Registered account',
    category: 'auth',
    iconType: 'registration',
    color: 'success'
  },
  {
    code: 'USER_LOGIN',
    label: 'Logged in',
    category: 'auth',
    iconType: 'login',
    color: 'blue'
  },
  {
    code: 'USER_LOGOUT',
    label: 'Logged out',
    category: 'auth',
    iconType: 'logout',
    color: 'secondary'
  },
  {
    code: 'PASSWORD_RESET_REQUEST',
    label: 'Requested password reset',
    category: 'auth',
    iconType: 'password',
    color: 'warning'
  },
  {
    code: 'PASSWORD_RESET_VERIFY',
    label: 'Verified password reset',
    category: 'auth',
    iconType: 'password',
    color: 'warning'
  },

  // ==================== INSTANCE OPERATIONS (8) ====================
  {
    code: 'CREATE_INSTANCE',
    label: 'Created instance',
    category: 'instance',
    iconType: 'create',
    color: 'success'
  },
  {
    code: 'READ_ALL_INSTANCES',
    label: 'Viewed all instances',
    category: 'instance',
    iconType: 'read',
    color: 'info'
  },
  {
    code: 'UPDATE_INSTANCE',
    label: 'Updated instance',
    category: 'instance',
    iconType: 'update',
    color: 'warning'
  },
  {
    code: 'DELETE_INSTANCE',
    label: 'Deleted instance',
    category: 'instance',
    iconType: 'delete',
    color: 'danger'
  },
  {
    code: 'CREATE_SUB_INSTANCE',
    label: 'Created sub-instance',
    category: 'instance',
    iconType: 'create',
    color: 'success'
  },
  {
    code: 'READ_SUB_INSTANCES',
    label: 'Viewed sub-instances',
    category: 'instance',
    iconType: 'read',
    color: 'info'
  },
  {
    code: 'UPDATE_SUB_INSTANCE',
    label: 'Updated sub-instance',
    category: 'instance',
    iconType: 'update',
    color: 'warning'
  },
  {
    code: 'DELETE_SUB_INSTANCE',
    label: 'Deleted sub-instance',
    category: 'instance',
    iconType: 'delete',
    color: 'danger'
  },

  // ==================== USER OPERATIONS (15) ====================
  {
    code: 'READ_USER_LIST',
    label: 'Viewed user list',
    category: 'user',
    iconType: 'read',
    color: 'info'
  },
  {
    code: 'CHANGE_PASSWORD',
    label: 'Changed password',
    category: 'user',
    iconType: 'password',
    color: 'warning'
  },
  {
    code: 'READ_ALL_CREDENTIALS',
    label: 'Viewed all credentials',
    category: 'user',
    iconType: 'credential',
    color: 'primary'
  },
  {
    code: 'CREATE_CREDENTIAL',
    label: 'Created credential',
    category: 'user',
    iconType: 'create',
    color: 'success'
  },
  {
    code: 'UPDATE_CREDENTIAL',
    label: 'Updated credential',
    category: 'user',
    iconType: 'update',
    color: 'warning'
  },
  {
    code: 'DECRYPT_CREDENTIAL',
    label: 'Decrypted credential',
    category: 'user',
    iconType: 'decrypt',
    color: 'info'
  },
  {
    code: 'READ_CREDENTIAL_AUDIT_LOGS',
    label: 'Viewed credential audit logs',
    category: 'user',
    iconType: 'audit',
    color: 'secondary'
  },
  {
    code: 'SHARE_CREDENTIAL',
    label: 'Shared credential',
    category: 'user',
    iconType: 'share',
    color: 'primary'
  },
  {
    code: 'REVOKE_CREDENTIAL_ACCESS',
    label: 'Revoked credential access',
    category: 'user',
    iconType: 'delete',
    color: 'danger'
  },
  {
    code: 'READ_CREDENTIAL',
    label: 'Viewed credential',
    category: 'user',
    iconType: 'read',
    color: 'info'
  },
  {
    code: 'DELETE_CREDENTIAL',
    label: 'Deleted credential',
    category: 'user',
    iconType: 'delete',
    color: 'danger'
  },
  {
    code: 'READ_USER_STATS',
    label: 'Viewed user stats',
    category: 'user',
    iconType: 'stats',
    color: 'info'
  },
  {
    code: 'READ_USER_PROFILE',
    label: 'Viewed profile',
    category: 'user',
    iconType: 'read',
    color: 'info'
  },
  {
    code: 'UPDATE_USER_PROFILE',
    label: 'Updated profile',
    category: 'user',
    iconType: 'update',
    color: 'warning'
  },
  {
    code: 'DELETE_USER',
    label: 'Deleted account',
    category: 'user',
    iconType: 'delete',
    color: 'danger'
  },

  // ==================== ADMIN OPERATIONS (19) ====================
  {
    code: 'ADMIN_READ_ALL_USERS',
    label: 'Viewed all users',
    category: 'admin',
    iconType: 'read',
    color: 'info'
  },
  {
    code: 'ADMIN_CREATE_USER',
    label: 'Created new user',
    category: 'admin',
    iconType: 'create',
    color: 'success'
  },
  {
    code: 'ADMIN_APPROVE_USER',
    label: 'Approved user',
    category: 'admin',
    iconType: 'approve',
    color: 'success'
  },
  {
    code: 'ADMIN_READ_USER_PROFILE',
    label: 'Viewed user profile',
    category: 'admin',
    iconType: 'read',
    color: 'info'
  },
  {
    code: 'ADMIN_UPDATE_USER',
    label: 'Updated user',
    category: 'admin',
    iconType: 'update',
    color: 'warning'
  },
  {
    code: 'ADMIN_DELETE_USER',
    label: 'Deleted user',
    category: 'admin',
    iconType: 'delete',
    color: 'danger'
  },
  {
    code: 'ADMIN_CHANGE_USER_ROLE',
    label: 'Changed user role',
    category: 'admin',
    iconType: 'update',
    color: 'warning'
  },
  {
    code: 'ADMIN_READ_USER_STATS',
    label: 'Viewed user stats',
    category: 'admin',
    iconType: 'stats',
    color: 'info'
  },
  {
    code: 'ADMIN_CHANGE_USER_PASSWORD',
    label: 'Changed user password',
    category: 'admin',
    iconType: 'password',
    color: 'warning'
  },
  {
    code: 'ADMIN_READ_USER_ACCESS',
    label: 'Viewed user access',
    category: 'admin',
    iconType: 'read',
    color: 'info'
  },
  {
    code: 'ADMIN_READ_USER_LIST',
    label: 'Viewed user list',
    category: 'admin',
    iconType: 'read',
    color: 'info'
  },
  {
    code: 'ADMIN_CHANGE_PASSWORD',
    label: 'Changed password',
    category: 'admin',
    iconType: 'password',
    color: 'warning'
  },
  {
    code: 'ADMIN_READ_ALL_CREDENTIALS',
    label: 'Viewed all credentials',
    category: 'admin',
    iconType: 'credential',
    color: 'primary'
  },
  {
    code: 'ADMIN_CREATE_CREDENTIAL',
    label: 'Created credential',
    category: 'admin',
    iconType: 'create',
    color: 'success'
  },
  {
    code: 'ADMIN_READ_CREDENTIAL',
    label: 'Viewed credential',
    category: 'admin',
    iconType: 'read',
    color: 'info'
  },
  {
    code: 'ADMIN_UPDATE_CREDENTIAL',
    label: 'Updated credential',
    category: 'admin',
    iconType: 'update',
    color: 'warning'
  },
  {
    code: 'ADMIN_DELETE_CREDENTIAL',
    label: 'Deleted credential',
    category: 'admin',
    iconType: 'delete',
    color: 'danger'
  },
  {
    code: 'ADMIN_DECRYPT_CREDENTIAL',
    label: 'Decrypted credential',
    category: 'admin',
    iconType: 'decrypt',
    color: 'info'
  },
  {
    code: 'ADMIN_READ_CREDENTIAL_AUDIT_LOGS',
    label: 'Viewed audit logs',
    category: 'admin',
    iconType: 'audit',
    color: 'secondary'
  },
  {
    code: 'ADMIN_SHARE_CREDENTIAL',
    label: 'Shared credential',
    category: 'admin',
    iconType: 'share',
    color: 'primary'
  },
  {
    code: 'ADMIN_REVOKE_CREDENTIAL',
    label: 'Revoked credential access',
    category: 'admin',
    iconType: 'delete',
    color: 'danger'
  },
  {
    code: 'ADMIN_READ_ALL_STATS',
    label: 'Viewed system stats',
    category: 'admin',
    iconType: 'stats',
    color: 'info'
  },
  {
    code: 'ADMIN_READ_ALL_AUDIT_LOGS',
    label: 'Viewed audit logs',
    category: 'admin',
    iconType: 'audit',
    color: 'secondary'
  }
];

/**
 * Create a lookup map for O(1) access
 */
export const OPERATION_MAP = new Map<string, OperationConfig>(
  OPERATIONS.map(op => [op.code, op])
);

/**
 * Helper to get operation config by code
 */
export const getOperationConfig = (code: string): OperationConfig | undefined => {
  return OPERATION_MAP.get(code);
};

/**
 * Get operations by category
 */
export const getOperationsByCategory = (category: OperationConfig['category']): OperationConfig[] => {
  return OPERATIONS.filter(op => op.category === category);
};

/**
 * Fallback for unknown operations
 */
export const DEFAULT_OPERATION: OperationConfig = {
  code: 'UNKNOWN',
  label: 'Unknown operation',
  category: 'user',
  iconType: 'default',
  color: 'secondary'
};
