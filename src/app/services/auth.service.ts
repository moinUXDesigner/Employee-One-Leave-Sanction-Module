import type { User, AuthState, LoginFormData } from '../types';
import { DEMO_CREDENTIALS, getUserByUsername } from './mockData';

const AUTH_STORAGE_KEY = 'aptransco_auth';
const MOCK_DELAY = 800;

class AuthService {
  private delay(ms: number = MOCK_DELAY) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async login(credentials: LoginFormData): Promise<AuthState> {
    await this.delay();

    const { username, password } = credentials;

    // Check demo credentials
    const validCredential = DEMO_CREDENTIALS.find(
      (cred) => cred.username === username && cred.password === password
    );

    if (!validCredential) {
      throw new Error('Invalid username or password');
    }

    // Get user data
    const user = getUserByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }

    // Create auth state
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8); // 8 hour session

    const authState: AuthState = {
      isAuthenticated: true,
      token: `mock_token_${user.userId}_${Date.now()}`,
      user,
      role: user.role,
      expiresAt: expiresAt.toISOString(),
    };

    // Store in localStorage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));

    return authState;
  }

  async logout(): Promise<void> {
    await this.delay(200);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  getStoredAuth(): AuthState | null {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    try {
      const authState: AuthState = JSON.parse(stored);

      // Check if token expired
      if (authState.expiresAt) {
        const expiry = new Date(authState.expiresAt);
        if (expiry < new Date()) {
          this.logout();
          return null;
        }
      }

      return authState;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const auth = this.getStoredAuth();
    return auth?.isAuthenticated ?? false;
  }

  getCurrentUser(): User | null {
    const auth = this.getStoredAuth();
    return auth?.user ?? null;
  }

  getCurrentRole(): string | null {
    const auth = this.getStoredAuth();
    return auth?.role ?? null;
  }

  async refreshToken(): Promise<AuthState> {
    await this.delay(500);

    const currentAuth = this.getStoredAuth();
    if (!currentAuth || !currentAuth.user) {
      throw new Error('No active session');
    }

    // Extend expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8);

    const newAuthState: AuthState = {
      ...currentAuth,
      expiresAt: expiresAt.toISOString(),
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState));

    return newAuthState;
  }
}

export const authService = new AuthService();
