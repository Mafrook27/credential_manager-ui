// src/features/audit/constants/audit.constants.ts

import type { AuditAction, ServiceType } from '../types/audit.types';

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

export const SERVICE_CONFIG: Record<ServiceType, { bg: string; text: string; label: string }> = {
  cloud: { bg: '#dbeafe', text: '#3b82f6', label: 'Cloud' },
  banking: { bg: '#d1fae5', text: '#10b981', label: 'Banking' },
  development: { bg: '#f3f4f6', text: '#374151', label: 'Development' },
  design: { bg: '#fce7f3', text: '#ec4899', label: 'Design' },
  social: { bg: '#ddd6fe', text: '#8b5cf6', label: 'Social' },
  payment: { bg: '#e0e7ff', text: '#6366f1', label: 'Payment' },
  personal: { bg: '#fef3c7', text: '#f59e0b', label: 'Personal' },
  work: { bg: '#e0f2fe', text: '#0284c7', label: 'Work' },
  email: { bg: '#fecaca', text: '#dc2626', label: 'Email' },
  other: { bg: '#e5e7eb', text: '#6b7280', label: 'Other' },
};
