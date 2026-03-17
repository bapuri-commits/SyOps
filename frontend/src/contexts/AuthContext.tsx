import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

interface AuthContextType {
  authenticated: boolean;
  initializing: boolean;
  role: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const fetchUserInfo = useCallback(async (token: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRole(data.role);
        setUsername(data.username);
      }
    } catch { /* ignore */ }
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;
    const promise = (async () => {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.access_token);
          await fetchUserInfo(data.access_token);
          return data.access_token;
        }
      } catch { /* network error */ }
      setAccessToken(null);
      setRole(null);
      setUsername(null);
      return null;
    })();
    refreshPromiseRef.current = promise;
    promise.finally(() => { refreshPromiseRef.current = null; });
    return promise;
  }, [fetchUserInfo]);

  useEffect(() => {
    refreshAccessToken().finally(() => setInitializing(false));
  }, [refreshAccessToken]);

  const login = useCallback(async (u: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: u, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.access_token);
        await fetchUserInfo(data.access_token);
        return true;
      }
    } catch { /* network error */ }
    return false;
  }, [fetchUserInfo]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch { /* ignore */ }
    setAccessToken(null);
    setRole(null);
    setUsername(null);
  }, []);

  const authFetch = useCallback(
    async (url: string, options?: RequestInit): Promise<Response> => {
      const doFetch = (token: string | null) =>
        fetch(url, {
          ...options,
          headers: {
            ...options?.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

      let res = await doFetch(tokenRef.current);

      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          res = await doFetch(newToken);
        } else {
          setAccessToken(null);
          setRole(null);
          setUsername(null);
        }
      }

      return res;
    },
    [refreshAccessToken],
  );

  return (
    <AuthContext.Provider
      value={{ authenticated: !!accessToken, initializing, role, username, login, logout, authFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
