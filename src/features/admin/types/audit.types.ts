// src/features/audit/types/audit.types.ts

export type AuditAction = 'create' | 'decrypt' | 'share' | 'view' | 'update' | 'delete' | 'read' | 'revoke';

export interface AuditLog {
  _id: string;
  id: string; // Alias for _id to satisfy DataTable requirements
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
  serviceName: string;
  subInstanceName?: string; // Stored directly for historical tracking (even after credential deletion)
  action: AuditAction;
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
}
