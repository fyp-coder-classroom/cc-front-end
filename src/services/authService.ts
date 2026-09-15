import API from "./api";
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
  InitiateRegistrationResponse,
  VerifyResetOtpResponse,
} from "../types/auth";

/** POST /auth/login */
export const loginAPI = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const { data } = await API.post<AuthResponse>("/auth/login", credentials);
  return data;
};

/**
 * POST /auth/register/initiate
 * Step 1 of registration - sends a 6-digit OTP to the given email.
 * No user is created in the DB yet. Returns a short-lived (3 min)
 * `registrationToken` that must be sent back along with the OTP
 * in `completeRegistrationAPI` to actually create the account.
 */
export const initiateRegistrationAPI = async (
  credentials: RegisterCredentials,
): Promise<InitiateRegistrationResponse> => {
  const { data } = await API.post<InitiateRegistrationResponse>(
    "/auth/register/initiate",
    credentials,
  );
  return data;
};

/**
 * POST /auth/register/complete
 * Step 2 of registration - verifies the OTP against the registrationToken.
 * On success the user is actually created in the DB and the response
 * shape matches login (`{ user, authTokens }`), so the caller should
 * persist auth immediately (auto-login).
 */
export const completeRegistrationAPI = async (
  registrationToken: string,
  otp: string,
): Promise<AuthResponse> => {
  const { data } = await API.post<AuthResponse>("/auth/register/complete", {
    registrationToken,
    otp,
  });
  return data;
};

/** POST /auth/logout - sends refresh token to invalidate server-side session */
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

/** GET /auth/me - fetch the current user's profile */
export const getMeAPI = async (): Promise<User> => {
  const { data } = await API.get<{ user: User }>("/auth/me");
  return data.user;
};

/**
 * POST /auth/forgot-password
 * Step 1 of password reset - sends a 6-digit OTP to the given email.
 * Response only contains a message, no token yet.
 */
export const forgotPasswordAPI = async (email: string): Promise<void> => {
  await API.post("/auth/forgot-password", { email });
};

/**
 * POST /auth/verify-reset-otp
 * Step 2 of password reset - verifies the OTP and returns a short-lived
 * (15 min) `resetToken` which must be used in `resetPasswordAPI`.
 */
export const verifyResetOtpAPI = async (
  email: string,
  otp: string,
): Promise<VerifyResetOtpResponse> => {
  const { data } = await API.post<VerifyResetOtpResponse>(
    "/auth/verify-reset-otp",
    { email, otp },
  );
  return data;
};

/**
 * POST /auth/reset-password
 * Step 3 of password reset - sets the new password using the resetToken
 * obtained from verifyResetOtpAPI. Token travels in the request body,
 * NOT as a URL query param (this is an OTP-based flow, not an email link).
 */
export const resetPasswordAPI = async (
  resetToken: string,
  newPassword: string,
): Promise<void> => {
  await API.post("/auth/reset-password", { resetToken, newPassword });
};