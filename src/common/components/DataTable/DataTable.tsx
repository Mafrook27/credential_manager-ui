// src/common/components/DataTable/DataTable.tsx

import { DataGrid } from '@mui/x-data-grid';
import { type DataTableProps } from './DataTable.types';
import { getDataGridStyles } from './DataTable.styles';
import styles from './DataTable.module.css';

/**
 * Reusable DataTable Component
 * 
 * A professional, flexible table component built on MUI DataGrid.
 * 
 * @example
 * ```
 * <DataTable
 *   rows={users}
 *   columns={userColumns}
 *   showPagination={true}
 * />
 * ```
 */
export function DataTable<T extends { id: string | number }>({
  rows,
  columns,
  loading = false,
  showPagination = true,
  paginationModel = { page: 0, pageSize: 10 },
  onPaginationModelChange,
  pageSizeOptions = [5, 10, 25, 50],
  rowHeight = 72,
  getRowId,
  checkboxSelection = false,
  onRowSelectionModelChange,
  disableColumnMenu = false,
  autoHeight = true,
  minHeight,
  customSx = {},
  onRowClick,
  disableColumnReorder = false,
  rowCount,
  paginationMode = 'client',
}: DataTableProps<T>) {
  
  return (
    <div className={styles.dataGridContainer}>
      <div 
        className={`${styles.dataGridWrapper} ${disableColumnReorder ? styles.disableColumnDrag : ''}`}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={getRowId}
          rowHeight={rowHeight}
          autoHeight={autoHeight}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          pageSizeOptions={pageSizeOptions}
          pagination
          paginationMode={paginationMode}
          rowCount={rowCount}
          hideFooter={!showPagination}
          checkboxSelection={checkboxSelection}
          onRowSelectionModelChange={onRowSelectionModelChange}
          disableRowSelectionOnClick
          disableColumnMenu={disableColumnMenu}
          onRowClick={onRowClick ? (params) => onRowClick(params.row) : undefined}
          slotProps={{
            pagination: {
              showFirstButton: true,
              showLastButton: true,
              labelRowsPerPage: 'Rows per page:',
            },
            loadingOverlay: {
              variant: 'skeleton',
              noRowsVariant: 'skeleton',
            },
          }}
          sx={{
            ...getDataGridStyles(showPagination, minHeight),
            ...customSx,
          }}
        />
      </div>
    </div>
  );
}
