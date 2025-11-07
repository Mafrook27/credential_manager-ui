import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  MdDashboard, 
  MdVpnKey, 
  MdPerson,
  MdAdminPanelSettings,
  MdClose
} from 'react-icons/md';
import { 
  FaUsers, 
  FaKey, 
  FaLock, 
  FaHistory
} from 'react-icons/fa';
import { IoShieldCheckmark } from 'react-icons/io5';
import { useAuth } from '../../common/hooks/useAuth';
import styles from './Customcss/Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

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

  const currentMenuItems = isAdmin ? adminMenuItems : userMenuItems;

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
        },
      }}
    >
      <div className={`d-flex flex-column h-100 bg-white ${styles.sidebar}`}>
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          <div className="d-flex ms-3 align-items-left gap-2">
            {isAdmin ? (
              <>
                <MdAdminPanelSettings className="text-danger fs-4" />
                <span className="fw-bold text-dark">Admin Panel</span>
              </>
            ) : (
              <>
                <IoShieldCheckmark className="fs-4" style={{ color: theme.palette.primary.main }} />
                <span className="fw-bold text-dark">SparkLMS</span>
              </>
            )}
          </div>
          
          <button
            onClick={onClose}
            className={`btn btn-sm btn-light rounded-circle p-0 ${styles.closeButton}`}
          >
            <MdClose size={20} />
          </button>
        </div>

        <nav className={`p-3 ${styles.sidebarNav}`}>
          <ul className="list-unstyled mb-0">
            {currentMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <li key={item.path} className="mb-2">
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      btn w-100 d-flex justify-content-start gap-3 py-2 px-3 border-0 rounded
                      ${styles.menuItem}
                      ${isActive ? styles.menuItemActive : ''}
                    `}
                    style={isActive ? {
                      backgroundColor: theme.palette.primary.main,
                      color: 'white'
                    } : {}}
                  >
                    <Icon size={20} />
                    <span className="fw-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </Drawer>
  );
};

export default Sidebar;
