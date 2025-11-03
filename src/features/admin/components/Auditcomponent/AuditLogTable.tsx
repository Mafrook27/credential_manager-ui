// src/features/audit/components/AuditLogTable.tsx

import React from 'react';
import type { GridPaginationModel } from '@mui/x-data-grid';
import { DataTable } from '../../../../common/components/DataTable';
import { getAuditTableColumns } from './AuditTableColumns';
import type { AuditLog } from '../../types/audit.types';

interface AuditLogTableProps {
  logs: AuditLog[];
  loading?: boolean;
  rowCount?: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ 
  logs, 
  loading = false,
  rowCount = 0,
  paginationModel,
  onPaginationModelChange,
}) => {
  const columns = getAuditTableColumns();

  return (
    <DataTable
      rows={logs}
      columns={columns}
      loading={loading}
      rowHeight={72}
      showPagination={true}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      pageSizeOptions={[10, 20, 50, 100]}
      disableColumnMenu={false}
      disableColumnReorder={true}
      rowCount={rowCount}
      paginationMode="server"
      getRowId={(row) => row._id}
    />
  );
};
