// import React from 'react';
// import { useAuth } from '../common/hooks/useAuth';

// const DashboardLayout: React.FC = () => {
//   const { user, isAdmin, userName, userInitials } = useAuth();

//   // Debug output
//   console.log('🔍 Testing useAuth Hook:');
//   console.log('User:', user);
//   console.log('Is Admin:', isAdmin);
//   console.log('User Name:', userName);
//   console.log('User Initials:', userInitials);

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-4">Dashboard Layout Test</h1>
      
//       <div className="bg-white p-6 rounded-lg shadow">
//         <h2 className="text-xl font-semibold mb-4">User Info from useAuth Hook:</h2>
        
//         {user ? (
//           <div className="space-y-2">
//             <p><strong>Name:</strong> {userName}</p>
//             <p><strong>Email:</strong> {user.email}</p>
//             <p><strong>Role:</strong> {user.role}</p>
//             <p><strong>Is Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</p>
//             <p><strong>Initials:</strong> {userInitials}</p>
//             <p><strong>User ID:</strong> {user.id}</p>
//           </div>
//         ) : (
//           <p className="text-red-500">No user data found!</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;



import React, { useState } from 'react';
import Navbar from './components/NavBar';
import Sidebar from './components/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import ProtectedRoute from '../common/components/ProtectedRoute';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pagesWithSearch = ['/credentials', '/admin/credentials'];
  const showSearch = pagesWithSearch.includes(location.pathname);
  
  return (
    <ProtectedRoute requireVerification={true}>
      <div className="min-vh-100 bg-light">
        {/* Navbar */}
        <Navbar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          showSearch={showSearch}
        />

        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="pt-4 mt-4">
          <Outlet />  {/* Child routes will render here */}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;

