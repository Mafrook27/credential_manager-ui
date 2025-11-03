import type { SxProps, Theme } from '@mui/material';

/**
 * DataGrid styles configuration
 * Separated for better readability and maintainability
 */

export const getDataGridStyles = (showPagination: boolean): SxProps<Theme> => ({
  border: 0,
  
  // Column Headers
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
  
  // Cell Styles
  '& .MuiDataGrid-cell': {
    borderBottom: '1px solid #f3f4f6',
    fontSize: '0.875rem',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
  },
  
  // Row Styles
  '& .MuiDataGrid-row': {
    minHeight: '72px !important',
    maxHeight: '72px !important',
  },
  
  '& .MuiDataGrid-row:hover': {
    backgroundColor: '#f9fafb',
  },
  
  // Virtual Scroller
  '& .MuiDataGrid-virtualScroller': {
    minHeight: showPagination ? '400px' : 'auto',
  },
  
  // Menu Icons
  '& .MuiDataGrid-menuIcon': {
    visibility: 'visible',
  },
  
  '& .MuiDataGrid-sortIcon': {
    opacity: 0.5,
  },
  
  // Footer Container
  '& .MuiDataGrid-footerContainer': {
    minHeight: '52px',
    borderTop: '1px solid #e5e7eb',
    overflow: 'visible',
  },
  
  // Pagination Root
  '& .MuiTablePagination-root': {
    overflow: 'visible',
  },
  
  // Pagination Toolbar
  '& .MuiTablePagination-toolbar': {
    minHeight: '52px',
    paddingLeft: '8px',
    paddingRight: '8px',
  },
  
  // Pagination Select Label
  '& .MuiTablePagination-selectLabel': {
    fontSize: '0.875rem',
    margin: 0,
    display: 'block !important',
    visibility: 'visible !important',
  },
  
  // Pagination Displayed Rows
  '& .MuiTablePagination-displayedRows': {
    fontSize: '0.875rem',
    margin: 0,
  },
  
  // Pagination Select Dropdown
  '& .MuiTablePagination-select': {
    paddingLeft: '8px',
    paddingRight: '24px',
    display: 'block !important',
    visibility: 'visible !important',
  },
  
  // Pagination Input
  '& .MuiTablePagination-input': {
    display: 'block !important',
    visibility: 'visible !important',
  },
});

