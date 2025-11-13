// src/features/users/hooks/useUserTable.ts

import { useState, useCallback } from 'react';
import { type  GridPaginationModel } from '@mui/x-data-grid';
import {type User } from '../types/user.types';
import { DEFAULT_PAGINATION } from '../constants/user.constants';
import { adminApi } from '../api/adminApi';
import { toast } from '../../../common/utils/toast';
import { shouldShowError, getErrorMessage } from '../../../common/utils/errorHandler';

/**
 * Custom hook for User Table logic
 */
export const useUserTable = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Modal states
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isEditPasswordModalOpen, setIsEditPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>, user: User) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleApprove = useCallback((userId: string) => {
    const user = selectedUser || { id: userId } as User;
    setSelectedUser(user);
    setIsApproveModalOpen(true);
  }, [selectedUser]);

  const handleEditUser = useCallback((userId: string) => {
    const user = selectedUser || { id: userId } as User;
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  }, [selectedUser]);

  const handleEditPassword = useCallback((userId: string) => {
    const user = selectedUser || { id: userId } as User;
    setSelectedUser(user);
    setIsEditPasswordModalOpen(true);
  }, [selectedUser]);

  const handleDelete = useCallback((userId: string) => {
    const user = selectedUser || { id: userId } as User;
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  }, [selectedUser]);

  const handleBlock = useCallback((userId: string) => {
    const user = selectedUser || { id: userId } as User;
    setSelectedUser(user);
    setIsBlockModalOpen(true);
  }, [selectedUser]);

  // Modal actions
  const handleSaveUser = useCallback(async (userId: string, name: string, email: string) => {
    try {
      setIsLoading(true);
      // console.log('💾 Saving user:', { userId, name, email });
      
      // Normalize email before sending to backend
      const normalizedEmail = email.toLowerCase().trim();
      
      // Update name and email
      await adminApi.updateUser(userId, { name, email: normalizedEmail });
      
      // console.log('✅ User updated successfully');
      toast.success('User updated successfully!');
      
      setIsEditUserModalOpen(false);
      setAnchorEl(null);
      setSelectedUser(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      // console.error('❌ Error updating user:', error);
      if (shouldShowError(error)) {
        toast.error(getErrorMessage(error, 'Failed to update user'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser]);

  const handleSavePassword = useCallback(async (userId: string, password: string) => {
    try {
      setIsLoading(true);
      // console.log('🔒 Updating password for:', userId);
      
      await adminApi.changeUserPassword(userId, { newPassword: password });
      
      // console.log('✅ Password updated successfully');
      toast.success('Password updated successfully!');
      
      setIsEditPasswordModalOpen(false);
      setAnchorEl(null);
      setSelectedUser(null);
    } catch (error) {
      // console.error('❌ Error updating password:', error);
      if (shouldShowError(error)) {
        toast.error(getErrorMessage(error, 'Failed to update password'));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      setIsLoading(true);
      // console.log('🗑️ Deleting user:', selectedUser?.id);
      
      if (!selectedUser?.id) return;
      
      await adminApi.deleteUser(selectedUser.id);
      
      // console.log('✅ User deleted successfully');
      toast.success('User deleted successfully!');
      
      setIsDeleteModalOpen(false);
      setAnchorEl(null);
      setSelectedUser(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      // console.error('❌ Error deleting user:', error);
      if (shouldShowError(error)) {
        toast.error(getErrorMessage(error, 'Failed to delete user'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser]);

  const handleConfirmApprove = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!selectedUser?.id) return;
      
      // Toggle verification status - set to opposite of current state
      const newVerificationStatus = !selectedUser.isVerified;
      await adminApi.setUserVerification(selectedUser.id, newVerificationStatus);
      
      const action = newVerificationStatus ? 'approved' : 'rejected';
      toast.success(`User ${action} successfully!`);
      
      setIsApproveModalOpen(false);
      setSelectedUser(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      if (shouldShowError(error)) {
        toast.error(getErrorMessage(error, 'Failed to update user status'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser]);

  const handleConfirmBlock = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!selectedUser?.id) return;
      
      // Toggle active status - set to opposite of current state
      const newActiveStatus = !selectedUser.isActive;
      await adminApi.setUserActiveStatus(selectedUser.id, newActiveStatus);
      
      const action = newActiveStatus ? 'unblocked' : 'blocked';
      toast.success(`User ${action} successfully!`);
      
      setIsBlockModalOpen(false);
      setSelectedUser(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      if (shouldShowError(error)) {
        toast.error(getErrorMessage(error, 'Failed to update user status'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser]);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    paginationModel,
    anchorEl,
    selectedUser,
    isEditUserModalOpen,
    isEditPasswordModalOpen,
    isDeleteModalOpen,
    isApproveModalOpen,
    isBlockModalOpen,
    isLoading,
    refreshTrigger,
    triggerRefresh,
    setPaginationModel,
    handleMenuClick,
    handleMenuClose,
    handleApprove,
    handleBlock,
    handleEditUser,
    handleEditPassword,
    handleDelete,
    handleSaveUser,
    handleSavePassword,
    handleConfirmDelete,
    handleConfirmApprove,
    handleConfirmBlock,
    setIsEditUserModalOpen,
    setIsEditPasswordModalOpen,
    setIsDeleteModalOpen,
    setIsApproveModalOpen,
    setIsBlockModalOpen,
  };
};
