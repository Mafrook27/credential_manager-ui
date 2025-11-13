import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { Button, Alert, Box } from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { login } from '../redux/actions';
import Input from '../../../common/components/Input';
import type { LoginCredentials } from '../redux/types';
import { useTheme } from '@mui/material/styles';
import { getDefaultDashboard } from '../../../common/utils/auth.uitls';
import { showSessionExpiredMessage } from '../../../utils/sessionExpiry';
interface FieldErrors {
  email?: string;
  password?: string;
}

interface TouchedFields {
  email?: boolean;
  password?: boolean;
}

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<LoginCredentials>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState('');
  const [touched, setTouched] = useState<TouchedFields>({});

  useEffect(() => {
    // Check for session expired message
    const expiredMsg = showSessionExpiredMessage();
    if (expiredMsg) {
      setSessionExpiredMessage(expiredMsg);
      // Clear the expired param from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('expired');
      navigate({ search: newParams.toString() }, { replace: true });
    }

    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location, searchParams, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (fieldErrors[name as keyof FieldErrors]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[name as keyof FieldErrors];
      setFieldErrors(newErrors);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, formData[name as keyof LoginCredentials]);
  };

  const validateField = (fieldName: string, value: string) => {
    const newErrors = { ...fieldErrors };
    delete newErrors[fieldName as keyof FieldErrors];

    if (fieldName === 'email') {
      if (!value) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (fieldName === 'password') {
      if (!value) {
        newErrors.password = 'Password is required';
      } else if (value.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setFieldErrors(newErrors);
  };

  const validateForm = () => {
    const errors: FieldErrors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Normalize email before sending to backend
      const normalizedData = {
        ...formData,
        email: formData.email.toLowerCase().trim()
      };
      const result = await dispatch(login(normalizedData) as any);
      
      // Validate login response
      if (!result?.data?.user) {
        throw new Error('Invalid login response');
      }

      // Navigate to appropriate dashboard based on user role
      const userRole = result.data.user.role;
      const dashboardPath = getDefaultDashboard(userRole);
      
      navigate(dashboardPath, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle field-specific validation errors
      if (err.response?.data?.errors) {
        const errors: FieldErrors = {};
        err.response.data.errors.forEach((error: any) => {
          if (error.path) {
            errors[error.path as keyof FieldErrors] = error.msg;
          }
        });
        setFieldErrors(errors);
      } 
      // Handle API error messages
      else if (err.response?.data?.message) {
        setGeneralError(err.response.data.message);
      } 
      // Handle network/server errors with user-friendly messages
      else if (err.message?.includes('Network Error') || err.code === 'ERR_NETWORK') {
        setGeneralError('Unable to connect to server. Please check your internet connection.');
      }
      else if (err.response?.status === 500) {
        setGeneralError('Server error. Please try again later or contact support.');
      }
      else if (err.response?.status === 503) {
        setGeneralError('Service temporarily unavailable. Please try again in a few moments.');
      }
      // Generic fallback
      else {
        setGeneralError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="h3 fw-bold text-center mb-1">Login</h2>
      <p className="text-center text-muted mb-3" style={{ fontSize: '0.9rem' }}>
        Please login to access your vault.
      </p>

      {sessionExpiredMessage && (
        <Alert severity="warning" onClose={() => setSessionExpiredMessage('')} sx={{ py: 1, mb: 2, fontSize: '0.875rem' }}>
          {sessionExpiredMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ py: 1, mb: 2, fontSize: '0.875rem' }}>
          {successMessage}
        </Alert>
      )}

      {generalError && (
        <Alert severity="error" onClose={() => setGeneralError('')} sx={{ py: 1, mb: 2, fontSize: '0.875rem' }}>
          {generalError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="you@example.com"
          required
          error={!!(touched.email && fieldErrors.email)}
          helperText={(touched.email && fieldErrors.email) || ' '}
          startIcon={<Email sx={{ color: '#6c757d', fontSize: '20px' }} />}
        />

        <Input
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your password"
          required
          error={!!(touched.password && fieldErrors.password)}
          helperText={(touched.password && fieldErrors.password) || ' '}
          startIcon={<Lock sx={{ color: '#6c757d', fontSize: '20px' }} />}
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <div className="text-end mb-2">
          <Link to="/reset-password" style={{ color: '#2962FF', textDecoration: 'none', fontSize: '0.9rem' }}>
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            backgroundColor: theme.palette.primary.main,
            fontWeight: 'bold',
            py: 1.5,
            mb: 2,
            borderRadius: '8px',
            fontSize: '15px',
            '&:hover': {
              backgroundColor: '#1e4ba8'
            }
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <p className="text-center text-muted small mt-3 mb-0">
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2962FF', textDecoration: 'none' }}>Register</Link>
        </p>
      </Box>
    </>
  );
}

export default LoginForm;