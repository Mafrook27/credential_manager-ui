import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdLogout, MdPerson } from 'react-icons/md';
import { useAuth } from '../../common/hooks/useAuth';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/redux/actions';

interface UserProfileCardProps {
  onClose: () => void;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ onClose }) => {
  const { user, userInitials} = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleProfileClick = () => {
    navigate('/profile');
    onClose();
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout() as any);
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Profile Card */}
      <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
        {/* User Info Section */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-white border-b border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate m-auto">{user?.name}</p>
              <p className="text-xs text-gray-600 truncate m-auto">{user?.email}</p>
            </div>
          </div>
          
       
        </div>

        {/* Actions Section */}
        <div className="p-2 space-y-3">
          {/* Profile Button */}
          <button
            onClick={handleProfileClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <MdPerson className="w-5 h-5 text-gray-500" />
            <span>Profile</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <MdLogout className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};
