/**
 * Session Expiry Handler
 * Centralized handler for forcing user to login page on session expiry
 */

/**
 * Force redirect to login page and clear all auth data
 * @param reason - Optional reason for session expiry
 */
export const forceLogout = (reason: string = 'Session expired'): void => {
  console.warn(`🔐 ${reason} - Forcing logout`);
  console.log('🧹 Clearing all storage...');

  // Store logout reason before clearing (for showing message on login page)
  if (reason.toLowerCase().includes('another device') || reason.toLowerCase().includes('logged in elsewhere')) {
    sessionStorage.setItem('logoutReason', 'logged_in_elsewhere');
  }

  // Clear all storage (except logoutReason)
  const logoutReason = sessionStorage.getItem('logoutReason');
  localStorage.clear();
  sessionStorage.clear();
  if (logoutReason) {
    sessionStorage.setItem('logoutReason', logoutReason);
  }
  console.log('✅ localStorage and sessionStorage cleared');

  // Clear any cookies (if accessible)
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
  console.log('✅ Cookies cleared');

  // Force redirect to login (replace prevents back button)
  console.log('🔀 Redirecting to /login?expired=1');
  window.location.replace('/login?expired=1');
};

/**
 * Check if current URL indicates session expiry
 */
export const isSessionExpiredUrl = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  return params.get('expired') === '1';
};

/**
 * Show session expired message if URL indicates expiry
 */
export const showSessionExpiredMessage = (): string | null => {
  if (isSessionExpiredUrl()) {
    // Check if there's a reason in sessionStorage
    const reason = sessionStorage.getItem('logoutReason');
    sessionStorage.removeItem('logoutReason');
    
    if (reason === 'logged_in_elsewhere') {
      return 'You have been logged out because you logged in from another device.';
    }
    
    return 'Your session has expired. Please login again.';
  }
  return null;
};
