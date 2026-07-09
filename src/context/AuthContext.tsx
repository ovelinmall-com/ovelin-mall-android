import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiGet, apiPost, clearSession, restoreSession } from '../api/client';

export type User = {
  id: number;
  username: string;
  email?: string;
  displayName?: string;
  balance?: string;
  referralCode?: string;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const me = await apiGet<User>('/api/auth/me');
      setUser(me);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    // Restore session from storage into native cookie jar, then check auth
    (async () => {
      try {
        await restoreSession();
        await fetchMe();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(identifier: string, password: string) {
    await apiPost('/api/auth/login', { identifier, password });
    // After login the cookie is captured by the API client
    await fetchMe();
  }

  async function logout() {
    try { await apiPost('/api/auth/logout'); } catch {}
    await clearSession();
    setUser(null);
  }

  async function refresh() {
    await fetchMe();
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
