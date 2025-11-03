// src/layouts/components/Navbar.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { MdLogout, MdMenu, MdDashboard, MdVpnKey, MdPerson, MdAdminPanelSettings } from 'react-icons/md';
import { IoShieldCheckmark, IoSearch } from 'react-icons/io5';
import { FaKey, FaUsers, FaLock, FaHistory } from 'react-icons/fa';
import { useAuth } from '../../common/hooks/useAuth';
import { logout } from '../../features/auth/redux/actions';
import { useSelector, useDispatch } from 'react-redux';
import { selectSearchQuery } from '../../features/admin/redux/selectors';
import { setSearchQuery } from '../../features/admin/redux/actions';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { userInitials, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const searchQuery = useSelector(selectSearchQuery);
  
  const isAllCredentialsPage = location.pathname === '/admin/credentials';

  // User Panel Menu
  const userMenuItems = [
    { icon: MdDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: MdVpnKey, label: 'Credentials', path: '/credentials' },
    { icon: MdPerson, label: 'Profile', path: '/profile' },
  ];

  // Admin Panel Menu
  const adminMenuItems = [
    { icon: MdAdminPanelSettings, label: 'Admin Dashboard', path: '/admin/dashboard' },
    { icon: FaUsers, label: 'User Management', path: '/admin/users' },
    { icon: FaKey, label: 'All Credentials', path: '/admin/credentials' },
    { icon: FaLock, label: 'Access Control', path: '/admin/access-control' },
    { icon: FaHistory, label: 'Audit Logs', path: '/admin/audit-logs' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const handleSearchChange = (value: string) => {
    dispatch(setSearchQuery(value));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* LEFT SECTION - Sidebar Toggle + Logo + App Name */}
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <MdMenu className="text-gray-600" size={24} />
          </button>

          {/* Logo + App Name */}
          <div className="flex items-center gap-2">
            <IoShieldCheckmark className="text-3xl" style={{ color: theme.palette.primary.main }} />
            <span className="hidden sm:inline font-bold text-lg text-gray-900">
              CredentialVault
            </span>
          </div>
        </div>

        {/* CENTER SECTION - Menu Items + Search Bar (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-2 mx-4">
          {/* Menu Items */}
          <div className="flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap text-sm ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={item.label}
                >
                  <Icon className="text-base" />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar - Visible on desktop when on All Credentials page */}
          {isAllCredentialsPage && (
            <div className="flex flex-1 max-w-md ml-4">
              <div className="relative w-full">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search credentials..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white text-sm transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SECTION - Logout + Avatar */}
        <div className="flex items-center gap-3">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MdLogout className="text-gray-600" size={22} />
          </button>

          {/* User Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: theme.palette.primary.main }}
          >
            {userInitials}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
