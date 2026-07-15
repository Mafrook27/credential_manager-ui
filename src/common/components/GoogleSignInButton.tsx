import React from 'react';
import { Button, Divider, Box } from '@mui/material';
import { FaGoogle } from 'react-icons/fa';

// Same base URL resolution as services/axios.ts (kept in sync manually since this
// triggers a full page redirect rather than an axios call).
const getApiBaseURL = (): string => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  }
  return import.meta.env.VITE_PROD_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

interface GoogleSignInButtonProps {
  label?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ label = 'Continue with Google' }) => {
  const handleClick = () => {
    // Full page redirect is required for the OAuth handshake - not an axios call.
    window.location.href = `${getApiBaseURL()}/auth/google`;
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Divider sx={{ my: 2 }}>
        <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.8rem', px: 1 }}>
          or
        </Box>
      </Divider>

      <Button
        type="button"
        onClick={handleClick}
        variant="outlined"
        fullWidth
        startIcon={<FaGoogle style={{ color: '#EA4335' }} />}
        sx={{
          py: 1.25,
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          textTransform: 'none',
          borderColor: '#dadce0',
          color: '#3c4043',
          '&:hover': {
            borderColor: '#dadce0',
            backgroundColor: 'rgba(60, 64, 67, 0.04)',
          },
        }}
      >
        {label}
      </Button>
    </Box>
  );
};

export default GoogleSignInButton;
