// src/features/users/components/UserActionsMenu.tsx

import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { MdPerson, MdLock, MdDelete, MdBlock } from 'react-icons/md';
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
}) => {
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

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MenuItem onClick={handleEditUser}>
        <MdPerson className="me-2" size={18} /> Edit User
      </MenuItem>
      <MenuItem onClick={handleEditPassword}>
        <MdLock className="me-2" size={18} /> Edit Password
      </MenuItem>
      <MenuItem onClick={handleBlock} style={{ color: selectedUser?.isActive !== false ? '#f59e0b' : '#10b981' }}>
        <MdBlock className="me-2" size={18} /> {selectedUser?.isActive !== false ? 'Block User' : 'Unblock User'}
      </MenuItem>
      <MenuItem onClick={handleDelete} style={{ color: '#dc2626' }}>
        <MdDelete className="me-2" size={18} /> Delete User
      </MenuItem>
    </Menu>
  );
};
