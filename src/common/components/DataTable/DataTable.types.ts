// src/common/components/DataTable/DataTable.types.ts

import { type GridColDef, type GridPaginationModel, type GridRowSelectionModel, type GridCallbackDetails } from '@mui/x-data-grid';

/**
 * Props for the reusable DataTable component
 * @template T - The type of data in each row (must have an 'id' field)
 */
export interface DataTableProps<T extends { id: string | number }> {
  /** Array of data rows to display in the table */
  rows: T[];
  
  /** Column definitions - controls what/how data is displayed */
  columns: GridColDef[];
  
  /** Shows loading skeleton when true */
  loading?: boolean;
  
  /** Shows/hides pagination footer */
  showPagination?: boolean;
  
  /** Current pagination state (page number and page size) */
  paginationModel?: GridPaginationModel;
  
  /** Callback when user changes page or page size */
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  
  /** Available options for rows per page (e.g., [5, 10, 25, 50]) */
  pageSizeOptions?: number[];
  
  /** Height of each row in pixels */
  rowHeight?: number;
  
  /** Custom function to get unique ID from each row */
  getRowId?: (row: T) => string | number;
  
  /** Shows checkboxes for row selection */
  checkboxSelection?: boolean;
  
  /** Callback when user selects/deselects rows */
  onRowSelectionModelChange?: (rowSelectionModel: GridRowSelectionModel, details: GridCallbackDetails) => void;
  
  /** Hides the column menu (filter, sort, etc.) */
  disableColumnMenu?: boolean;
  
  /** Adjusts height automatically based on content */
  autoHeight?: boolean;
  
  /** Minimum height of the table */
  minHeight?: number | string;
  
  /** Additional custom MUI sx styles */
  customSx?: any;
  
  /** Callback when user clicks a row */
  onRowClick?: (row: T) => void;
  
  /** Disable column reordering (drag and drop) */
  disableColumnReorder?: boolean;
  
  /** Total number of rows (for server-side pagination) */
  rowCount?: number;
  
  /** Pagination mode - 'client' or 'server' */
  paginationMode?: 'client' | 'server';
}
