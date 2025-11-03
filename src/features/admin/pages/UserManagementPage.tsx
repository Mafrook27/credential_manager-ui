// src/features/users/pages/UserManagementPage.tsx

import React, { useState } from 'react';
import { UserManagementTable } from '../components/UserComponents/UserManagementTable';
import { AddUserModal } from '../components/modals/addUserModel';
import { MdAdd } from 'react-icons/md';

/**
 * User Management Page
 */
export const UserManagementPage: React.FC = () => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="container-fluid p-4 mt-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 mx-3 gap-4">
        <div>
          <h1 className="h3 fw-bold">User Management</h1>
          <p className="text-muted">Manage users, roles, and permissions</p>
        </div>
        <button 
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
        >
          <MdAdd className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-white rounded border mt-2 mx-3" style={{ padding: '1rem' }}>
        <UserManagementTable key={refreshKey} />
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSuccess={() => {
          setShowAddUserModal(false);
          setRefreshKey(prev => prev + 1); // Refresh the table
        }}
      />
    </div>
  );
};
