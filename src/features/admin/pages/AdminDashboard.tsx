import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdPeople, MdVpnKey, MdPersonAdd,
  MdPendingActions, MdAdd, MdDescription, MdBarChart, MdKey
} from "react-icons/md";
import { StatCard } from "../../../common/components/StatCard";
import { QuickActionButton } from "../../../common/components/QuickActionButton";
import { toast } from "../../../common/utils/toast";
import { adminApi } from "../api/adminApi";
import { AuditLogTable } from "../components/Auditcomponent/AuditLogTable";
import { getAllAuditLogs } from "../api/credentialApi";
import type { AuditLog } from "../types/audit.types";
import type { GridPaginationModel } from '@mui/x-data-grid';
import { AddUserModal } from "../components/modals/addUserModel";
import { InstanceManagementModal } from "../components/modals/InstanceModel";
import { ActionCard } from "../../../common/components/ActionCard";
import type { User } from "../types/user.types";
import { AxiosError } from 'axios';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // ✅ SEPARATE LOADING STATES
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showInstanceModal, setShowInstanceModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string>('');

  // ======================
  //   FETCH STATS (Only once on mount)
  // ======================
  const getStats = async () => {
    setStatsLoading(true);
    setStatsError(false);
    try {
      const res = await adminApi.getStats();
      setStats(res);
    } catch (err) {
      // console.error("Failed to load stats:", err);
      setStatsError(true);
      toast.error("Failed to load dashboard stats");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  // ======================
  //   FETCH PENDING USERS
  // ======================
  const fetchPendingUsers = async () => {
    try {
      setApprovalLoading(true);
      setSearchError('');
      const response = await adminApi.getAllUsers(1, 100);
      const unverifiedUsers = response.data.users
        .filter((user: any) => !user.isVerified)
        .map((user: any) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: 'pending' as const,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        }));
      setPendingUsers(unverifiedUsers);
      setSearchResults(unverifiedUsers);
    } catch (err) {
      // console.error('Failed to load pending users:', err);
      setSearchError('Failed to load pending users. Please try again.');
    } finally {
      setApprovalLoading(false);
    }
  };

  // ======================
  //   SEARCH USERS
  // ======================
  const handleUserSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(pendingUsers);
      setSearchError('');
      return;
    }

    try {
      setSearchError('');
      const response = await adminApi.getUsersList();
      const filtered = response.data.users
        .filter((user: any) => 
          !user.isVerified && 
          (user.name.toLowerCase().includes(query.toLowerCase()) || 
           user.email.toLowerCase().includes(query.toLowerCase()))
        )
        .map((user: any) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: 'pending' as const,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        }));
      setSearchResults(filtered);
      if (filtered.length === 0) {
        setSearchError('No users found matching your search.');
      }
    } catch (err: any) {
      // console.error('Failed to search users:', err);
      setSearchError('Failed to search users. Please try again.');
    }
  };

  // ======================
  //   APPROVE USER
  // ======================
  const handleApproveUser = async (userId: string) => {
    try {
      setApprovingUserId(userId);
      setSearchError('');
      const response = await adminApi.approveUser(userId);
      toast.success(response.message || 'User approved successfully');
      
      // Remove from pending list
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      setSearchResults(prev => prev.filter(u => u.id !== userId));
      
      // Refresh stats
      await getStats();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      // console.error('Failed to approve user:', error);
      setSearchError(error?.response?.data?.message || 'Failed to approve user. Please try again.');
    } finally {
      setApprovingUserId(null);
    }
  };

  // ======================
  //   REJECT USER (Optional)
  // ======================
  const handleRejectUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to reject this user? This will delete their account.')) {
      return;
    }
    
    try {
      setApprovingUserId(userId);
      setSearchError('');
      await adminApi.deleteUser(userId);
      toast.success('User rejected and deleted successfully');
      
      // Remove from pending list
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      setSearchResults(prev => prev.filter(u => u.id !== userId));
      
      // Refresh stats
      await getStats();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      // console.error('Failed to reject user:', error);
      setSearchError(error?.response?.data?.message || 'Failed to reject user. Please try again.');
    } finally {
      setApprovingUserId(null);
    }
  };

  // ======================
  //   OPEN APPROVAL MODAL
  // ======================
  const handleOpenApprovalModal = () => {
    setShowApprovalModal(true);
    fetchPendingUsers();
  };

  // ======================
  //   FETCH AUDIT LOGS
  // ======================
  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const response = await getAllAuditLogs({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      });

      const logsWithServiceType = response.data.auditLogs.map((log: any) => ({
        ...log,
        id: log._id,
        serviceName: log.serviceName || 'Unknown',
        serviceType: log.credential?.rootInstance?.type || 'other',
      }));

      setAuditLogs(logsWithServiceType);
      setRowCount(response.pagination.total);
    } catch (error: any) {
      // console.error('Failed to fetch audit logs:', error);
      toast.error(error.response?.data?.message || 'Failed to load audit logs');
      setAuditLogs([]);
      setRowCount(0);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [paginationModel.page, paginationModel.pageSize]);

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  // ======================
  //   RENDER STATS SECTION
  // ======================
  const renderStats = () => {
   
    if (statsLoading && !stats) {
      return (
        <div className="row g-3 px-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div 
                className="bg-white rounded-3 shadow-sm border position-relative overflow-hidden"
                style={{ padding: '1.25rem', minHeight: '120px' }}
              >
                {/* Shimmer effect */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                    animation: 'shimmer 2s infinite',
                  }}
                />
                
                {/* Icon placeholder */}
                <div 
                  className="rounded-circle mb-3"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#f1f5f9',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}
                />
                
                {/* Title placeholder */}
                <div 
                  className="rounded mb-2"
                  style={{
                    height: '12px',
                    width: '70%',
                    backgroundColor: '#f1f5f9',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}
                />
                
                {/* Value placeholder */}
                <div 
                  className="rounded"
                  style={{
                    height: '20px',
                    width: '40%',
                    backgroundColor: '#e2e8f0',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}
                />
              </div>
            </div>
          ))}
          
          <style>{`
            @keyframes shimmer {
              0% { left: -100%; }
              100% { left: 100%; }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </div>
      );
    }

    // Error state
    if (statsError) {
      return (
        <div className="row g-3 px-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div 
                className="bg-white rounded-3 shadow-sm border d-flex flex-column align-items-center justify-content-center"
                style={{ padding: '2rem', minHeight: '120px' }}
              >
                {/* Error icon */}
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#fef2f2',
                    border: '2px solid #fee2e2'
                  }}
                >
                  <svg width="24" height="24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <p className="text-muted text-center mb-0 small">
                  Failed to load
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    //  No data state
    if (!stats) {
      return (
        <div className="alert alert-info mx-3">
          No dashboard statistics available
        </div>
      );
    }


    const cards = [
      { title: "Total Users", value: stats.totalUsers, icon: <MdPeople />, color: "#2563eb" },
      { title: "Credentials Stored", value: stats.totalCredentials, icon: <MdVpnKey />, color: "#16a34a" },
      { title: "Active Users", value: stats.activeUsers, icon: <MdPersonAdd />, color: "#ea580c" },
      { title: "Unverified Users", value: stats.unverifiedUsers, icon: <MdPendingActions />, color: "#dc2626" },
    ];

    return (
      <div className="row g-3 px-3">
        {cards.map((card, i) => (
          <div key={i} className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <StatCard 
              title={card.title} 
              value={card.value ?? 0} 
              icon={card.icon} 
              iconColor={card.color} 
            />
          </div>
        ))}
      </div>
    );
  };

  // ======================
  //   MAIN RENDER
  // ======================
  return (
    <div className="container-fluid p-3 mt-3">
      <h2 className="fs-4 mb-3 fw-bold px-3">Admin Dashboard</h2>

      {/* Stats Section */}
      {renderStats()}

      {/* Quick Actions */}
      <div className="bg-white rounded border mt-4 mx-3 p-4">
        <div className="pb-3 border-bottom mb-2">
          <h5 className="fw-bold mb-0" style={{ fontSize: "1.125rem" }}>
            Quick Actions
          </h5>
        </div>
        <div className="row g-3 mt-2">
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <QuickActionButton label="Add New User" icon={<MdAdd />} onClick={() => setShowAddUserModal(true)} iconBgColor="#dbeafe" iconColor="#2563eb" />
          </div>
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <QuickActionButton label="Instances management" icon={<MdDescription />} onClick={() => setShowInstanceModal(true)} subtitle="Manage services & folders" iconBgColor="#eef2ff" iconColor="#5468ff" />
          </div>
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <QuickActionButton 
              label="Verify users" 
              icon={<MdBarChart />} 
              onClick={handleOpenApprovalModal} 
              badge={stats?.unverifiedUsers || 0} 
              iconBgColor="#d1fae5" 
              iconColor="#16a34a" 
            />
          </div>
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <QuickActionButton label="View all credentials" icon={<MdKey />} onClick={() => navigate("/admin/credentials")} iconBgColor="#f3f4f6" iconColor="#6b7280" />
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded border mt-4 mx-3 p-4">
        <div className="pb-3 border-bottom mb-3">
          <h5 className="fw-bold mb-0" style={{ fontSize: "1.125rem" }}>
            Audit Logs
          </h5>
          <p className="text-muted mb-0 small">Track all credential access and modifications</p>
        </div>
        <AuditLogTable 
          logs={auditLogs} 
          loading={auditLoading}
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
        />
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSuccess={() => {
          setShowAddUserModal(false);
          getStats(); // Refresh stats after user creation
        }}
      />

      {/* Instance Management Modal */}
      <InstanceManagementModal
        isOpen={showInstanceModal}
        onClose={() => setShowInstanceModal(false)}
        onSuccess={() => {
          getStats(); // Refresh stats after instance changes
        }}
      />

      {/* User Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
          <ActionCard
            title="Approve Pending Users"
            mode="approve"
            users={searchResults.map(user => ({
              ...user,
              status: 'pending' as const
            }))}
            searchPlaceholder="Search users by name or email..."
            onSearch={handleUserSearch}
            onApprove={handleApproveUser}
            onReject={handleRejectUser}
            onClose={() => setShowApprovalModal(false)}
            emptyStateMessage="No pending users to approve"
            isLoading={approvalLoading}
            loadingUserId={approvingUserId || undefined}
            validationError={searchError}
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
