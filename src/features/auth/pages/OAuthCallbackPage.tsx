import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, loginFailure } from '../redux/actions';
import { getDefaultDashboard } from '../../../common/utils/auth.uitls';
import GlobalLoader from '../../../common/components/GlobalLoader';
import { toast } from '../../../common/utils/toast';

/**
 * Landing page for the Google OAuth redirect. The backend has already set the
 * session cookies at this point (see authController.googleCallback); this page
 * just hydrates Redux from the `user` query param and routes to the right
 * dashboard, same shape as a normal /auth/login response.
 */
function OAuthCallbackPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const userParam = searchParams.get('user');

    if (!userParam) {
      dispatch(loginFailure('Google sign-in failed') as any);
      toast.error('Google sign-in failed. Please try again.');
      navigate('/login?error=google_auth_failed', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userParam);
      dispatch(loginSuccess({ success: true, data: { user } }) as any);
      toast.success(`Welcome, ${user.name || 'there'}!`);
      navigate(getDefaultDashboard(user.role), { replace: true });
    } catch (err) {
      console.error('Failed to parse OAuth callback user payload:', err);
      dispatch(loginFailure('Google sign-in failed') as any);
      navigate('/login?error=google_auth_failed', { replace: true });
    }
  }, [searchParams, dispatch, navigate]);

  return <GlobalLoader />;
}

export default OAuthCallbackPage;
