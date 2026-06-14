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

interface AuthContextValue {
  user:      User | null;
  token:     string | null;
  isLoading: boolean;
  login:     (credentials: LoginCredentials)    => Promise<void>;
  register:  (credentials: RegisterCredentials) => Promise<void>;
  logout:    () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user,      setUser]      = useState<User | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Rehydrate on app boot
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedUser  = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      }
    } catch {
      clearAuthStorage();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistAuth = useCallback(
    (authUser: User, accessToken: string, refreshToken: string) => {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN,  accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
      setToken(accessToken);
      setUser(authUser);
    },
    [],
  );

  // Login - token save + user save
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const res = await loginAPI(credentials);
      persistAuth(
        res.user,
        res.authTokens.access.token,
        res.authTokens.refresh.token,
      );
    },
    [persistAuth],
  );

  // Register - user need to signin after registration, so no token save here
  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      await registerAPI(credentials);
      // NO persistAuth — by design
    },
    [],
  );

  // Logout
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    try {
      if (refreshToken) await logoutAPI(refreshToken);
    } catch {
      // ignore
    } finally {
      clearAuthStorage();
      setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};