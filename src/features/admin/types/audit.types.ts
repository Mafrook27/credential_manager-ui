// src/features/audit/types/audit.types.ts

export type AuditAction = 'create' | 'decrypt' | 'share' | 'view' | 'update' | 'delete' | 'read' | 'revoke';
export type ServiceType = 'cloud' | 'banking' | 'development' | 'design' | 'social' | 'payment' | 'personal' | 'work' | 'email' | 'other';

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
  serviceType: ServiceType;
  action: AuditAction;
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
}
