import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearSession, loadSession, saveSession } from './profile';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    loadSession()
      .then((session) => {
        if (isMounted) setAuthenticated(Boolean(session?.token));
      })
      .catch((error) => {
        console.error('Gagal memuat sesi login:', error);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(() => ({
    authenticated,
    loading,
    signIn: async (token, profile) => {
      await saveSession(token, profile);
      setAuthenticated(true);
    },
    signOut: async () => {
      await clearSession();
      setAuthenticated(false);
    },
  }), [authenticated, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return context;
}
