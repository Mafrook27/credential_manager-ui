// src/features/users/components/UserActionsMenu.tsx

import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { MdPerson, MdLock, MdDelete, MdBlock, MdCheck } from 'react-icons/md';
import { type UserActionsMenuProps } from '../../types/user.types';

/**
 * User Actions Dropdown Menu
 */
export const UserActionsMenu: React.FC<UserActionsMenuProps> = ({
  anchorEl,
  selectedUser,
  onClose,
  onEditUser,
  onEditPassword,
  onDelete,
  onBlock,
  onApprove,
}) => {
  const isAdmin = selectedUser?.role === 'admin';
  const isPending = selectedUser?.status === 'pending';

  const handleApprove = () => {
    if (selectedUser) onApprove(selectedUser.id);
    onClose();
  };

  const handleEditUser = () => {
    if (selectedUser) onEditUser(selectedUser.id);
    onClose();
  };

  const handleEditPassword = () => {
    if (selectedUser) onEditPassword(selectedUser.id);
    onClose();
  };

  const handleBlock = () => {
    if (selectedUser) onBlock(selectedUser.id);
    onClose();
  };

  const handleDelete = () => {
    if (selectedUser) onDelete(selectedUser.id);
    onClose();
  };

  // Don't show menu for admin users
  if (isAdmin) {
    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled style={{ color: '#9ca3af', cursor: 'not-allowed' }}>
          <MdBlock className="me-2" size={18} /> No actions for admin
        </MenuItem>
      </Menu>
    );
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {/* Approve/Reject User - Toggle for pending users */}
      {isPending ? (
        <MenuItem onClick={handleApprove} style={{ color: '#10b981' }}>
          <MdCheck className="me-2" size={18} /> Approve User
        </MenuItem>
      ) : (
        <MenuItem onClick={handleApprove} style={{ color: '#f59e0b' }}>
          <MdBlock className="me-2" size={18} /> Reject User
        </MenuItem>
      )}
      
      {/* Edit User */}
      <MenuItem onClick={handleEditUser}>
        <MdPerson className="me-2" size={18} /> Edit User
      </MenuItem>
      
      {/* Edit Password */}
      <MenuItem onClick={handleEditPassword}>
        <MdLock className="me-2" size={18} /> Edit Password
      </MenuItem>
      
      {/* Block/Unblock User - Toggle */}
      <MenuItem onClick={handleBlock} style={{ color: selectedUser?.isActive !== false ? '#f59e0b' : '#10b981' }}>
        <MdBlock className="me-2" size={18} /> {selectedUser?.isActive !== false ? 'Block User' : 'Unblock User'}
      </MenuItem>
      
      {/* Delete User (Soft Delete) */}
      <MenuItem onClick={handleDelete} style={{ color: '#dc2626' }}>
        <MdDelete className="me-2" size={18} /> Delete User
      </MenuItem>
    </Menu>
  );
};
