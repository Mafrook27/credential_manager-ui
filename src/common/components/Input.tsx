import React from 'react';
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
// FormControl, InputLabel

interface InputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  startIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error = false,
  helperText = ' ',
  startIcon,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword
}: InputProps) {
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        label={label}
        fullWidth
        name={name}
        type={inputType}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        error={error}
        helperText={helperText}
        InputProps={{
          startAdornment: startIcon && (
            <InputAdornment position="start">
              {startIcon}
            </InputAdornment>
          ),
          endAdornment: showPasswordToggle && (
            <InputAdornment position="end">
              <IconButton
                onClick={onTogglePassword}
                edge="end"
                size="small"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: '48px',
            borderRadius: '8px',
          },
          '& .MuiFormHelperText-root': {
            marginLeft: 0,
            marginTop: '2px',
            minHeight: '18px',
            fontSize: '0.75rem'
          },
          // Hide Edge/IE password reveal button
          '& input[type="password"]::-ms-reveal': {
            display: 'none'
          },
          '& input[type="password"]::-ms-clear': {
            display: 'none'
          },
          // Hide Edge (Chromium) password reveal button
          '& input[type="password"]::-webkit-credentials-auto-fill-button': {
            display: 'none !important',
            visibility: 'hidden',
            pointerEvents: 'none',
            position: 'absolute',
            right: 0
          }
        }}
      />
    </Box>
  );
}

export default Input;