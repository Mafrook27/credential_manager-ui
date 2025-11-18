import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from '../common/components/ProtectedRoute';
import { MdMenu, MdLogout, MdAdminPanelSettings } from 'react-icons/md';
import { IoShieldCheckmark } from 'react-icons/io5';
import { useAuth } from '../common/hooks/useAuth';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/redux/actions';

const DashboardLayout: React.FC = () => {
  const { userInitials, isAdmin } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Responsive layout state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Start collapsed
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
      // Reset hover expansion when hamburger is clicked
      setIsHoverExpanded(false);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
      // Reset hover expansion when toggling collapsed state
      setIsHoverExpanded(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      // Close sidebar and reset expansion on mobile
      setIsSidebarOpen(false);
      setIsHoverExpanded(false);
    } else {
      // On desktop: collapse sidebar and reset hover expansion after navigation
      setIsSidebarCollapsed(true);
      setIsHoverExpanded(false);
    }
  };

  const handleSidebarMouseEnter = () => {
    if (!isMobile && isSidebarCollapsed) {
      setIsHoverExpanded(true);
    }
  };

  const handleSidebarMouseLeave = () => {
    if (!isMobile) {
      setIsHoverExpanded(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout() as any);
      // The logout action will handle the redirect
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      navigate('/login', { replace: true });
    }
  };

  const sidebarComponent = (
    <div
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
 
    >
      <Sidebar
        isExpanded={isMobile ? true : (isSidebarCollapsed ? isHoverExpanded : true)}
        activePath={location.pathname}
        onNavigate={handleNavigate}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );

  return (
    <ProtectedRoute requireVerification={true}>
      <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 shadow-sm">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleToggleSidebar} 
              className="p-2 -ml-2 rounded-full hover:bg-gray-100" 
              aria-label="Toggle sidebar"
            >
              <MdMenu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <MdAdminPanelSettings className="w-6 h-6 text-red-500" />
              ) : (
                <IoShieldCheckmark className="w-6 h-6 text-blue-600" />
              )}
              <span className="font-bold text-lg text-gray-800 hidden sm:block">
                SparkLMS
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-100" 
              aria-label="Logout"
            >
              <MdLogout className="w-6 h-6 text-gray-600" />
            </button>
            <button className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {userInitials}
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <div className="z-10 h-full shrink-0 bg-white shadow-sm">
              {sidebarComponent}
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-2 sm:p-4 md:p-6">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay - Outside main flex container */}
        {isMobile && (
          <>
            <div 
              className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              {sidebarComponent}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
