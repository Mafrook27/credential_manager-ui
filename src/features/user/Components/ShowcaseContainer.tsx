import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowForward, MdLock } from 'react-icons/md';
import { getInitials } from '../../../common/utils/activityHelpers';

interface Credential {
  _id: string;
  serviceName?: string;
  subInstanceName?: string;
  username?: string;
  type?: string;
  rootInstance?: {
    serviceName: string;
    type: string;
  };
  subInstance?: {
    name: string;
  };
  credentialData?: {
    fields?: Array<{ key: string; value: string }>;
    username?: string;
    password?: string;
  };
  fields?: Array<{ key: string; value: string }>;
  isOwner: boolean;
  createdBy?: {
    name: string;
  };
}

interface ShowcaseContainerProps {
  credentials: Credential[];
  loading?: boolean;
}

export const ShowcaseContainer: React.FC<ShowcaseContainerProps> = ({
  credentials,
  loading = false,
}) => {
  const navigate = useNavigate();

  // Show only first 4 credentials
  const displayedCredentials = credentials.slice(0, 4);

  // Skeleton Loading State
  if (loading) {
    return (
      <div className="bg-white rounded-3 border shadow-sm" style={{ padding: '1.5rem' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div 
            className="rounded"
            style={{
              height: '24px',
              width: '180px',
              backgroundColor: '#f1f5f9',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
        </div>
        
        {/* Responsive Grid for Skeleton */}
        <div className="row g-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-6 col-xl-3">
              <div 
                className="rounded-3 border position-relative overflow-hidden"
                style={{ 
                  padding: '1.25rem',
                  minHeight: '180px',
                  backgroundColor: '#fafafa'
                }}
              >
                {/* Shimmer effect */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                    animation: 'shimmer 2s infinite',
                  }}
                />
                
                {/* Avatar placeholder */}
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div 
                    className="rounded-circle"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#e2e8f0',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}
                  />
                  <div className="flex-grow-1">
                    <div 
                      className="rounded mb-2"
                      style={{
                        height: '14px',
                        width: '70%',
                        backgroundColor: '#e2e8f0',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}
                    />
                    <div 
                      className="rounded"
                      style={{
                        height: '12px',
                        width: '50%',
                        backgroundColor: '#f1f5f9',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}
                    />
                  </div>
                </div>
                
                {/* Username placeholder */}
                <div 
                  className="rounded"
                  style={{
                    height: '12px',
                    width: '60%',
                    backgroundColor: '#e2e8f0',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        
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

  // Empty State
  if (credentials.length === 0) {
    return (
      <div className="bg-white rounded-3 border shadow-sm" style={{ padding: '1.5rem' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fs-5 fw-bold mb-0">Credentials</h3>
        </div>
        <div className="text-center py-5">
          <div 
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#f1f5f9',
            }}
          >
            <MdLock size={32} color="#94a3b8" />
          </div>
          <p className="text-muted mb-3">No credentials found. Create your first credential to get started!</p>
          <button
            onClick={() => navigate('/credentials')}
            className="btn btn-primary"
          >
            Go to Credentials
          </button>
        </div>
      </div>
    );
  }

  // Credentials Display
  return (
    <div className="bg-white rounded-3 border shadow-sm" style={{ padding: '1.5rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fs-5 fw-bold mb-0">Featured Credentials</h3>
        
        {/* Show "View All" link - always visible, redirects to credentials page */}
        <button
          onClick={() => navigate('/credentials')}
          className="btn btn-link text-decoration-none d-flex align-items-center gap-2 p-0"
          style={{ color: '#2563eb', fontSize: '0.95rem' }}
        >
          <span className="d-none d-sm-inline">View All</span>
          <span className="d-inline d-sm-none">All</span>
          <MdArrowForward size={18} />
        </button>
      </div>

      {/* Responsive Grid */}
      <div className="row g-3">
        {displayedCredentials.map((credential) => {
          // Extract data properly from API response
          const credData = credential.credentialData || credential;
          
          const serviceName = credential.rootInstance?.serviceName || credential.serviceName || 'Unknown';
          const subInstanceName = credential.subInstance?.name || credential.subInstanceName || '';
          const type = credential.rootInstance?.type || credential.type || 'other';
          const initials = getInitials(serviceName);
          
          // Get fields array
          const fields: Array<{ key: string; value: string }> = 
            (credData.fields && Array.isArray(credData.fields)) ? credData.fields :
            (credential.fields && Array.isArray(credential.fields)) ? credential.fields :
            [];
          
          // Show first 2 fields only
          const displayFields = fields.slice(0, 2);
          
          return (
            <div key={credential._id} className="col-12 col-sm-6 col-lg-6 col-xl-3">
              <div 
                className="rounded-3 border position-relative d-flex flex-column"
                style={{ 
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: credential.isOwner ? '#ffffff' : '#f8fafc',
                  height: '200px',
                }}
                onClick={() => navigate('/credentials')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Header with Avatar */}
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: type === 'database' ? '#dbeafe' : 
                                     type === 'api' ? '#fef3c7' : 
                                     type === 'server' ? '#dcfce7' : '#f3e8ff',
                      color: type === 'database' ? '#1e40af' : 
                             type === 'api' ? '#92400e' : 
                             type === 'server' ? '#166534' : '#6b21a8',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  >
                    {initials}
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <h6 className="mb-1 fw-semibold text-truncate" style={{ fontSize: '0.95rem' }}>
                      {serviceName}
                    </h6>
                    {subInstanceName && (
                      <p className="mb-0 text-muted text-truncate" style={{ fontSize: '0.8rem' }}>
                        {subInstanceName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dynamic Fields - Fixed height container */}
                <div className="flex-grow-1" style={{ minHeight: '60px' }}>
                  {displayFields.map((field, index) => (
                    <div key={index} className="mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted text-capitalize" style={{ fontSize: '0.75rem' }}>{field.key}:</span>
                        <span className="text-truncate fw-medium" style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                          ••••••••••••••••
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Owner Badge - Fixed at bottom */}
                <div className="mt-auto" style={{ height: '32px', display: 'flex', alignItems: 'flex-end' }}>
                  {!credential.isOwner && (
                    <span 
                      className="badge d-inline-flex align-items-center gap-1"
                      style={{
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.35rem 0.65rem',
                        border: '1px solid #93c5fd'
                      }}
                    >
                      <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6 6c0-2.21-2.686-4-6-4s-6 1.79-6 4v1h12v-1z"/>
                      </svg>
                      Shared with you
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
