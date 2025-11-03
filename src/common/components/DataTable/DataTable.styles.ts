// src/common/components/DataTable/DataTable.styles.ts

import type { SxProps, Theme } from '@mui/material';

/**
 * Returns MUI DataGrid styles
 * Professional, clean design with good UX
 */
export const getDataGridStyles = (
  showPagination: boolean,
  minHeight?: number | string
): SxProps<Theme> => ({
  border: 0,
  
  // Header row styling
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#f9fafb',
    borderBottom: '2px solid #e5e7eb',
    fontSize: '0.813rem',
    fontWeight: 600,
    color: '#6b7280',
    minHeight: '48px !important',
    maxHeight: '48px !important',
  },
  
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 600,
  },
  
  // Cell styling
  '& .MuiDataGrid-cell': {
    borderBottom: '1px solid #f3f4f6',
    fontSize: '0.875rem',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
  },
  
  // Remove focus outline on cell click
  '& .MuiDataGrid-cell:focus': {
    outline: 'none',
  },
  
  '& .MuiDataGrid-cell:focus-within': {
    outline: 'none',
  },
  
  // Row styling
  '& .MuiDataGrid-row': {
    minHeight: '72px !important',
    maxHeight: '72px !important',
  },
  
  '& .MuiDataGrid-row:hover': {
    backgroundColor: '#f9fafb',
  },
  
  // Table body height
  '& .MuiDataGrid-virtualScroller': {
    minHeight: minHeight || (showPagination ? '400px' : 'auto'),
  },
  
  // Column menu icon
  '& .MuiDataGrid-menuIcon': {
    visibility: 'visible',
  },
  
  '& .MuiDataGrid-sortIcon': {
    opacity: 0.5,
  },
  
  // Footer/pagination container
  '& .MuiDataGrid-footerContainer': {
    minHeight: '52px',
    borderTop: '1px solid #e5e7eb',
    overflow: 'visible',
  },
  
  // Pagination root
  '& .MuiTablePagination-root': {
    overflow: 'visible',
  },
  
  // Pagination toolbar
  '& .MuiTablePagination-toolbar': {
    minHeight: '52px',
    paddingLeft: '8px',
    paddingRight: '8px',
  },
  
  // Pagination select label - ALWAYS VISIBLE
  '& .MuiTablePagination-selectLabel': {
    fontSize: '0.875rem',
    margin: 0,
    display: 'block !important',
    visibility: 'visible !important',
  },
  
  // Pagination displayed rows
  '& .MuiTablePagination-displayedRows': {
    fontSize: '0.875rem',
    margin: 0,
  },
  
  // Pagination select dropdown - ALWAYS VISIBLE
  '& .MuiTablePagination-select': {
    paddingLeft: '8px',
    paddingRight: '24px',
    display: 'block !important',
    visibility: 'visible !important',
  },
  
  // Pagination input - ALWAYS VISIBLE
  '& .MuiTablePagination-input': {
    display: 'block !important',
    visibility: 'visible !important',
  },
  
  // Checkbox styling
  '& .MuiCheckbox-root': {
    color: '#9ca3af',
  },
  
  '& .MuiCheckbox-root.Mui-checked': {
    color: '#2563eb',
  },
  
  // Loading overlay
  '& .MuiDataGrid-overlay': {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
});
