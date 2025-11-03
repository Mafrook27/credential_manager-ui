import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Alert, Box } from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { resetPassword, verifyResetPassword } from '../redux/actions';
import Input from '../../../common/components/Input';
import type { ResetPasswordRequest, ResetPasswordVerify } from '../redux/types';

function ResetPasswordForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const requestData: ResetPasswordRequest = { email };
      await dispatch(resetPassword(requestData) as any);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (token.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const verifyData: ResetPasswordVerify = {
        email,
        token,
        newPassword
      };
      
      await dispatch(verifyResetPassword(verifyData) as any);
      
      navigate('/login', { 
        state: { 
          message: 'Password reset successful! Please login with your new password.'
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const requestData: ResetPasswordRequest = { email };
      await dispatch(resetPassword(requestData) as any);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep(1);
    setToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  if (step === 1) {
    return (
      <>
        <h2 className="h3 fw-bold text-center mb-1">Reset Password</h2>
        <p className="text-center text-muted mb-3" style={{ fontSize: '0.9rem' }}>
          Enter your email address
        </p>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ py: 1, mb: 2, fontSize: '0.875rem' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleRequestCode}>
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            startIcon={<Email sx={{ color: '#6c757d', fontSize: '20px' }} />}
          />

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
            {loading ? 'Sending Code...' : 'Send Reset Code'}
          </Button>

          <p className="text-center text-muted small mt-3 mb-0">
            Remember your password?{' '}
            <Link to="/login" style={{ color: '#2962FF', textDecoration: 'none' }}>Login</Link>
          </p>
        </Box>
      </>
    );
  }

  return (
    <>
      <h2 className="h3 fw-bold text-center mb-1">Enter Reset Code</h2>
      <p className="text-center text-muted mb-3" style={{ fontSize: '0.9rem' }}>
        We sent a 6-digit code to <strong>{email}</strong>
      </p>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ py: 1, mb: 2, fontSize: '0.875rem' }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleResetPassword}>
        <Input
          label="Reset Code"
          name="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter 6-digit code"
          required
        />

        <Input
          label="New Password"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          required
          startIcon={<Lock sx={{ color: '#6c757d', fontSize: '20px' }} />}
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
          startIcon={<Lock sx={{ color: '#6c757d', fontSize: '20px' }} />}
          showPasswordToggle
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        />

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
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </Button>

        <div className="text-center mt-3">
          <p className="text-muted small mb-1">
            Didn't receive the code?{' '}
            <button 
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#2962FF', 
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: 'inherit'
              }}
            >
              Resend
            </button>
          </p>
          <p className="text-muted small mb-0">
            Wrong email?{' '}
            <button 
              type="button"
              onClick={handleChangeEmail}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#2962FF', 
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: 'inherit'
              }}
            >
              Change Email
            </button>
          </p>
        </div>
      </Box>
    </>
  );
}

export default ResetPasswordForm;