import React, { useState } from 'react';
import { 
  MdRefresh,
  MdDownload,
  MdHistory
} from 'react-icons/md';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import styles from './RecentActivityCard.module.css';
import { getDataGridStyles } from './RecentActivityCard.styles';
import { 
  formatOperation, 
  getOperationStyle, 
  getStatusBadge, 
  getTimeAgo, 
  getInitials 
} from '../utils/activityHelpers';
import { type Activity } from '../../features/admin/api/adminApi';

interface RecentActivityCardProps {
  activities: Activity[];
  loading?: boolean;
  onRefresh?: () => void;
  onDownload?: () => void;
  showFilters?: boolean;         
  showPagination?: boolean;
  onDateFilter?: (startDate: string, endDate: string) => void;
  // Server-side pagination props
  totalRecords?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  // Server-side sorting props
  onSortChange?: (field: string, order: 'asc' | 'desc') => void;
  // NEW: Username filter
  usernameFilter?: string;
  onUsernameFilterChange?: (username: string) => void;
  // NEW: Unified filters approach
  filters?: {
    startdate?: string;
    enddate?: string;
    username?: string;
    isslow?: string;
    iserror?: string;
  };
  onFiltersApply?: (filters: any) => Promise<void>;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  activities,
  loading = false,
  onRefresh,
  onDownload,
  showFilters = false,
  showPagination = false,
  onDateFilter,
  totalRecords = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  usernameFilter = '',
  onUsernameFilterChange,
  filters,
  onFiltersApply
}) => {
  const [startDate, setStartDate] = useState(filters?.startdate || '');
  const [endDate, setEndDate] = useState(filters?.enddate || '');
  const [localUsername, setLocalUsername] = useState(filters?.username || usernameFilter);
  const [localIsSlow, setLocalIsSlow] = useState(filters?.isslow || '');
  const [localIsError, setLocalIsError] = useState(filters?.iserror || '');
  const handleApplyFilter = async () => {
    // Use unified filter handler if available
    if (onFiltersApply) {
      await onFiltersApply({
        startdate: startDate,
        enddate: endDate,
        username: localUsername,
        isslow: localIsSlow,
        iserror: localIsError
      });
    } else {
      // Fallback to old individual handlers
      if (onDateFilter && startDate && endDate) {
        onDateFilter(startDate, endDate);
      }
      if (onUsernameFilterChange) {
        onUsernameFilterChange(localUsername);
      }
    }
  };

  const handleClearFilter = async () => {
    setStartDate('');
    setEndDate('');
    setLocalUsername('');
    setLocalIsSlow('');
    setLocalIsError('');
    
    // Use unified filter handler if available
    if (onFiltersApply) {
      await onFiltersApply({
        startdate: '',
        enddate: '',
        username: '',
        isslow: '',
        iserror: ''
      });
    } else {
      // Fallback to old individual handlers
      if (onDateFilter) {
        onDateFilter('', '');
      }
      if (onUsernameFilterChange) {
        onUsernameFilterChange('');
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1.5,
      minWidth: 250,
      filterable: false, // ✅ Disable MUI built-in filter
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <div className="d-flex align-items-center gap-2 w-100" style={{ padding: '8px 0' }}>
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              fontSize: '0.813rem'
            }}
          >
            {getInitials(params.row.userName)}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.875rem', lineHeight: '1.25' }}>
              {params.row.userName || 'Unknown User'}
            </div>
            <div className="text-muted text-truncate" style={{ fontSize: '0.75rem', lineHeight: '1.25' }}>
              {params.row.userEmail || 'No email'}
            </div>
          </div>
        </div>
      )
    },
    {
      field: 'operation',
      headerName: 'Operation',
      flex: 1,
      minWidth: 200,
      filterable: false, // ✅ Disable MUI built-in filter
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        const { icon, color } = getOperationStyle(params.row.operation);
        return (
          <div className="d-flex align-items-center gap-2">
            <div 
              className={`rounded-circle d-flex align-items-center justify-content-center text-${color} flex-shrink-0`}
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: `var(--bs-${color}-bg-subtle)`,
                fontSize: '0.75rem'
              }}
            >
              {icon}
            </div>
            <span style={{ fontSize: '0.875rem' }}>{formatOperation(params.row.operation)}</span>
          </div>
        );
      }
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      flex: 0.7,
      minWidth: 140,
      align: 'center',
      headerAlign: 'center',
      filterable: false, // ✅ Disable MUI built-in filter
      sortable: true,
      type: 'dateTime',
      valueGetter: (value) => new Date(value),
      renderCell: (params: GridRenderCellParams) => (
        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
          {getTimeAgo(params.row.timestamp)}
        </span>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.5,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      filterable: false, // ✅ Disable MUI built-in filter
      sortable: true,
      type: 'singleSelect',
      valueOptions: ['Success', 'Error', 'Pending'],
      valueGetter: (_value, row) => {
        const code = row?.statusCode || 200;
        if (code >= 200 && code < 300) return 'Success';
        if (code >= 400) return 'Error';
        return 'Pending';
      },
      renderCell: (params: GridRenderCellParams) => 
        getStatusBadge(params.row.statusCode, params.row.operation)
    }
  ];

  const rows = activities.map((activity, index) => ({
    id: activity._id || index,
    ...activity
  }));

  // Empty state
  if (!loading && activities.length === 0) {
    return (
      <div className="bg-white rounded border p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
          <h5 className="fw-bold mb-0" style={{ fontSize: '1.125rem' }}>Recent Activity</h5>
          {onRefresh && (
            <button onClick={onRefresh} className="btn btn-link p-0 text-muted">
              <MdRefresh size={20} />
            </button>
          )}
        </div>
        <div className="text-center py-5">
          <MdHistory size={48} className="text-muted mb-3" />
          <p className="fw-medium text-dark mb-1">No recent activity</p>
          <p className="text-muted small mb-0">New activities will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border p-3 p-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center pb-3 border-bottom mb-3 gap-2">
        <div>
          <h5 className="fw-bold mb-1" style={{ fontSize: '1.125rem' }}>Recent Activity</h5>
          <p className="text-muted mb-0" style={{ fontSize: '0.813rem' }}>
            {showPagination ? `Showing ${activities.length} of ${totalRecords} activities` : 'Latest 5 activities'}
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {onRefresh && (
            <button onClick={onRefresh} className="btn btn-link p-1 text-muted" title="Refresh">
              <MdRefresh size={20} />
            </button>
          )}
          {onDownload && (
            <button onClick={onDownload} className="btn btn-sm btn-primary d-flex align-items-center gap-1" style={{ fontSize: '0.813rem' }}>
              <MdDownload size={16} />
              <span className="d-none d-sm-inline">Download JSON</span>
            </button>
          )}
        </div>
      </div>

   
         {/* ✅ COMPLETE CUSTOM FILTERS - Including isslow & iserror */}
         {showFilters && (
        <div className="row g-2 mb-3 pb-3 border-bottom">
          {/* Username Filter */}
          <div className="col-12 col-sm-6 col-lg-3">
            <label className="form-label mb-1" style={{ fontSize: '0.813rem', fontWeight: '500' }}>
              Search Username
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              placeholder="Enter username..."
            />
          </div>

          {/* ✅ NEW: Is Slow Response Filter */}
          <div className="col-12 col-sm-6 col-lg-2">
            <label className="form-label mb-1" style={{ fontSize: '0.813rem', fontWeight: '500' }}>
              Slow Response
            </label>
            <select
              className="form-select form-select-sm"
              value={localIsSlow}
              onChange={(e) => setLocalIsSlow(e.target.value)}
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* ✅ NEW: Has Error Filter */}
          <div className="col-12 col-sm-6 col-lg-2">
            <label className="form-label mb-1" style={{ fontSize: '0.813rem', fontWeight: '500' }}>
              Has Error
            </label>
            <select
              className="form-select form-select-sm"
              value={localIsError}
              onChange={(e) => setLocalIsError(e.target.value)}
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          
          <div className="col-12 col-sm-6 col-lg-2">
            <label className="form-label mb-1" style={{ fontSize: '0.813rem', fontWeight: '500' }}>
              Start Date
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="dd-mm-yyyy"
            />
          </div>

          <div className="col-12 col-sm-6 col-lg-2">
            <label className="form-label mb-1" style={{ fontSize: '0.813rem', fontWeight: '500' }}>
              End Date
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="dd-mm-yyyy"
            />
          </div>

          <div className="col-12 col-lg-1 d-flex align-items-end gap-2">
            <button 
              onClick={handleApplyFilter} 
              className="btn btn-sm btn-primary w-100" 
              style={{ fontSize: '0.813rem' }}
            >
              Apply
            </button>
          </div>
          
          <div className="col-12 col-lg-12 d-flex gap-2 mt-2">
            <button 
              onClick={handleClearFilter} 
              className="btn btn-sm btn-outline-secondary" 
              style={{ fontSize: '0.813rem' }}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* DataGrid with server-side pagination & sorting */}
      <div className={styles.dataGridContainer}>
        <div className={styles.dataGridWrapper}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            rowHeight={72}
            
            // ✅ SERVER-SIDE MODES
            paginationMode={showPagination ? "server" : "client"}
            sortingMode={showPagination && onSortChange ? "server" : "client"}
             
            // ✅ Pagination
            rowCount={totalRecords}
            paginationModel={{
              page: currentPage - 1, // MUI uses 0-based indexing
              pageSize: pageSize
            }}
            onPaginationModelChange={(model) => {
              if (showPagination && onPageChange && onPageSizeChange) {
                console.log('Pagination model changed:', model);
                if (model.page !== currentPage - 1) {
                  console.log('Page changed from', currentPage, 'to', model.page + 1);
                  onPageChange(model.page + 1);
                }
                if (model.pageSize !== pageSize) {
                  console.log('Page size changed from', pageSize, 'to', model.pageSize);
                  onPageSizeChange(model.pageSize);
                }
              }
            }}
            
            pageSizeOptions={[5, 10, 25, 50, 100]}
            pagination={true}
            hideFooter={!showPagination}
            autoHeight
            disableRowSelectionOnClick
        
            onSortModelChange={(model) => {
              if (showPagination && onSortChange && model.length > 0) {
                console.log('Sort changed:', model[0]);
                onSortChange(model[0].field, model[0].sort as 'asc' | 'desc');
              }
            }}
            
            slotProps={{
              pagination: {
                showFirstButton: true,
                showLastButton: true,
                labelRowsPerPage: 'Rows per page:',
                SelectProps: {
                  native: false,
                  MenuProps: {
                    sx: {
                      '& .MuiPaper-root': {
                        maxHeight: '200px',
                      },
                    },
                  },
                },
              },
            }}
            sx={getDataGridStyles(showPagination)}
          />
        </div>
      </div>
    </div>
  );
};
              