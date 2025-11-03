// src/features/users/constants/user.constants.ts

import type { UserRole, UserStatus } from '../types/user.types';

/**
 * Status badge configuration
 */
export const STATUS_CONFIG: Record<UserStatus, { bg: string; text: string; label: string }> = {
  active: {
    bg: '#d1fae5',
    text: '#16a34a',
    label: 'Active',
  },
  pending: {
    bg: '#fef3c7',
    text: '#d97706',
    label: 'Pending',
  },
  inactive: {
    bg: '#fee2e2',
    text: '#dc2626',
    label: 'Inactive',
  },
};

/**
 * Role badge configuration
 * NOTE: Keys must match UserRole type ('admin' | 'user') - lowercase
 */
export const ROLE_CONFIG: Record<UserRole, { bg: string; text: string }> = {
  admin: {  // Changed from 'Admin' to 'admin' to match UserRole type
    bg: '#c3b5ffff',
    text: '#7c3aed',
  },
  user: {  // Changed from 'User' to 'user' to match UserRole type
    bg: '#f3f4f6',
    text: '#6b7280',
  },
  
  // NOTE: If you need capitalized display names, use these commented values:
  // 'Admin': { bg: '#c3b5ffff', text: '#7c3aed' },
  // 'User': { bg: '#f3f4f6', text: '#6b7280' },
};

/**
 * Default pagination
 */
export const DEFAULT_PAGINATION = {
  page: 0,
  pageSize: 10,
};

/**
 * Page size options
 */
export const PAGE_SIZE_OPTIONS = [10, 25, 50];

/**
 * Row height
 */
export const ROW_HEIGHT = 72;
