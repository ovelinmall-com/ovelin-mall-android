import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { apiGet, apiPost, clearSession } from '../api/client';

export type User = {
  id: number;
  username: string;
  email?: string | null;
  balance: string;
  cashbackBalance?: string;
  totalSpent?: string;
  vipLevel?: string;
  referralCode: string;
  referredBy?: string | null;
  createdAt: string;
  isAdmin?: boolean;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const data = await apiGet<User>('/api/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const refresh = useCallback(async () => {
    await fetchMe();
  }, [fetchMe]);

  const logout = useCallback(async () => {
    try {
      await apiPost('/api/auth/logout');
    } catch {}
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, refresh, logout }),
    [user, isLoading, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
