import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../common/hooks/useAuth';
import { userApi } from './../api/user.api';
import type { User } from './../api/user.api';
import { toast } from './../../../common/utils/toast';
import { useNavigate } from 'react-router-dom';
import { MdLock, MdEdit, MdLogout, MdSchedule, MdDelete } from 'react-icons/md';
import { formatLastLogin } from '../../../utils/formatLastLogin';
import { shouldShowError, getErrorMessage } from '../../../utils/errorHandler';
// Import modals
import { EditPasswordModal } from '../Components/EditPasswordModal';
import { EditProfileModal } from '../Components/EditProfileModal';
import { ConfirmModal } from '../../../common/modals/ConfirmModal';

export const Profile: React.FC = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Button configuration
  const actionButtons = [
    {
      id: 'password',
      icon: MdLock,
      label: 'Change Password',
      onClick: () => setShowPasswordModal(true),
      variant: 'default'
    },
    {
      id: 'edit',
      icon: MdEdit,
      label: 'Edit Profile',
      onClick: () => setShowEditModal(true),
      variant: 'default'
    },
    {
      id: 'delete',
      icon: MdDelete,
      label: 'Delete Account',
      onClick: () => setShowDeleteModal(true),
      variant: 'danger'
    },
    {
      id: 'logout',
      icon: MdLogout,
      label: 'Logout',
      onClick: handleLogout,
      variant: 'default'
    }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Not authenticated');
      navigate('/login');
      return;
    }

    const userId = (authUser as User | null)?.id;

    if (!userId) {
      console.log('No user ID in Redux');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const profileData = await userApi.getProfile(userId);
        console.log('Profile data:', profileData);
        setUser(profileData);
      } catch (error: unknown) {
        console.error('Error:', error);
        // Only show error if not handled by interceptor
        if (shouldShowError(error)) {
          const message = getErrorMessage(error, 'Failed to load profile');
          toast.error(message);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, authUser, navigate]);

  function handleLogout() {
    navigate('/login');
  }

  const handleUpdateProfile = async (id: string, name: string, email: string) => {
    if (!id) {
      toast.error('User ID missing');
      return;
    }

    try {
      setUpdating(true);
      // Normalize email before sending to backend
      const normalizedEmail = email.toLowerCase().trim();
      const updated = await userApi.updateProfile(id, { name, email: normalizedEmail });
      setUser(updated);
      setShowEditModal(false);
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      // Only show error if not handled by interceptor
      if (shouldShowError(error)) {
        const message = getErrorMessage(error, 'Failed to update profile');
        toast.error(message);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    try {
      setUpdating(true);
      await userApi.changePassword(oldPassword, newPassword);
      setShowPasswordModal(false);
      toast.success('Password changed successfully');
    } catch (error: unknown) {
      // Only show error if not handled by interceptor
      if (shouldShowError(error)) {
        const message = getErrorMessage(error, 'Failed to change password');
        toast.error(message);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    const userId = user?.id;

    console.log('🗑️ DELETE START: user.id:', user?.id);

    if (!userId) {
      toast.error('Error: User ID not found');
      return;
    }

    try {
      setUpdating(true);
      console.log('DELETE: Calling API with userId:', userId);

      await userApi.deleteUser(userId);
      toast.success('Account deleted successfully');
      console.log('🗑️ DELETE: Navigating to login...');

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: unknown) {
      // Only show error if not handled by interceptor
      if (shouldShowError(error)) {
        const message = getErrorMessage(error, 'Failed to delete account');
        toast.error(message);
      }
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return <div className="text-center py-12 text-gray-600"></div>;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const isDanger = (variant: string) => variant === 'danger';

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 md:py-8">
        
        {/* Profile Header */}
        <div className="mb-10 md:mb-12">
          <div className="flex flex-col items-center gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                {initials}
              </span>
            </div>

            {/* User Info */}
            <div className="text-center">
              <h1 className="text-lg sm:text-2xl md:text-2xl font-bold text-gray-900 break-words">
                {user.name}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 break-all">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Last Login Card */}
        <div className="mx-auto mb-10 md:mb-12 max-w-sm">
          <div className="flex items-center gap-3 sm:gap-4 bg-white px-4 py-3 sm:py-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center bg-gray-100 rounded-lg w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0">
              <MdSchedule className="text-gray-700 text-lg sm:text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base text-gray-900 font-medium">Last Login</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 flex-shrink-0 whitespace-nowrap">
           {user?.lastLogin ? formatLastLogin(user.lastLogin) : 'Never logged in'}
            </p>
          </div>
        </div>

        {/* Actions & Settings */}
        <div className="mx-auto max-w-sm">
          <h2 className="text-base sm:text-lg md:text-lg font-bold text-gray-900 mb-4">
            Actions & Settings
          </h2>

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3">
            {actionButtons.map((action) => {
              const Icon = action.icon;
              const isBtnDanger = isDanger(action.variant);

              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className={`flex items-center gap-3 sm:gap-4 w-full px-4 py-3 sm:py-4 rounded-lg border transition-all active:scale-95
                    ${
                      isBtnDanger
                        ? 'bg-white border-red-200 hover:shadow-md hover:border-red-300 active:bg-red-50'
                        : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300 active:bg-gray-50'
                    }
                  `}
                >
                  {/* Icon Container */}
                  <div
                    className={`flex items-center justify-center rounded-lg flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11
                      ${isBtnDanger ? 'bg-red-100' : 'bg-gray-100'}
                    `}
                  >
                    <Icon
                      className={`text-lg sm:text-xl ${
                        isBtnDanger ? 'text-red-600' : 'text-gray-700'
                      }`}
                    />
                  </div>

                  {/* Button Label */}
                  <p
                    className={`text-sm sm:text-base font-medium flex-1 text-left
                      ${isBtnDanger ? 'text-red-600' : 'text-gray-900'}
                    `}
                  >
                    {action.label}
                  </p>

                  {/* Arrow Icon */}
                  <span className="text-gray-600 text-lg flex-shrink-0">›</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onSave={(id, name, email) => handleUpdateProfile(id, name, email)}
        isLoading={updating}
      />

      <EditPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        user={user}
        onSave={(_, oldPassword, newPassword) => handleChangePassword(oldPassword, newPassword)}
        isLoading={updating}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Delete Account"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={updating}
      />
    </div>
  );
};
