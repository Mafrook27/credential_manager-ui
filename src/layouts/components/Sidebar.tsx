import React from 'react';
import { MdDashboard, MdVpnKey, MdPerson, MdAdminPanelSettings, MdClose } from 'react-icons/md';
import { FaUsers, FaKey, FaLock, FaHistory } from 'react-icons/fa';
import { useAuth } from '../../common/hooks/useAuth';

interface SidebarProps {
  isExpanded: boolean;
  activePath: string;
  onNavigate: (path: string) => void;
  onClose: () => void;
}

interface NavItemType {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, activePath, onNavigate, onClose }) => {
  const { isAdmin } = useAuth();

  // User Panel Menu
  const userMenuItems: NavItemType[] = [
    { icon: MdDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: MdVpnKey, label: 'Credentials', path: '/credentials' },
    { icon: MdPerson, label: 'Profile', path: '/profile' },
  ];

  // Admin Panel Menu
  const adminMenuItems: NavItemType[] = [
    { icon: MdAdminPanelSettings, label: 'Admin Dashboard', path: '/admin/dashboard' },
    { icon: FaUsers, label: 'User Management', path: '/admin/users' },
    { icon: FaKey, label: 'All Credentials', path: '/admin/credentials' },
    { icon: FaLock, label: 'Access Control', path: '/admin/access-control' },
    { icon: FaHistory, label: 'Audit Logs', path: '/admin/audit-logs' },
  ];

  const navItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <aside className={`h-full bg-white flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-[72px]'}`}>
      {/* Header */}
      <div className={`flex items-center h-16 px-4 shrink-0 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
        {/* {isExpanded && (
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <MdAdminPanelSettings className="w-6 h-6 text-red-500 shrink-0" />
            <span className="font-bold text-lg text-gray-800 truncate">
              {isAdmin ? 'Admin Panel' : 'User Panel'}
            </span>
          </div>
        )} */}
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 md:hidden shrink-0"
          aria-label="Close sidebar"
        >
          <MdClose className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-4">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            isExpanded={isExpanded}
            isActive={activePath === item.path}
            onClick={() => onNavigate(item.path)}
          />
        ))}
      </nav>
    </aside>
  );
};

interface NavItemProps {
  item: NavItemType;
  isExpanded: boolean;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, isExpanded, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center h-10 px-3 gap-3 transition-colors duration-200 rounded-md ${
        isActive 
          ? 'bg-blue-50 text-blue-600 font-semibold' 
          : 'text-gray-700 hover:bg-gray-100'
      } ${
        !isExpanded && 'justify-center'
      }`}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
    >
      <item.icon className="w-5 h-5 shrink-0" />
      {isExpanded && (
        <span className="text-sm truncate flex-1 text-left">
          {item.label}
        </span>
      )}
    </button>
  );
};

export default Sidebar;
