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
    isLoading: actionLoading,
    refreshTrigger,
    setPaginationModel,
    handleMenuClick,
    handleMenuClose,
    handleApprove,
    handleEditUser,
    handleEditPassword,
    handleDelete,
    handleSaveUser,
    handleSavePassword,
    handleConfirmDelete,
    handleConfirmApprove,
    setIsEditUserModalOpen,
    setIsEditPasswordModalOpen,
    setIsDeleteModalOpen,
    setIsApproveModalOpen,
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
        
        // Map backend users to frontend format
        const mappedUsers: User[] = response.data.users.map((backendUser) => ({
          id: backendUser._id,
          name: backendUser.name,
          email: backendUser.email,
          role: backendUser.role,
          status: backendUser.isVerified ? 'active' : 'pending',
        }));
        
        setUsers(mappedUsers);
        setTotalRows(response.total);
        
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

  const columns = getUserTableColumns(handleApprove, handleMenuClick);

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

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleConfirmApprove}
        title="Approve User"
        message={`Are you sure you want to approve ${selectedUser?.name}?`}
        confirmText="Approve"
        confirmButtonClass="bg-green-600 hover:bg-green-700"
      />
    </>
  );
};
