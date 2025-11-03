# DataTable Component

A reusable, production-grade table component built on MUI DataGrid with Tailwind CSS styling.

## Features

- ✅ **Fully Responsive** - Mobile, tablet, and desktop friendly
- ✅ **Customizable** - Flexible props for different use cases
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Pagination** - Built-in pagination with customizable options
- ✅ **Sorting & Filtering** - Column-level sorting and filtering
- ✅ **Row Selection** - Optional checkbox selection
- ✅ **Professional Design** - Clean, modern UI with Bootstrap + MUI

## Installation

Make sure you have the required dependencies:

```bash
npm install @mui/x-data-grid @mui/material @emotion/react @emotion/styled react-icons
```

## Basic Usage

```tsx
import { DataTable } from '@/common/components/DataTable';
import { GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
];

const data = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

function MyTable() {
  return (
    <DataTable
      rows={data}
      columns={columns}
      showPagination={true}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `T[]` | **Required** | Array of data rows |
| `columns` | `GridColDef[]` | **Required** | Column definitions |
| `loading` | `boolean` | `false` | Show loading skeleton |
| `showPagination` | `boolean` | `true` | Show/hide pagination |
| `paginationModel` | `GridPaginationModel` | `{ page: 0, pageSize: 10 }` | Pagination state |
| `onPaginationModelChange` | `function` | - | Pagination change callback |
| `pageSizeOptions` | `number[]` | `[5, 10, 25, 50]` | Page size options |
| `rowHeight` | `number` | `72` | Height of each row |
| `checkboxSelection` | `boolean` | `false` | Show row selection checkboxes |
| `disableColumnMenu` | `boolean` | `false` | Hide column menu |
| `autoHeight` | `boolean` | `true` | Auto-adjust height |
| `minHeight` | `number \| string` | - | Minimum table height |
| `customSx` | `object` | `{}` | Custom MUI styles |
| `onRowClick` | `function` | - | Row click callback |
| `disableColumnReorder` | `boolean` | `false` | Disable column drag/reorder |

## Examples

### User Management Table

See `src/features/users/components/UserManagementTable.tsx` for a complete example with:
- Custom column rendering
- Action buttons (approve, edit, delete)
- Dropdown menu
- Status badges
- User avatars

### Audit Log Table

See `src/features/audit/components/AuditLogTable.tsx` for a complete example with:
- Timestamp formatting
- Action icons
- Service type badges
- IP address display

## Project Structure

```
src/
├── common/
│   └── components/
│       └── DataTable/
│           ├── DataTable.tsx          # Main component
│           ├── DataTable.types.ts     # TypeScript types
│           ├── DataTable.styles.ts    # MUI styles
│           ├── DataTable.module.css   # CSS modules
│           └── index.ts               # Exports
│
└── features/
    ├── users/                         # User Management feature
    │   ├── components/
    │   │   ├── UserManagementTable.tsx
    │   │   ├── UserTableColumns.tsx
    │   │   ├── UserActionsMenu.tsx
    │   │   └── UserAvatar.tsx
    │   ├── hooks/
    │   │   └── useUserTable.ts
    │   ├── types/
    │   │   └── user.types.ts
    │   ├── constants/
    │   │   └── user.constants.ts
    │   └── pages/
    │       └── UserManagementPage.tsx
    │
    └── audit/                         # Audit Log feature
        ├── components/
        │   ├── AuditLogTable.tsx
        │   └── AuditTableColumns.tsx
        ├── types/
        │   └── audit.types.ts
        └── constants/
            └── audit.constants.ts
```

## Customization

### Disable Column Reordering

To prevent users from dragging and reordering columns:

```tsx
<DataTable
  rows={data}
  columns={columns}
  disableColumnReorder={true}
/>
```

This is useful for tables where column order is important and should remain fixed.

### Custom Column Rendering

```tsx
const columns: GridColDef[] = [
  {
    field: 'status',
    headerName: 'Status',
    renderCell: (params) => (
      <span className={`badge ${params.row.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
        {params.row.status}
      </span>
    ),
  },
];
```

### Custom Row Actions

```tsx
const columns: GridColDef[] = [
  {
    field: 'actions',
    headerName: 'Actions',
    sortable: false,
    renderCell: (params) => (
      <button onClick={() => handleEdit(params.row.id)}>
        Edit
      </button>
    ),
  },
];
```

## Mobile Responsiveness

The table automatically handles mobile responsiveness with horizontal scrolling on smaller screens. The minimum width adjusts based on screen size:

- Desktop: 710px minimum
- Tablet: 600px minimum
- Mobile: 500px minimum

## License

MIT
