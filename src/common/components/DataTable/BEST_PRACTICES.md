# DataTable Best Practices

Guidelines to avoid common UI issues when creating tables.

## Column Alignment

### ❌ Wrong
```tsx
{
  field: 'ipAddress',
  headerName: 'IP Address',
  align: 'right',  // ❌ Causes text to appear on wrong side
  headerAlign: 'right',
}
```

### ✅ Correct
```tsx
{
  field: 'ipAddress',
  headerName: 'IP Address',
  align: 'left',  // ✅ Default alignment
  headerAlign: 'left',
}
```

**Rule**: Use `align: 'left'` for most columns. Only use `'center'` or `'right'` for specific cases like numbers or actions.

## Multi-Line Cell Content

### Structure: Small Text Above, Large Badge Below

```tsx
renderCell: (params) => (
  <div className="d-flex flex-column gap-1" style={{ padding: '8px 0' }}>
    {/* Small descriptive text */}
    <span className="text-muted text-truncate" style={{ 
      fontSize: '0.75rem',      // Smaller font
      lineHeight: '1.25' 
    }}>
      {params.row.credentialName}
    </span>
    
    {/* Larger, bold badge */}
    <span className="badge" style={{
      backgroundColor: config.bg,
      color: config.text,
      fontSize: '0.75rem',       // Larger than text above
      padding: '3px 10px',       // More padding
      fontWeight: '600',         // Bold
      width: 'fit-content',
    }}>
      {config.label}
    </span>
  </div>
)
```

### Visual Hierarchy
1. **Top line** - Smaller, muted, descriptive (e.g., credential name)
2. **Bottom line** - Larger, bold, prominent (e.g., service badge)

## Text Truncation

### Always Add These Styles for Long Text

```tsx
<span className="text-truncate" style={{ 
  fontSize: '0.875rem',
  lineHeight: '1.25',
  overflow: 'hidden',      // Hide overflow
  textOverflow: 'ellipsis', // Show ...
  whiteSpace: 'nowrap',     // Don't wrap
}}>
  {longText}
</span>
```

**Or use Bootstrap class**:
```tsx
<span className="text-truncate">
  {longText}
</span>
```

## Cell Padding

### Always Add Vertical Padding

```tsx
renderCell: (params) => (
  <div style={{ padding: '8px 0' }}>  {/* ✅ Vertical padding */}
    {/* Content */}
  </div>
)
```

**Why**: Ensures content doesn't touch cell borders and maintains consistent spacing.

## Font Sizes

### Standard Sizes
- **Headers**: `0.813rem` (13px)
- **Primary text**: `0.875rem` (14px)
- **Secondary text**: `0.75rem` (12px)
- **Small text**: `0.688rem` (11px)

### Example
```tsx
// Primary name
<span style={{ fontSize: '0.875rem' }}>John Doe</span>

// Secondary email
<span style={{ fontSize: '0.75rem' }}>john@example.com</span>

// Badge
<span style={{ fontSize: '0.75rem' }}>Admin</span>
```

## Badge Styling

### Consistent Badge Design

```tsx
<span className="badge" style={{
  backgroundColor: config.bg,
  color: config.text,
  fontSize: '0.75rem',
  padding: '3px 10px',      // Horizontal padding
  fontWeight: '600',
  width: 'fit-content',     // Don't stretch
  borderRadius: '4px',      // Optional rounded corners
}}>
  {label}
</span>
```

## Column Width

### Flex vs MinWidth

```tsx
{
  field: 'name',
  flex: 1.5,        // Takes 1.5x space
  minWidth: 220,    // But never smaller than 220px
}
```

### Guidelines
- **Name columns**: `flex: 1.5`, `minWidth: 220`
- **Action columns**: `flex: 0.8`, `minWidth: 140`
- **Status columns**: `flex: 0.8`, `minWidth: 120`
- **Timestamp columns**: `flex: 1`, `minWidth: 180`

## Common Mistakes to Avoid

### ❌ 1. Wrong Alignment
```tsx
align: 'right'  // Text appears on wrong side
```

### ❌ 2. Missing Padding
```tsx
<div>  // No padding, content touches borders
  {content}
</div>
```

