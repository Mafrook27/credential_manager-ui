import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button, Alert, Box } from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { login,getUserProfile } from '../redux/actions';
import Input from '../../../common/components/Input';
import type { LoginCredentials } from '../redux/types';
import { useTheme } from '@mui/material/styles';

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
  const [formData, setFormData] = useState<LoginCredentials>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [touched, setTouched] = useState<TouchedFields>({});

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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
const result =await dispatch(login(formData) as any);

    if (result?.payload?.data?.user?._id) {
      await dispatch(getUserProfile() as any);  // ← No parameter!
    }
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errors: FieldErrors = {};
        err.response.data.errors.forEach((error: any) => {
          if (error.path) {
            errors[error.path as keyof FieldErrors] = error.msg;
          }
        });
        setFieldErrors(errors);
      } else if (err.response?.data?.message) {
        setGeneralError(err.response.data.message);
      } else {
        setGeneralError('Login failed. Please try again.');
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