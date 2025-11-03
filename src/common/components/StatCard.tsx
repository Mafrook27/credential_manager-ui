import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  iconColor?: string;
  onClick?: () => void;
  valueFontSize?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor = '#6c757d',
  onClick,
  valueFontSize = '1.5rem'
}) => {
  return (
    <div 
      className={`card shadow-sm h-100 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        minHeight: '95px',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }
      }}
    >
      <div className="card-body p-3 d-flex justify-content-between align-items-center h-100">
        <div className="flex-grow-1 d-flex flex-column justify-content-center">
          <p className="text-muted mb-1 fw-medium" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
            {title}
          </p>
          <h4 className="mb-0 fw-bold" style={{ fontSize: valueFontSize, lineHeight: '1' }}>
            {value}
          </h4>
        </div>
        {icon && (
          <div 
            className="d-flex align-items-center justify-content-center"
            style={{ 
              color: iconColor, 
              fontSize: '1.5rem',
              opacity: 0.8,
              minWidth: '32px'
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
