// src/features/users/components/UserManagementTable.tsx

import React, { useState, useEffect } from 'react';
import { DataTable } from '../../../../common/components/DataTable';
import { UserActionsMenu } from './UserActionsMenu';
import { EditUserModal } from './EditUserModal';
import { EditPasswordModal } from './EditPasswordModal';
import { ConfirmModal } from '../../../../common/modals';
import { getUserTableColumns } from './UserTableColumns';
import { useUserTable } from '../../hooks/useUserTable';
import {type User } from '../../types/user.types';
import { PAGE_SIZE_OPTIONS, ROW_HEIGHT } from '../../constants/user.constants';
import { adminApi } from '../../api/adminApi';

/**
 * User Management Table Component with Server-Side Pagination
 */
export const UserManagementTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRows, setTotalRows] = useState(0);
  const {
    paginationModel,
    anchorEl,
    selectedUser,
    isEditUserModalOpen,
    isEditPasswordModalOpen,
    isDeleteModalOpen,
    isApproveModalOpen,
    isBlockModalOpen,
    isLoading: actionLoading,
    refreshTrigger,
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
  } = useUserTable();

  // Fetch users from backend when pagination changes
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Convert MUI pagination (0-indexed page) to backend (1-indexed page)
        const backendPage = paginationModel.page + 1;
        const response = await adminApi.getAllUsers(backendPage, paginationModel.pageSize);
        
        // Map backend users to frontend format and filter out deleted users and admins
        const mappedUsers: User[] = response.data.users
          .filter((backendUser: any) => !backendUser.isDeleted && backendUser.role !== 'admin') // Exclude deleted users and admins
          .map((backendUser: any) => ({
            id: backendUser._id,
            name: backendUser.name,
            email: backendUser.email,
            role: backendUser.role,
            isVerified: backendUser.isVerified,
            isActive: backendUser.isActive,
            isDeleted: backendUser.isDeleted,
            deletedAt: backendUser.deletedAt,
            deletedBy: backendUser.deletedBy,
            status: !backendUser.isActive ? 'inactive' : (backendUser.isVerified ? 'active' : 'pending'),
          }));
        
        // Calculate total excluding admins from the response
        const totalNonAdmins = response.data.users.filter((u: any) => u.role !== 'admin').length;
        const adjustedTotal = response.total - (response.data.users.length - totalNonAdmins);
        
        setUsers(mappedUsers);
        setTotalRows(adjustedTotal);
        
        console.log('✅ Users fetched:', mappedUsers.length, 'Total:', response.total);
      } catch (err: any) {
        console.error('❌ Error fetching users:', err);
        setError(err.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [paginationModel.page, paginationModel.pageSize, refreshTrigger]);

  const columns = getUserTableColumns(handleMenuClick);

  return (
    <>
      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}
      
      <DataTable
        rows={users}
        columns={columns}
        loading={loading}
        rowHeight={ROW_HEIGHT}
        showPagination={true}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        rowCount={totalRows}
        paginationMode="server"
        disableColumnMenu={false}
        disableColumnReorder={true}
      />

      <UserActionsMenu
        anchorEl={anchorEl}
        selectedUser={selectedUser}
        onClose={handleMenuClose}
        onEditUser={handleEditUser}
        onEditPassword={handleEditPassword}
        onDelete={handleDelete}
        onBlock={handleBlock}
        onApprove={handleApprove}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        isLoading={actionLoading}
      />

      {/* Edit Password Modal */}
      <EditPasswordModal
        isOpen={isEditPasswordModalOpen}
        onClose={() => setIsEditPasswordModalOpen(false)}
        onSave={handleSavePassword}
        user={selectedUser}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />

      {/* Approve/Reject Confirmation Modal */}
      <ConfirmModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleConfirmApprove}
        title={selectedUser?.status === 'pending' ? "Approve User" : "Reject User"}
        message={
          selectedUser?.status === 'pending'
            ? `Are you sure you want to approve ${selectedUser?.name}?`
            : `Are you sure you want to reject ${selectedUser?.name}? This will mark them as pending again.`
        }
        confirmText={selectedUser?.status === 'pending' ? "Approve" : "Reject"}
        confirmButtonClass={selectedUser?.status === 'pending' ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"}
      />

      {/* Block/Unblock Confirmation Modal */}
      <ConfirmModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={handleConfirmBlock}
        title={selectedUser?.isActive !== false ? "Block User" : "Unblock User"}
        message={
          selectedUser?.isActive !== false
            ? `Are you sure you want to block ${selectedUser?.name}? This will prevent them from accessing the system.`
            : `Are you sure you want to unblock ${selectedUser?.name}? This will restore their access.`
        }
        confirmText={selectedUser?.isActive !== false ? "Block" : "Unblock"}
        confirmButtonClass={selectedUser?.isActive !== false ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
      />
    </>
  );
};
