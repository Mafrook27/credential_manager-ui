import React, { useState, useEffect, useCallback } from 'react';
import { MdVpnKey, MdGroup, MdHistory, MdSchedule } from 'react-icons/md';
import { StatCard } from '../../../common/components/StatCard';
import { userApi } from '../api/user.api';
import { userCredentialApi } from '../api/user.credential.api';
import { toast } from '../../../common/utils/toast';
import { formatLastLogin } from '../../../utils/formatLastLogin';
import { useAuth } from '../../../common/hooks/useAuth';
import { ShowcaseContainer } from '../Components/ShowcaseContainer';
import { shouldShowError, getErrorMessage } from '../../../common/utils/errorHandler';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Stats state
  const [stats, setStats] = useState<{
    totalCredentials: number;
    sharedWithMe: number;
    recentActivities: number;
    lastLogin: string;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  // Credentials state
  const [credentials, setCredentials] = useState<any[]>([]);
  const [credentialsLoading, setCredentialsLoading] = useState(true);

  // Fetch user stats
  const fetchStats = useCallback(async () => {
    if (!user?.id) {
      console.log('User ID not available:', user);
      setStatsLoading(false);
      setStatsError(true);
      return;
    }
    
    console.log('Fetching stats for user:', user.id);
    setStatsLoading(true);
    setStatsError(false);
    try {
      const [statsResponse, profileResponse] = await Promise.all([
        userApi.getUserStats(user.id),
        userApi.getProfile(user.id),
      ]);

      console.log('✅ Stats response:', statsResponse);
      console.log('✅ Profile response:', profileResponse);
      console.log('✅ Stats data:', statsResponse.data);
      console.log('✅ Stats stats:', statsResponse.data?.stats);

      const newStats = {
        totalCredentials: statsResponse.data.stats.totalCredentials,
        sharedWithMe: statsResponse.data.stats.sharedWithMe,
        recentActivities: statsResponse.data.stats.recentActivities,
        lastLogin: profileResponse.lastLogin,
      };
      
      console.log('✅ Setting stats to:', newStats);
      setStats(newStats);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      console.error('Error details:', error.response?.data);
      setStatsError(true);
      if (shouldShowError(error)) {
        toast.error(getErrorMessage(error, 'Failed to load statistics'));
      }
    } finally {
      setStatsLoading(false);
    }
  }, [user?.id]);

  // Fetch user credentials
  const fetchCredentials = useCallback(async () => {
    setCredentialsLoading(true);
    try {
      const response = await userCredentialApi.getCredentials({ limit: 10 });
      setCredentials(response.data.credentials);
    } catch (error: any) {
      console.error('Failed to fetch credentials:', error);
      if (shouldShowError(error)) {
        toast.error(getErrorMessage(error, 'Failed to load credentials'));
      }
    } finally {
      setCredentialsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchCredentials();
  }, [fetchStats, fetchCredentials]);



  // Render stats section with skeleton loading
  const renderStats = () => {
    // Loading state with skeleton
    if (statsLoading && !stats) {
      return (
        <div className="row g-3 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-3">
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
        <div className="row g-3 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-3">
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

    // No data state
    if (!stats) {
      return (
        <div className="alert alert-info mb-4">
          No statistics available
        </div>
      );
    }

    // Success state with data
    const cards = [
      { title: "Total Credentials", value: stats.totalCredentials, icon: <MdVpnKey />, color: "#2563eb" },
      { title: "Shared With Me", value: stats.sharedWithMe, icon: <MdGroup />, color: "#16a34a" },
      { title: "Recent Activities", value: stats.recentActivities, icon: <MdHistory />, color: "#ea580c" },
      { title: "Last Login", value: formatLastLogin(stats.lastLogin), icon: <MdSchedule />, color: "#9333ea", valueFontSize: "1rem" },
    ];

    return (
      <div className="row g-3 px-3 mb-4">
        {cards.map((card, i) => (
          <div key={i} className="col-12 col-sm-6 col-lg-6 col-xl-3">
            <StatCard 
              title={card.title} 
              value={card.value ?? 0} 
              icon={card.icon} 
              iconColor={card.color}
              valueFontSize={card.valueFontSize}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container-fluid p-2 p-sm-3 mt-3">
      <h2 className="fs-4 mb-3 fw-bold px-2 px-sm-3">Welcome back, {user?.name}!</h2>

      {/* Stats Section */}
      {renderStats()}

      {/* Featured Credentials Showcase */}
      <div className="px-2 px-sm-3">
        <ShowcaseContainer
          credentials={credentials}
          loading={credentialsLoading}
        />
      </div>
    </div>
  );
};

export default UserDashboard;
