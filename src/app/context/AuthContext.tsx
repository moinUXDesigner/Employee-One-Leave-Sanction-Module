import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AuthState, User, UserRole, LoginFormData } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  auth: AuthState | null;
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginFormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored auth on mount
  useEffect(() => {
    const storedAuth = authService.getStoredAuth();
    if (storedAuth) {
      setAuth(storedAuth);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginFormData) => {
    setIsLoading(true);
    try {
      const authState = await authService.login(credentials);
      setAuth(authState);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setAuth(null);
      // Navigate to login after logout
      if (typeof window !== 'undefined' && (window as any).navigate) {
        (window as any).navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = () => {
    const storedAuth = authService.getStoredAuth();
    setAuth(storedAuth);
  };

  const value: AuthContextType = {
    auth,
    user: auth?.user || null,
    role: auth?.role || null,
    isAuthenticated: auth?.isAuthenticated || false,
    isLoading,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
