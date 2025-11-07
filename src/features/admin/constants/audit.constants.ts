// src/features/audit/constants/audit.constants.ts

import type { AuditAction } from '../types/audit.types';

export const ACTION_CONFIG: Record<AuditAction, { color: string }> = {
  create: { color: '#16a34a' },
  decrypt: { color: '#d97706' },
  share: { color: '#3b82f6' },
  view: { color: '#6b7280' },
  read: { color: '#6b7280' },
  update: { color: '#8b5cf6' },
  delete: { color: '#dc2626' },
  revoke: { color: '#dc2626' },
};
