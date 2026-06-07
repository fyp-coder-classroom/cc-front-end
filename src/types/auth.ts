// ─────────────────────────────────────────────
// types/auth.ts
// Shared auth-related TypeScript types.
// ─────────────────────────────────────────────

export type Role = "student" | "teacher";

export interface User {
  id: string;
  name: string; // matches backend: single "name" field
  email: string;
  role: Role;
}

export interface Tokens {
  access: {
    token: string;
    expires: string; // ISO date string
  };
  refresh: {
    token: string;
    expires: string;
  };
}

/** Shape returned by POST /auth/login and POST /auth/register.
 *  Backend uses "authTokens" — "tokens" kept for forward compat. */
export interface AuthResponse {
  user: User;
  authTokens: Tokens; // actual backend key
  tokens?: Tokens; // alias, in case backend is updated later
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: Role;
}
