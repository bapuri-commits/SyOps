import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface AuthContextType {
  authenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function toBase64(str: string): string {
  return btoa(
    new TextEncoder()
      .encode(str)
      .reduce((acc, byte) => acc + String.fromCharCode(byte), ""),
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [creds, setCreds] = useState<string | null>(
    () => sessionStorage.getItem("syops_auth"),
  );

  const login = useCallback(async (password: string) => {
    const encoded = toBase64(`admin:${password}`);
    try {
      const res = await fetch("/api/metrics", {
        headers: { Authorization: `Basic ${encoded}` },
      });
      if (res.ok) {
        sessionStorage.setItem("syops_auth", encoded);
        setCreds(encoded);
        return true;
      }
    } catch { /* network error */ }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("syops_auth");
    setCreds(null);
  }, []);

  const authFetch = useCallback(
    async (url: string, options?: RequestInit): Promise<Response> => {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          ...(creds ? { Authorization: `Basic ${creds}` } : {}),
        },
      });
      if (res.status === 401) {
        sessionStorage.removeItem("syops_auth");
        setCreds(null);
      }
      return res;
    },
    [creds],
  );

  return (
    <AuthContext.Provider
      value={{ authenticated: !!creds, login, logout, authFetch }}
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
