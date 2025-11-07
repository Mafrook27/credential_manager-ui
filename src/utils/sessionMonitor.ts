/**
 * Session Monitor Utility
 * Monitors user activity and manages session lifecycle
 */

import { refreshToken } from '../features/auth/api';

interface SessionConfig {
  // Time before access token expires to trigger refresh (in milliseconds)
  refreshBeforeExpiry: number;
  // Interval to check for token refresh (in milliseconds)
  checkInterval: number;
  // Enable activity-based refresh
  activityBasedRefresh: boolean;
}

const DEFAULT_CONFIG: SessionConfig = {
  refreshBeforeExpiry: 60 * 1000, // 1 minute before expiry
  checkInterval: 2 * 60 * 1000, // Check every 2 minutes (only for idle users)
  activityBasedRefresh: true,
};

class SessionMonitor {
  private config: SessionConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();
  private isActive: boolean = false;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupActivityListeners();
  }

  /**
   * Start monitoring session
   */
  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.lastActivity = Date.now();

    // Set up periodic check for token refresh
    this.intervalId = setInterval(() => {
      this.checkAndRefresh();
    }, this.config.checkInterval);

    console.log('🔐 Session monitor started');
  }

  /**
   * Stop monitoring session
   */
  stop(): void {
    if (!this.isActive) return;

    this.isActive = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('🔐 Session monitor stopped');
  }

  /**
   * Setup activity listeners to track user interaction
   * Note: Session validation happens automatically on every API call via axios interceptor
   * This just tracks activity timestamp
   */
  private setupActivityListeners(): void {
    if (!this.config.activityBasedRefresh) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const updateActivity = () => {
      this.lastActivity = Date.now();
    };

    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });
  }

  /**
   * Check if token needs refresh and perform refresh
   * This only runs for idle users (every 2 minutes)
   * Active users get instant validation on every API call via axios interceptor
   */
  private async checkAndRefresh(): Promise<void> {
    if (!this.isActive) return;

    try {
      // Check if session is still valid by calling refresh endpoint
      // This catches idle users who haven't made any API calls
      console.log('🔍 Periodic session check for idle user...');
      await refreshToken();
      console.log('✅ Session is valid');
    } catch (error: any) {
      // Session is invalid - user will be logged out by axios interceptor
      console.error('❌ Session check failed:', error?.response?.data?.message || error.message);
      
      // Stop monitoring since session is invalid
      this.stop();
    }
  }

  /**
   * Manually trigger token refresh
   */
  async refresh(): Promise<void> {
    try {
      await refreshToken();
      console.log('✅ Token refreshed successfully');
    } catch (error) {
      console.error('❌ Manual token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Get time since last activity (in milliseconds)
   */
  getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivity;
  }

  /**
   * Check if user is currently active
   */
  isUserActive(): boolean {
    return this.isActive;
  }
}

// Export singleton instance
export const sessionMonitor = new SessionMonitor();

// Export class for custom instances
export default SessionMonitor;
