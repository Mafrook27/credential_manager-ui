# Session-Based Authentication Integration

## Overview

This frontend is integrated with a professional session-based authentication system using HTTP-only cookies for secure token management.

## Architecture

### Backend Session System
- **Access Token**: Short-lived (5 minutes default) stored in HTTP-only cookie
- **Refresh Token**: Longer-lived (30 minutes default) stored in HTTP-only cookie
- **Session Storage**: MongoDB with automatic expiration
- **Refresh Limit**: Maximum 3 refreshes per session
- **Device Tracking**: User agent and IP address logged

### Frontend Integration

#### 1. **Axios Instance** (`src/services/axios.ts`)
- Configured with `withCredentials: true` for cookie handling
- Automatic token refresh on 401 errors
- Request/response interceptors for logging
- Queue system to prevent multiple refresh calls
- Automatic redirect on session expiry

#### 2. **Auth API** (`src/features/auth/api.ts`)
- `login()` - Authenticates user, sets cookies
- `logout()` - Clears cookies and invalidates session
- `refreshToken()` - Refreshes access token (called automatically)
- `register()` - Creates new user account
- `resetPasswordRequest()` - Sends reset code to email
- `resetPasswordVerify()` - Verifies code and resets password
- `getUserProfile()` - Fetches user profile

#### 3. **Session Monitor** (`src/utils/sessionMonitor.ts`)
- Tracks user activity
- Monitors session lifecycle
- Provides manual refresh capability
- Activity-based session management

#### 4. **Auth Session Hook** (`src/features/auth/hooks/useAuthSession.ts`)
- Manages session lifecycle
- Handles logout with cleanup
- Provides session refresh functionality
- Integrates with session monitor

#### 5. **Error Handler** (`src/features/auth/utils/authErrorHandler.ts`)
- Centralized error handling
- User-friendly error messages
- Session expiry detection
- Validation error extraction

## Available Routes

### Authentication Routes (`/api/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token (automatic)
- `POST /auth/reset-password` - Request password reset
- `POST /auth/reset-password/verify` - Verify reset code

### User Routes (`/api/users`)
- `GET /users/list` - Get user list for dropdowns
- `POST /users/change-password` - Change password
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user account
- `GET /users/:id/stats` - Get user statistics

### Credential Routes (`/api/users/credentials`)
- `GET /users/credentials` - Get all credentials (owned + shared)
- `POST /users/credentials?rootId=&subId=` - Create credential
- `GET /users/credentials/:id` - Get credential details
- `PUT /users/credentials/:credId` - Update credential
- `DELETE /users/credentials/:id` - Delete credential
- `GET /users/credentials/:id/decrypt` - Get decrypted credential
- `GET /users/credentials/:id/audit-logs` - Get audit logs
- `POST /users/credentials/:id/share` - Share credential
- `DELETE /users/credentials/:id/share/:userId` - Revoke access

## Usage Examples

### 1. Login Flow

```typescript
import { useDispatch } from 'react-redux';
import { login } from './features/auth/redux/actions';
import { handleAuthError } from './features/auth/utils/authErrorHandler';

const LoginComponent = () => {
  const dispatch = useDispatch();

  const handleLogin = async (email: string, password: string) => {
    try {
      await dispatch(login({ email, password }));
      // Cookies are set automatically by backend
      // User is authenticated
      navigate('/dashboard');
    } catch (error) {
      handleAuthError(error);
    }
  };
};
```

### 2. Using Auth Session Hook

```typescript
import { useAuthSession } from './features/auth/hooks/useAuthSession';

const DashboardComponent = () => {
  const { isAuthenticated, user, logout, refreshSession } = useAuthSession();

  const handleLogout = async () => {
    await logout();
    // Redirects to login automatically
  };

  const handleRefresh = async () => {
    const success = await refreshSession();
    if (success) {
      console.log('Session refreshed');
    }
  };

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};
```

### 3. Protected Routes

```typescript
import { ProtectedRoute } from './common/components/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### 4. Making Authenticated Requests

```typescript
import axiosInstance from './services/axios';

// Cookies are sent automatically with every request
const fetchUserData = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};
```

## Session Lifecycle

### 1. **Login**
```
User enters credentials
  ↓
POST /auth/login
  ↓
Backend validates credentials
  ↓
Backend creates session in MongoDB
  ↓
Backend sets HTTP-only cookies (accessToken, refreshToken)
  ↓
Frontend receives user data
  ↓
Redux state updated
  ↓
Session monitor starts
```

### 2. **Authenticated Request**
```
User makes API request
  ↓
Axios sends request with cookies
  ↓
Backend verifies accessToken
  ↓
Request processed
  ↓
Response returned
```

### 3. **Token Refresh (Automatic)**
```
Access token expires
  ↓
API returns 401 with TOKEN_EXPIRED code
  ↓
Axios interceptor catches error
  ↓
POST /auth/refresh (with refreshToken cookie)
  ↓
Backend validates refreshToken
  ↓
