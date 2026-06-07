import API from "./api";
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "../types";

export const loginAPI = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>("/auth/login", credentials);
  return response.data;
};

export const registerAPI = async (
  credentials: RegisterCredentials
): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>("/auth/register", credentials);
  return response.data;
};

export const getMeAPI = async (): Promise<AuthResponse["user"]> => {
  const response = await API.get<{ user: AuthResponse["user"] }>("/auth/me");
  return response.data.user;
};