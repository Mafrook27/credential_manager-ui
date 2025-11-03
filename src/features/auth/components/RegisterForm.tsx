import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Alert, Box, LinearProgress } from '@mui/material';
import { Person, Email, Lock } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { register } from '../redux/actions';
import Input from '../../../common/components/Input';
import type { RegisterData } from '../redux/types';
import { AxiosError } from 'axios';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

interface TouchedFields {
  name?: boolean;
  email?: boolean;
  password?: boolean;
}

function RegisterForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState<RegisterData>({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [touched, setTouched] = useState<TouchedFields>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (fieldErrors[name as keyof FieldErrors]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[name as keyof FieldErrors];
      setFieldErrors(newErrors);
    }
    
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 6) strength += 25;
      if (value.length >= 10) strength += 25;
      if (/[A-Z]/.test(value)) strength += 25;
      if (/[0-9]/.test(value)) strength += 25;
      setPasswordStrength(strength);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, formData[name as keyof RegisterData]);
  };

  const validateField = (fieldName: string, value: string) => {
    const newErrors = { ...fieldErrors };
    delete newErrors[fieldName as keyof FieldErrors];

    switch (fieldName) {
      case 'name':
        if (!value) {
          newErrors.name = 'Name is required';
        } else if (value.length < 2) {
          newErrors.name = 'Name must be at least 2 characters long';
        } else if (!/^[A-Za-z\s]+$/.test(value)) {
          newErrors.name = 'Name can only contain letters';
        }
        break;

      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please provide a valid email address';
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters long';
        }
        break;

      default:
        break;
    }

    setFieldErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setGeneralError('');

    try {
      await dispatch(register(formData) as any);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const error = err as AxiosError<{ errors?: string[]; message?: string }>;
      // console.error('Registration error:', error.response?.data);
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errors: FieldErrors = {};
        error.response.data.errors.forEach((errorMsg: string) => {
          const lowerMsg = errorMsg.toLowerCase();
          
          if (lowerMsg.includes('name')) {
            errors.name = errorMsg;
          } else if (lowerMsg.includes('email')) {
            errors.email = errorMsg;
          } else if (lowerMsg.includes('password')) {
            errors.password = errorMsg;
          } else {
            setGeneralError(errorMsg);
          }
        });
        
        setFieldErrors(errors);
      } else if (error.response?.data?.message) {
        setGeneralError(error.response.data.message);
      } else {
        setGeneralError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'danger';
    if (passwordStrength < 50) return 'warning';
    if (passwordStrength < 75) return 'info';
    return 'success';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  return (
    <>
      <h2 className="h3 fw-bold text-center mb-1">Create Account</h2>
      <p className="text-center text-muted mb-3" style={{ fontSize: '0.9rem' }}>
        Join Credential Manager
      </p>

      {generalError && (
        <Alert severity="error" onClose={() => setGeneralError('')} sx={{ py: 1, mb: 2, fontSize: '0.875rem' }}>
          {generalError}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ py: 1, mb: 2, fontSize: '0.875rem' }}>
          Registration successful! Redirecting...
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your full name"
          required
          error={!!(touched.name && fieldErrors.name)}
          helperText={(touched.name && fieldErrors.name) || ' '}
          startIcon={<Person sx={{ color: '#6c757d', fontSize: '20px' }} />}
        />

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
          placeholder="Create a strong password"
          required
          error={!!(touched.password && fieldErrors.password)}
          helperText={(touched.password && fieldErrors.password) || ' '}
          startIcon={<Lock sx={{ color: '#6c757d', fontSize: '20px' }} />}
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        {/* Password Strength Indicator */}
        {formData.password && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box component="small" sx={{ color: 'text.secondary' }}>Password Strength</Box>
              <Box component="small" sx={{ color: getPasswordStrengthColor() === 'danger' ? 'error.main' : getPasswordStrengthColor() === 'warning' ? 'warning.main' : 'success.main' }}>
                {getPasswordStrengthText()}
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate"
              value={passwordStrength} 
              color={getPasswordStrengthColor() === 'danger' ? 'error' : getPasswordStrengthColor() === 'warning' ? 'warning' : 'success'}
              sx={{ height: '4px', borderRadius: '2px' }}
            />
          </Box>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            backgroundColor: '#2962FF',
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
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <p className="text-center text-muted small mt-3 mb-0">
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2962FF', textDecoration: 'none' }}>Login</Link>
        </p>
      </Box>
    </>
  );
}

export default RegisterForm;