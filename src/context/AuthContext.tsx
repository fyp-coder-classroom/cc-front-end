// ─────────────────────────────────────────────
// context/AuthContext.tsx
// Global auth state. Wraps the whole app.
//
// Provides:
//   user        – parsed User object or null
//   token       – current access token or null
//   isLoading   – true while the initial session check runs
//   login()     – calls /auth/login, stores tokens, sets state
//   register()  – calls /auth/register, stores tokens, sets state
//   logout()    – calls /auth/logout, clears storage, resets state
// ─────────────────────────────────────────────

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type FC,
  type ReactNode,
} from "react";

import type {
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth";
import { loginAPI, registerAPI, logoutAPI } from "../services/authService";
import { clearAuthStorage, STORAGE_KEYS } from "../services/api";

// ── Context shape ────────────────────────────

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// ── Context creation ─────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ─────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ── Rehydrate from localStorage on app boot ─
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      }
    } catch {
      // Corrupted storage — start fresh
      clearAuthStorage();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Persist auth state to localStorage ───────
  const persistAuth = useCallback(
    (
      authUser: User,
      tokens: {
        access: { token: string; expires: string | Date };
        refresh: { token: string; expires: string | Date };
      },
    ) => {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access.token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
      setToken(tokens.access.token);
      setUser(authUser);
    },
    [],
  );

  // ── login ─────────────────────────────────────
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const res = await loginAPI(credentials);
      persistAuth(res.user, res.tokens ?? res.authTokens);
    },
    [persistAuth],
  );

  // ── register ──────────────────────────────────
  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      const res = await registerAPI(credentials);
      persistAuth(res.user, res.tokens ?? res.authTokens);
    },
    [persistAuth],
  );

  // ── logout ────────────────────────────────────
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    try {
      // Best-effort server-side invalidation
      if (refreshToken) await logoutAPI(refreshToken);
    } catch {
      // Ignore — local cleanup always happens
    } finally {
      clearAuthStorage();
      setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
};
