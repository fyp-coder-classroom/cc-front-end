// ─────────────────────────────────────────────
// services/authService.ts
// Thin wrappers around the auth REST endpoints.
// ─────────────────────────────────────────────

import API from "./api";
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from "../types/auth";

/** POST /auth/login */
export const loginAPI = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const { data } = await API.post<AuthResponse>("/auth/login", credentials);
  return data;
};

/** POST /auth/register */
export const registerAPI = async (
  credentials: RegisterCredentials,
): Promise<AuthResponse> => {
  const { data } = await API.post<AuthResponse>("/auth/register", credentials);
  return data;
};

/** POST /auth/logout — sends refresh token to invalidate server-side session */
export const logoutAPI = async (refreshToken: string): Promise<void> => {
  await API.post("/auth/logout", { refreshToken });
};

/** POST /auth/refresh-token
 *  Backend returns the tokens object directly (no wrapper key). */
export const refreshTokenAPI = async (
  refreshToken: string,
): Promise<AuthResponse["authTokens"]> => {
  const { data } = await API.post<AuthResponse>("/auth/refresh-token", {
    refreshToken,
  });
  // backend returns { access: {...}, refresh: {...} } directly
  return (data as any).authTokens ?? (data as any).tokens ?? data;
};

/** GET /auth/me — fetch the current user's profile */
export const getMeAPI = async (): Promise<User> => {
  const { data } = await API.get<{ user: User }>("/auth/me");
  return data.user;
};
