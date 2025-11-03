// src/features/audit/components/AuditTableColumns.tsx


import {type GridColDef,type GridRenderCellParams } from '@mui/x-data-grid';
import { MdAdd, MdLock, MdShare, MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import { ACTION_CONFIG, SERVICE_CONFIG } from '../../constants/audit.constants';
import type { AuditAction, ServiceType } from '../../types/audit.types';

const getActionIcon = (action: string) => {
  const icons: any = {
    create: <MdAdd />,
    decrypt: <MdLock />,
    share: <MdShare />,
    view: <MdVisibility />,
    update: <MdEdit />,
    delete: <MdDelete />,
  };
  return icons[action] || <MdVisibility />;
};

export const getAuditTableColumns = (): GridColDef[] => [
  {
    field: 'user',
    headerName: 'User',
    flex: 1,
    minWidth: 180,
    filterable: true,
    sortable: true,
    valueGetter: (value: any) => value?.name || 'Unknown',
    renderCell: (params: GridRenderCellParams) => {
      const userName = params.row.user?.name || 'Unknown';
      return (
        <div className="d-flex align-items-center gap-2" style={{ padding: '8px 0' }}>
          <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              fontSize: '0.813rem',
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="fw-semibold" style={{ fontSize: '0.875rem', lineHeight: '1.25' }}>
            {userName}
          </span>
        </div>
      );
    },
  },
  {
    field: 'action',
    headerName: 'Action',
    flex: 0.8,
    minWidth: 140,
    filterable: true,
    sortable: true,
    renderCell: (params: GridRenderCellParams) => {
      const config = ACTION_CONFIG[params.row.action as AuditAction]??{
        color: '#3b82f6',
        icon: <MdVisibility />,
        
      }
      return (
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: '24px',
              height: '24px',
              color: config.color,
              backgroundColor: `${config.color}15`,
              fontSize: '0.813rem',
            }}
          >
            {getActionIcon(params.row.action)}
          </div>
          <span style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>
            {params.row.action}
          </span>
        </div>
      );
    },
  },
  {
    field: 'serviceName',
    headerName: 'Service',
    flex: 1.3,
    minWidth: 220,
    filterable: true,
    sortable: true,
    valueGetter: (value: any, row: any) => {
      // For filtering: combine serviceName and subInstanceName
      const serviceName = row.serviceName || 'Unknown';
      const subInstanceName = row.subInstanceName || row.credential?.subInstance?.name || 'N/A';
      return `${serviceName} ${subInstanceName}`;
    },
    renderCell: (params: GridRenderCellParams) => {
      const serviceName = params.row.serviceName || 'Unknown';
      // Use subInstanceName stored directly in audit log (for historical tracking even after deletion)
      const subInstanceName = params.row.subInstanceName || params.row.credential?.subInstance?.name || 'N/A';
      const serviceType = params.row.serviceType || 'other';
      
      const serviceConfig = SERVICE_CONFIG[serviceType as ServiceType] ?? {
        bg: '#e5e7eb',
        text: '#6b7280',
        label: serviceType,
      };
      
      return (
        <div className="d-flex flex-column" style={{ padding: '8px 0', gap: '6px' }}>
          <span className="fw-medium text-truncate" style={{ fontSize: '0.875rem', lineHeight: '1.25', color: '#111827' }}>
            {serviceName}
          </span>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <span
              className="badge"
              style={{
                backgroundColor: serviceConfig.bg,
                color: serviceConfig.text,
                fontSize: '0.7rem',
                padding: '2px 8px',
                fontWeight: '600',
              }}
            >
              {serviceConfig.label}
            </span>
            <span
              className="badge"
              style={{
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                fontSize: '0.7rem',
                padding: '2px 8px',
                fontWeight: '600',
              }}
            >
              {subInstanceName}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    field: 'timestamp',
    headerName: 'Timestamp',
    flex: 1,
    minWidth: 180,
    align: 'center',
    headerAlign: 'center',
    filterable: true,
    sortable: true,
    type: 'dateTime',
    valueGetter: (value) => new Date(value),
    renderCell: (params: GridRenderCellParams) => {
      const date = new Date(params.row.timestamp);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return (
        <span className="text-muted" style={{ fontSize: '0.813rem' }}>
          {formattedDate} {formattedTime}
        </span>
      );
    },
  },
  {
    field: 'ipAddress',
    headerName: 'IP Address',
    flex: 0.8,
    minWidth: 140,
    align: 'left',
    headerAlign: 'left',
    filterable: true,
    sortable: true,
    renderCell: (params: GridRenderCellParams) => (
      <code
        style={{
          fontSize: '0.75rem',
          backgroundColor: '#f3f4f6',
          color: '#374151',
          padding: '4px 8px',
          borderRadius: '4px',
          fontFamily: 'monospace',
        }}
      >
        {params.row.ipAddress}
      </code>
    ),
  },
];
