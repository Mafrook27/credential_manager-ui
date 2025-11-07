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
  checkInterval: 60 * 1000, // Check every minute
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
   */
  private async checkAndRefresh(): Promise<void> {
    if (!this.isActive) return;

    try {
      // In a real implementation, you would check token expiry time
      // For now, we rely on the backend's automatic refresh mechanism
      // This is just a placeholder for future enhancements

      // You could store token expiry time in localStorage and check it here
      // const tokenExpiry = localStorage.getItem('tokenExpiry');
      // if (tokenExpiry && Date.now() > parseInt(tokenExpiry) - this.config.refreshBeforeExpiry) {
      //   await refreshToken();
      // }
    } catch (error) {
      console.error('❌ Session refresh failed:', error);
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
