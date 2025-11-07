// src/features/admin/types/credential.types.ts

/**
 * Root Instance (Service)
 */
export interface RootInstance {
  _id: string;
  serviceName: string;
}

/**
 * Sub Instance (Credential Name/Folder)
 */
export interface SubInstance {
  _id: string;
  name: string;
}

/**
 * Shared User
 */
export interface SharedUser {
  _id: string;
  name: string;
  email: string;
}

/**
 * Created By User
 */
export interface CreatedByUser {
  _id: string;
  name: string;
  email: string;
}

/**
 * Credential Data (nested object)
 */
export interface CredentialData {
  username: string;        // Masked username (e.g., "a***m")
  password: string;        // Encrypted password
  url?: string;            // Optional URL
  notes?: string;          // Optional notes
}

/**
 * Main Credential Interface
 * Matches backend response structure exactly
 */
export interface Credential {
  _id: string;
  rootInstance: RootInstance;
  subInstance: SubInstance;
  credentialData: CredentialData;  // ✅ Nested credential data
  sharedWith: SharedUser[];
  createdBy: CreatedByUser;
  createdAt: string;
  updatedAt?: string;
  
  // Legacy support (some endpoints might return flat structure)
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

/**
 * Credentials API Response
 * Matches GET /api/admin/credentials response
 */
export interface CredentialsResponse {
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

/**
 * Single Credential Response
 * For GET /api/admin/credentials/:id
 */
export interface SingleCredentialResponse {
  success: boolean;
  data: {
    displaycred?: Credential;  // For normal view
    credential?: Credential;   // For decrypt view
  };
}

/**
 * Decrypted Credential
 * Extends Credential with decrypted password
 */
export interface DecryptedCredential extends Credential {
  decryptedPassword?: string;  // For frontend use after decryption
  decryptedUsername?: string;  // For frontend use after decryption
}

/**
 * Create Credential Payload
 * For POST /api/admin/credentials
 */
export interface CreateCredentialPayload {
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

/**
 * Update Credential Payload
 * For PUT /api/admin/credentials/:id
 */
export interface UpdateCredentialPayload {
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

/**
 * Share Credential Payload
 * For POST /api/users/credentials/:id/share
 */
export interface ShareCredentialPayload {
  userId: string;
}

/**
 * Audit Log
 */
export interface AuditLog {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  credential: {
    _id: string;
    subInstance: {
      _id: string;
      name: string;
    };
  } | null;
  credentialOwner: string;
  serviceName: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'decrypt' | 'share' | 'revoke' | 'view';
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  notes?: string;
}

/**
 * Audit Logs Response
 */
export interface AuditLogsResponse {
  success: boolean;
  data: {
    auditLogs: AuditLog[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Generic API Response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}
