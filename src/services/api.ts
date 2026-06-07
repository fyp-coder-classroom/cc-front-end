// ─────────────────────────────────────────────
// services/api.ts
// Axios instance with:
//   • Auth header injection
//   • Automatic token refresh on 401
//   • Clean logout on refresh failure
// ─────────────────────────────────────────────

import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";

// ── Storage keys ────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "cc_access_token",
  REFRESH_TOKEN: "cc_refresh_token",
  USER: "cc_user",
} as const;

// ── Axios instance ───────────────────────────
const API: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// ── Request interceptor — attach Bearer token ─
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ── Dev request/response logger ──────────────
// Colour-coded logs in DevTools. Auto-disabled in production.
if (import.meta.env.DEV) {
  API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    console.groupCollapsed(
      `%c▲ ${config.method?.toUpperCase()} ${config.url}`,
      "color:#7dd3fc;font-weight:bold",
    );
    if (config.params) console.log("Params →", config.params);
    if (config.data) {
      try {
        console.log("Body   →", JSON.parse(config.data as string));
      } catch {
        console.log("Body   →", config.data);
      }
    }
    const t = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    console.log("Token  →", t ? `${t.slice(0, 20)}…` : "none");
    console.groupEnd();
    return config;
  });

  API.interceptors.response.use(
    (response: AxiosResponse) => {
      console.groupCollapsed(
        `%c✔ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        "color:#86efac;font-weight:bold",
      );
      console.log("Data   →", response.data);
      console.groupEnd();
      return response;
    },
    (error: AxiosError) => {
      console.groupCollapsed(
        `%c✖ ${error.response?.status ?? "NET_ERR"} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        "color:#fca5a5;font-weight:bold",
      );
      console.log("Error  →", error.response?.data ?? error.message);
      console.groupEnd();
      return Promise.reject(error);
    },
  );
}

// ── Tracks whether a refresh is already in-flight
//    so that concurrent 401s don't trigger multiple refreshes.
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
};

// ── Response interceptor — refresh on 401 ────
API.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401, and not for auth endpoints themselves
    const isAuthRoute = originalRequest.url?.includes("/auth/");
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthRoute
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    // No refresh token — hard logout
    if (!refreshToken) {
      clearAuthStorage();
      window.location.href = "/";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the ongoing refresh resolves
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(API(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${API.defaults.baseURL}/auth/refresh-token`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );

      // backend returns authTokens key
      const tokenBundle = data.authTokens ?? data.tokens ?? data;
      const newAccessToken: string = tokenBundle.access.token;
      const newRefreshToken: string = tokenBundle.refresh.token;

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

      API.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);
      return API(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthStorage();
      window.location.href = "/";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export default API;
