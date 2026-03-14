import axios from "axios";
import type { AxiosError } from "@/interface/axios.interface";
import { forceLogout, registerAuthCleanup } from "@/utils/auth-session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const axiosGeneral = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token || "");
    }
  });

  failedQueue = [];
}

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;

  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout") ||
    url.includes("/auth/reset-password")
  );
}

registerAuthCleanup(() => {
  isRefreshing = false;
  processQueue(new Error("Session terminated"), null);
});

axiosGeneral.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const { useAuthStore } = await import("@/store/auth.store");
      const state = useAuthStore.getState();

      if (!state._hasHydrated) {
        await new Promise<void>((resolve) => {
          const unsubscribe = useAuthStore.subscribe((newState) => {
            if (newState._hasHydrated) {
              unsubscribe();
              resolve();
            }
          });

          if (useAuthStore.getState()._hasHydrated) {
            unsubscribe();
            resolve();
          }
        });
      }

      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosGeneral.interceptors.response.use(
  (response) => response,
  async (rawError) => {
    const error = rawError as AxiosError & {
      config?: Record<string, unknown> & {
        _retry?: boolean;
        headers?: Record<string, string>;
        url?: string;
        method?: string;
      };
    };

    const originalRequest = error.config;
    const originalUrl = originalRequest?.url;
    const shouldSkipRefresh = isAuthEndpoint(originalUrl);

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosGeneral(originalRequest);
          })
          .catch((queueError) => Promise.reject(queueError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axiosGeneral.post("/auth/refresh", undefined, {
          headers: {
            "x-skip-auth-refresh": "true",
          },
        });

        if (!data.success || !data.data?.accessToken) {
          throw new Error(data?.message || "Token refresh failed");
        }

        const newToken = data.data.accessToken;

        if (typeof window !== "undefined") {
          const { useAuthStore } = await import("@/store/auth.store");
          useAuthStore.getState().setToken(newToken);
        }

        processQueue(null, newToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosGeneral(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await forceLogout({ reason: "refresh-token-failed" });
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      const errorMessage =
        error.response?.data?.error || error.response?.data?.message || "";

      if (errorMessage.toLowerCase().includes("banned")) {
        await forceLogout({ reason: "account-banned" });
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", {
        url: originalUrl,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    return Promise.reject(error);
  },
);
