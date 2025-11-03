# Reusable Modal Components

Professional, flexible modal components built with Tailwind CSS.

## Components

### 1. Modal (Base Component)
Generic modal wrapper with customizable size and content.

```tsx
import { Modal } from '@/common/modals';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
  size="md" // sm, md, lg, xl
>
  <p>Your content here</p>
</Modal>
```

### 2. ConfirmModal
Confirmation dialog with customizable buttons.

```tsx
import { ConfirmModal } from '@/common/modals';

<ConfirmModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleConfirm}
  title="Confirm Action"
  message="Are you sure?"
  confirmText="Yes"
  cancelText="No"
  confirmButtonClass="bg-red-600 hover:bg-red-700"
/>
```

## Features

- ✅ **Responsive** - Works on all screen sizes
- ✅ **Accessible** - Keyboard navigation and ARIA labels
- ✅ **Customizable** - Flexible sizing and styling
- ✅ **Backdrop Click** - Close on outside click
- ✅ **Loading States** - Built-in loading indicators
- ✅ **Tailwind CSS** - Modern, utility-first styling

## Usage Examples

### Edit User Modal
See `src/features/users/components/EditUserModal.tsx`
- Form validation
- Input fields with icons
- Error handling

### Edit Password Modal
See `src/features/users/components/EditPasswordModal.tsx`
- Password visibility toggle
- Confirmation field
- Strength validation

### Delete Confirmation
```tsx
<ConfirmModal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  onConfirm={handleDelete}
  title="Delete User"
  message="This action cannot be undone."
  confirmText="Delete"
  confirmButtonClass="bg-red-600 hover:bg-red-700"
/>
```

### Approve Confirmation
```tsx
<ConfirmModal
  isOpen={isApproveModalOpen}
  onClose={() => setIsApproveModalOpen(false)}
  onConfirm={handleApprove}
  title="Approve User"
  message="Approve this user?"
  confirmText="Approve"
  confirmButtonClass="bg-green-600 hover:bg-green-700"
/>
```

## Props

### Modal Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | **Required** | Modal visibility |
| `onClose` | `function` | **Required** | Close handler |
| `title` | `string` | **Required** | Modal title |
| `children` | `ReactNode` | **Required** | Modal content |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Modal size |
| `showCloseButton` | `boolean` | `true` | Show X button |

### ConfirmModal Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | **Required** | Modal visibility |
| `onClose` | `function` | **Required** | Close handler |
| `onConfirm` | `function` | **Required** | Confirm handler |
| `title` | `string` | **Required** | Modal title |
| `message` | `string` | **Required** | Confirmation message |
| `confirmText` | `string` | `'Confirm'` | Confirm button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |
| `confirmButtonClass` | `string` | `'bg-blue-600...'` | Confirm button classes |
| `isLoading` | `boolean` | `false` | Loading state |

## Styling

All modals use Tailwind CSS classes. You can customize:
- Background colors
- Border styles
- Button colors
- Spacing and padding
- Font sizes

## Best Practices

1. **Always provide a title** - Helps with accessibility
2. **Use appropriate button colors** - Red for delete, green for approve
3. **Show loading states** - Prevent double submissions
4. **Validate before confirming** - Check data before closing
5. **Clear state on close** - Reset form fields

## Integration

The modals are integrated into the User Management feature:
- **Edit User** - Update name and email
- **Edit Password** - Change user password
- **Delete User** - Confirm deletion
- **Approve User** - Confirm approval

All modals are managed through the `useUserTable` hook for centralized state management.
