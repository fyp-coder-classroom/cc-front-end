export type Role = "student" | "teacher";

export interface User {
  id:    string;
  name:  string;
  email: string;
  role:  Role;
}

export interface Tokens {
  access: {
    token:   string;
    expires: string;
  };
  refresh: {
    token:   string;
    expires: string;
  };
}

export interface AuthResponse {
  user:       User;
  authTokens: Tokens;
}

export interface LoginCredentials {
  email:    string;
  password: string;
}

export interface RegisterCredentials {
  name:     string;
  email:    string;
  password: string;
  role:     Role;
}

/** Response from POST /auth/register/initiate */
export interface InitiateRegistrationResponse {
  message: string;
  registrationToken: string;
}

/** Response from POST /auth/verify-reset-otp */
export interface VerifyResetOtpResponse {
  message: string;
  resetToken: string;
}