### ❌ 3. No Text Truncation
```tsx
<span>{veryLongText}</span>  // Breaks layout
```

### ❌ 4. Inconsistent Font Sizes
```tsx
<span style={{ fontSize: '14px' }}>  // Use rem, not px
```

### ❌ 5. Badge Too Small
```tsx
<span style={{ fontSize: '0.688rem' }}>  // Too small to read
```

## Complete Example

### User Column (Avatar + Name + Email)
```tsx
{
  field: 'name',
  headerName: 'Name',
  flex: 1.5,
  minWidth: 220,
  renderCell: (params) => (
    <div className="d-flex align-items-center gap-2 w-100" style={{ padding: '8px 0' }}>
      <div className="rounded-circle" style={{
        width: '36px',
        height: '36px',
        backgroundColor: '#e5e7eb',
        // ... avatar styles
      }}>
        {initials}
      </div>
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <div className="fw-semibold text-dark text-truncate" style={{ 
          fontSize: '0.875rem',
          lineHeight: '1.25' 
        }}>
          {params.row.name}
        </div>
        <div className="text-muted text-truncate" style={{ 
          fontSize: '0.75rem',
          lineHeight: '1.25' 
        }}>
          {params.row.email}
        </div>
      </div>
    </div>
  ),
}
```

### Credential Column (Name + Service Badge)
```tsx
{
  field: 'credentialName',
  headerName: 'Credential',
  flex: 1.3,
  minWidth: 220,
  renderCell: (params) => (
    <div className="d-flex flex-column gap-1" style={{ padding: '8px 0' }}>
      {/* Small credential name */}
      <span className="text-muted text-truncate" style={{ 
        fontSize: '0.75rem',
        lineHeight: '1.25' 
      }}>
        {params.row.credentialName}
      </span>
      
      {/* Larger service badge */}
      <span className="badge" style={{
        backgroundColor: serviceConfig.bg,
        color: serviceConfig.text,
        fontSize: '0.75rem',
        padding: '3px 10px',
        fontWeight: '600',
        width: 'fit-content',
      }}>
        {serviceConfig.label}
      </span>
    </div>
  ),
}
```

### IP Address Column
```tsx
{
  field: 'ipAddress',
  headerName: 'IP Address',
  flex: 0.8,
  minWidth: 140,
  align: 'left',        // ✅ Left aligned
  headerAlign: 'left',
  renderCell: (params) => (
    <code style={{
      fontSize: '0.75rem',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '4px 8px',
      borderRadius: '4px',
      fontFamily: 'monospace',
    }}>
      {params.row.ipAddress}
    </code>
  ),
}
```

## Checklist

Before creating a new table, verify:

- [ ] All columns have `align: 'left'` (unless specific reason)
- [ ] All cells have `padding: '8px 0'`
- [ ] Long text has `text-truncate` class
- [ ] Font sizes use `rem` units
- [ ] Primary text is `0.875rem`, secondary is `0.75rem`
- [ ] Badges are `0.75rem` with `fontWeight: '600'`
- [ ] Multi-line cells have `flex-column` with `gap-1`
- [ ] Columns have both `flex` and `minWidth`
- [ ] Line height is set to `1.25` for multi-line text

## Testing

Test your table with:
1. **Long text** - Does it truncate properly?
2. **Short text** - Does it look good?
3. **Different screen sizes** - Does it scroll horizontally?
4. **Empty data** - Does it show proper message?
5. **Loading state** - Does skeleton appear?

## Root Cause Analysis

### Why IP Address Was Right-Aligned?
**Cause**: `align: 'right'` in column definition
**Fix**: Change to `align: 'left'`
**Prevention**: Always use `'left'` unless you need center/right for numbers

### Why Credential Name Was Too Large?
**Cause**: `fontSize: '0.875rem'` and `fw-semibold` made it prominent
**Fix**: Changed to `fontSize: '0.75rem'` and `text-muted`
**Prevention**: Use smaller, muted text for descriptive labels, larger bold text for important values

### Why Service Badge Was Too Small?
**Cause**: `fontSize: '0.688rem'` was too small
**Fix**: Increased to `fontSize: '0.75rem'` with more padding
**Prevention**: Badges should be at least `0.75rem` for readability
