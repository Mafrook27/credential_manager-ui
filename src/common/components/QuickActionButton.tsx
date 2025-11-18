import React from 'react';

interface QuickActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: number | string;
  subtitle?: string;
  disabled?: boolean;
  iconBgColor?: string;
  iconColor?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  label,
  icon,
  onClick,
  badge,
  subtitle,
  disabled = false,
  iconBgColor = '#eef2ff',  // ✅ CHANGED: Added default value
  iconColor = '#5468ff'      // ✅ CHANGED: Added default value
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      // ✅ CHANGED: Removed 'bg-white' class to fix hover issue
      className="w-100 d-flex align-items-center justify-content-between p-3 border rounded"
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 150ms ease',
        minHeight: '72px',
        opacity: disabled ? 0.6 : 1,
        backgroundColor: '#ffffff',  // ✅ CHANGED: Set background color in style instead
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#f8f9fb';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div className="d-flex align-items-center flex-grow-1 overflow-hidden">
        <div 
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: iconBgColor,  // ✅ CHANGED: Now uses prop value
            marginRight: '12px',
          }}
        >
          <span style={{ fontSize: '1.25rem', color: iconColor }}>  {/* ✅ CHANGED: Now uses prop value */}
            {icon}
          </span>
        </div>
        <div className="text-start overflow-hidden">
          <p 
            className="mb-0 fw-semibold text-truncate" 
            style={{ 
              fontSize: '0.875rem', 
              color: '#1e293b',
              lineHeight: '1.2'
            }}
          >
            {label}
          </p>
          {subtitle && (
            <p 
              className="mb-0 text-muted text-truncate" 
              style={{ 
                fontSize: '0.75rem',
                marginTop: '2px'
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {badge !== undefined && badge !== 0 && (
        <span 
          className="badge flex-shrink-0 ms-2"
          style={{
            backgroundColor: '#d1fae5',
            color: '#16a34a',
            fontSize: '0.75rem',
            padding: '4px 10px',
            fontWeight: '600'
          }}
        >
          {badge} New
        </span>
      )}
    </button>
  );
};
