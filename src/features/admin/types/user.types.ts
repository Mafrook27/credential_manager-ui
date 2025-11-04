// src/features/users/types/user.types.ts

export type UserStatus = 'active' | 'pending' | 'inactive';
export type UserRole = 'admin' | 'user';

/**
 * User data structure
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isVerified?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

/**
 * Props for UserActionsMenu
 */
export interface UserActionsMenuProps {
  anchorEl: null | HTMLElement;
  selectedUser: User | null;
  onClose: () => void;
  onEditUser: (userId: string) => void;
  onEditPassword: (userId: string) => void;
  onDelete: (userId: string) => void;
  onBlock: (userId: string) => void;
}