Backend increments refresh count
  ↓
Backend generates new accessToken
  ↓
Backend sets new accessToken cookie
  ↓
Original request retried automatically
```

### 4. **Logout**
```
User clicks logout
  ↓
POST /auth/logout
  ↓
Backend deletes session from MongoDB
  ↓
Backend clears cookies
  ↓
Frontend clears Redux state
  ↓
Session monitor stops
  ↓
Redirect to login
```

## Security Features

### 1. **HTTP-Only Cookies**
- Tokens stored in HTTP-only cookies (not accessible via JavaScript)
- Prevents XSS attacks
- Automatic cookie management by browser

### 2. **Refresh Token Rotation**
- Refresh tokens have limited refresh count (max 3)
- Forces re-authentication after limit reached
- Prevents indefinite token usage

### 3. **Session Tracking**
- User agent and IP address logged
- Device-based session management
- Audit trail for security monitoring

### 4. **Automatic Session Cleanup**
- MongoDB TTL index for automatic session expiration
- Expired sessions automatically deleted
- No manual cleanup required

### 5. **CSRF Protection**
- SameSite cookie attribute
- Secure flag in production
- Origin validation

## Error Handling

### Session Errors
- `TOKEN_EXPIRED` - Access token expired (auto-refresh triggered)
- `SESSION_EXPIRED` - Refresh token expired (redirect to login)
- `NO_TOKEN` - No token provided (redirect to login)
- `INVALID_TOKEN` - Invalid token (redirect to login)

### Auth Errors
- `INVALID_CREDENTIALS` - Wrong email/password
- `ACCOUNT_BLOCKED` - Account blocked by admin
- `EMAIL_EXISTS` - Email already registered

### Handling
```typescript
import { handleAuthError, isSessionExpiredError } from './features/auth/utils/authErrorHandler';

try {
  await someAuthAction();
} catch (error) {
  if (isSessionExpiredError(error)) {
    // Handle session expiry
    navigate('/login?expired=1');
  } else {
    // Handle other errors
    handleAuthError(error);
  }
}
```

## Environment Variables

```env
# API Base URL
VITE_API_URL=http://localhost:5000/api
VITE_PROD_API_URL=https://your-production-api.com/api

# Redux Persist Encryption Key
VITE_PERSIST_KEY=your-secret-key-here
```

## Best Practices

### 1. **Always Use Axios Instance**
```typescript
// ✅ Good
import axiosInstance from './services/axios';
const response = await axiosInstance.get('/users/me');

// ❌ Bad
import axios from 'axios';
const response = await axios.get('http://api.com/users/me');
```

### 2. **Handle Errors Properly**
```typescript
// ✅ Good
try {
  await dispatch(login(credentials));
} catch (error) {
  handleAuthError(error);
}

// ❌ Bad
try {
  await dispatch(login(credentials));
} catch (error) {
  console.log(error); // No user feedback
}
```

### 3. **Use Auth Hooks**
```typescript
// ✅ Good
const { isAuthenticated, user } = useAuth();

// ❌ Bad
const user = useSelector(state => state.auth.user);
```

### 4. **Clean Up on Logout**
```typescript
// ✅ Good
const { logout } = useAuthSession();
await logout(); // Handles all cleanup

// ❌ Bad
dispatch({ type: 'LOGOUT' }); // Incomplete cleanup
```

## Troubleshooting

### Issue: "Session expired" immediately after login
**Solution**: Check if cookies are being set properly. Ensure `withCredentials: true` in axios config.

### Issue: Infinite refresh loop
**Solution**: Check if refresh endpoint is excluded from retry logic. Verify `_retry` flag is set.

### Issue: CORS errors
**Solution**: Ensure backend has proper CORS configuration with credentials support.

### Issue: Cookies not sent with requests
**Solution**: Verify `withCredentials: true` in axios instance and backend CORS allows credentials.

## Testing

### Manual Testing
1. Login with valid credentials
2. Verify cookies are set in browser DevTools
3. Make authenticated requests
4. Wait for token expiry (or manually delete accessToken cookie)
5. Verify automatic refresh works
6. Logout and verify cookies are cleared

### Testing Session Expiry
```typescript
// Manually trigger session expiry
localStorage.clear();
sessionStorage.clear();
// Delete cookies in DevTools
// Try to make authenticated request
// Should redirect to login
```

## Migration from Token-Based Auth

If migrating from localStorage token-based auth:

1. Remove token storage logic
2. Remove Authorization header management
3. Add `withCredentials: true` to axios
4. Update error handling for session errors
5. Remove manual token refresh logic
6. Test thoroughly

## Support

For issues or questions:
- Check backend logs for session-related errors
- Verify cookie settings in browser DevTools
- Check network tab for failed requests
- Review error messages in console

## Changelog

### v1.0.0 (Current)
- Initial session-based authentication integration
- HTTP-only cookie support
- Automatic token refresh
- Session monitoring
- Comprehensive error handling
- Device tracking
- Audit logging
