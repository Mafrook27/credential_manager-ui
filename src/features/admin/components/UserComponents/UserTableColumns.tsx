// src/features/users/components/UserTableColumns.tsx

import React from 'react';
import {type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { MdCheck, MdMoreVert } from 'react-icons/md';
import { UserAvatar } from './UserAvatar';
import { type User, type UserRole, type UserStatus } from '../../types/user.types';
import { STATUS_CONFIG, ROLE_CONFIG } from '../../constants/user.constants';

/**
 * Get column definitions for User Management table
 */
export const getUserTableColumns = (
  onApprove: (userId: string) => void,
  onMenuClick: (event: React.MouseEvent<HTMLElement>, user: User) => void
): GridColDef[] => [
  {
    field: 'name',
    headerName: 'Name',
    flex: 1.5,
    minWidth: 220,
    filterable: true,
    sortable: true,
    renderCell: (params: GridRenderCellParams) => (
      <div className="d-flex align-items-center gap-2 w-100" style={{ padding: '8px 0' }}>
        <UserAvatar name={params.row.name} />
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.875rem', lineHeight: '1.25' }}>
            {params.row.name}
          </div>
          <div className="text-muted text-truncate" style={{ fontSize: '0.75rem', lineHeight: '1.25' }}>
            {params.row.email}
          </div>
        </div>
      </div>
    ),
  },
  {
    field: 'role',
    headerName: 'Role',
    flex: 0.8,
    minWidth: 120,
    align: 'center',
    headerAlign: 'center',
    filterable: true,
    sortable: true,
    type: 'singleSelect',
    valueOptions: ['admin', 'user'],
    renderCell: (params: GridRenderCellParams) => {
      const config = ROLE_CONFIG[params.row.role as UserRole]??{
        bg: '#e5e7eb',
        text: '#6b7280',
        label: 'Unknown',
      }
      return (
        <span
          className="badge"
          style={{
            backgroundColor: config.bg,
            color: config.text,
            fontSize: '0.75rem',
            padding: '4px 12px',
            fontWeight: '600',
            textTransform: 'capitalize',
          }}
        >
          {params.row.role}
        </span>
      );
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.8,
    minWidth: 120,
    align: 'center',
    headerAlign: 'center',
    filterable: true,
    sortable: true,
    type: 'singleSelect',
    valueOptions: ['active', 'pending', 'inactive'],
    renderCell: (params: GridRenderCellParams) => {
      const config = STATUS_CONFIG[params.row.status as UserStatus]?? {
        bg: '#e5e7eb', // gray-200
        text: '#6b7280', // gray-500
        label: 'Unknown',
      };

      return (
        <span
          className="badge d-flex align-items-center gap-1"
          style={{
            backgroundColor: config.bg,
            color: config.text,
            fontSize: '0.75rem',
            padding: '4px 10px',
            fontWeight: '600',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: config.text }} />
          {config.label}
        </span>
      );
    },
  },
  {
    field: 'actions',
    headerName: 'Actions',
    flex: 0.8,
    minWidth: 140,
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    filterable: false,
    renderCell: (params: GridRenderCellParams) => (
      <div className="d-flex align-items-center justify-content-center gap-2">
        {params.row.status === 'pending' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApprove(params.row.id);
            }}
            className="btn btn-sm btn-success d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px', padding: 0 }}
            title="Approve"
          >
            <MdCheck size={18} />
          </button>
        )}
        <IconButton
          size="small"
          onClick={(e) => onMenuClick(e, params.row)}
          style={{ width: '32px', height: '32px' }}
        >
          <MdMoreVert size={18} />
        </IconButton>
      </div>
    ),
  },
];
