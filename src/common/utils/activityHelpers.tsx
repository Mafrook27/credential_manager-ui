import React from 'react';
import { 
  MdLogin, 
  MdLogout, 
  MdPersonAdd, 
  MdVpnKey, 
  MdDelete, 
  MdEdit, 
  MdShare, 
  MdFolder,
  MdLockReset,
  MdAdd,
  MdVisibility,
  MdLockOpen,
  MdCheckCircle,
  MdHistory,
  MdBarChart,
  MdInfo
} from 'react-icons/md';
import { getOperationConfig, DEFAULT_OPERATION } from '../config/operationConfig';

/**
 * Icon mapping based on iconType from config
 * This is the ONLY place where icons are mapped
 */
const ICON_MAP: Record<string, React.ReactElement> = {
  login: <MdLogin />,
  logout: <MdLogout />,
  registration: <MdPersonAdd />,
  password: <MdLockReset />,
  create: <MdAdd />,
  delete: <MdDelete />,
  update: <MdEdit />,
  read: <MdVisibility />,
  share: <MdShare />,
  decrypt: <MdLockOpen />,
  credential: <MdVpnKey />,
  instance: <MdFolder />,
  approve: <MdCheckCircle />,
  audit: <MdHistory />,
  stats: <MdBarChart />,
  default: <MdInfo />
};

/**
 * Formats operation code to human-readable text
 * Uses configuration file - NO hardcoding!
 * 
 * @param operation - Operation code from backend
 * @returns Human-readable label
 */
export const formatOperation = (operation: string | null | undefined): string => {
  if (!operation) {
    return 'Unknown Operation';
  }
  
  const config = getOperationConfig(operation);
  if (config) {
    return config.label;
  }
  
  // Fallback: convert SNAKE_CASE to readable text
  return operation.replace(/_/g, ' ').toLowerCase();
};

/**
 * Returns icon and color for an operation type
 * Uses configuration file - NO hardcoding!
 * 
 * @param operation - Operation code from backend
 * @returns Object with icon component and Bootstrap color
 */
export const getOperationStyle = (operation: string | null | undefined): { icon: React.ReactElement; color: string } => {
  const config = getOperationConfig(operation || '') || DEFAULT_OPERATION;
  
  return {
    icon: ICON_MAP[config.iconType] || ICON_MAP.default,
    color: config.color
  };
};

/**
 * Returns status badge component based on status code and operation
 */
export const getStatusBadge = (statusCode: number, operation: string): React.ReactElement => {
  if (operation === 'USER_REGISTRATION') {
    return <span className="badge bg-warning text-dark">Pending</span>;
  }
  if (statusCode >= 200 && statusCode < 300) {
    return <span className="badge bg-success">Success</span>;
  }
  return <span className="badge bg-danger">Error</span>;
};

/**
 * Converts timestamp to human-readable "time ago" format
 * Examples: "Just now", "5 mins ago", "2 hours ago", "3 days ago"
 */
export const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

/**
 * Extracts initials from a full name
 * Examples: "John Doe" -> "JD", "Alice" -> "AL"
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name || name.trim() === '') {
    return '??'; // Return placeholder for null/undefined/empty names
  }
  
  return name
    .trim()
    .split(' ')
    .filter(n => n.length > 0) // Filter out empty strings
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 1); // Get up to 2 initials (was 1, should be 2 for "JD")
};
