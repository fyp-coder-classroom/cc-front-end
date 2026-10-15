import {createContext, useContext, useEffect, useState, useCallback, type FC, type ReactNode} from "react";
import type {User, LoginCredentials, RegisterCredentials} from "../types/auth";
import {loginAPI, initiateRegistrationAPI, completeRegistrationAPI, logoutAPI} from "../services/authService";
import {clearAuthStorage, STORAGE_KEYS } from "../services/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  initiateRegistration: (
    credentials: RegisterCredentials,
  ) => Promise<{ registrationToken: string }>;
  completeRegistration: (registrationToken: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Rehydrate on app boot
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
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
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
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

  // Registration step 1 - just sends the OTP, no user created yet,
  const initiateRegistration = useCallback(
    async (credentials: RegisterCredentials) => {
      const res = await initiateRegistrationAPI(credentials);
      return { registrationToken: res.registrationToken };
    },
    [],
  );

  // Registration step 2 - verifies the OTP, the user is actually created
  // on the backend, and the response looks just like login's response
  // (`{ user, authTokens }`), so we auto-login immediately.
  const completeRegistration = useCallback(
    async (registrationToken: string, otp: string) => {
      const res = await completeRegistrationAPI(registrationToken, otp);
      persistAuth(
        res.user,
        res.authTokens.access.token,
        res.authTokens.refresh.token,
      );
    },
    [persistAuth],
  );

  // Logout
    const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    try {
      if (refreshToken) await logoutAPI(refreshToken);
    } catch { 
      //ignore 
      }
    finally {
      // Thodi delay de ke smooth feel aaye
      setTimeout(() => {
        clearAuthStorage();
        setToken(null);
        setUser(null);
      }, 150);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        initiateRegistration,
        completeRegistration,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};