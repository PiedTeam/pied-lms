import axios from "axios";
import type { AxiosError } from "@/interface/axios.interface";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const axiosGeneral = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Token refresh state management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

function processQueue(error: AxiosError | null, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
}

// Request interceptor - dynamically import auth store to avoid circular dependency
axiosGeneral.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const { useAuthStore } = await import("@/store/auth.store");

      // Wait for store to hydrate before accessing token
      const state = useAuthStore.getState();
      if (!state._hasHydrated) {
        // Wait for hydration to complete
        await new Promise<void>((resolve) => {
          const unsubscribe = useAuthStore.subscribe((newState) => {
            if (newState._hasHydrated) {
              unsubscribe();
              resolve();
            }
          });
          // Check again in case it hydrated while we were subscribing
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
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosGeneral.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue request and wait for refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosGeneral(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint
        const { data } = await axiosGeneral.post("/auth/refresh");

        if (process.env.NODE_ENV === "development") {
          console.log("Refresh token response:", data);
        }

        if (data.success && data.data?.accessToken) {
          const newToken = data.data.accessToken;

          // Update store FIRST
          if (typeof window !== "undefined") {
            const { useAuthStore } = await import("@/store/auth.store");
            useAuthStore.getState().setToken(newToken);
            if (process.env.NODE_ENV === "development") {
              console.log(
                "Token updated in store:",
                newToken.substring(0, 20) + "...",
              );
            }
          }

          // Process queued requests with new token
          processQueue(null, newToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          if (process.env.NODE_ENV === "development") {
            console.log("Retrying original request with new token");
          }
          return axiosGeneral(originalRequest);
        } else {
          if (process.env.NODE_ENV === "development") {
            console.error("Refresh token failed - invalid response:", data);
          }
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        const error = refreshError as AxiosError;
        if (process.env.NODE_ENV === "development") {
          console.error("Refresh token error:", error);
        }

        // Only logout if refresh token is actually invalid (401)
        if (error.response?.status === 401) {
          processQueue(error, null);

          if (typeof window !== "undefined") {
            const { useAuthStore } = await import("@/store/auth.store");
            useAuthStore.getState().logout();
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle banned user - check for 403 with banned message
    if (error.response?.status === 403) {
      const errorMessage =
        error.response?.data?.error || error.response?.data?.message || "";
      if (errorMessage.toLowerCase().includes("banned")) {
        if (typeof window !== "undefined") {
          const { useAuthStore } = await import("@/store/auth.store");
          // Show alert about account being banned
          alert(
            "Tài khoản của bạn đã bị cấm. Bạn không thể tiếp tục sử dụng hệ thống. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
          );
          // Logout and redirect to login page
          useAuthStore.getState().logout();
          window.location.href = "/login";
        }
      }
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      if (process.env.NODE_ENV === "development") {
        console.error("Resource not found:", error.config?.url);
      }
    }

    // Handle 5xx Server Errors
    if (error.response?.status >= 500) {
      if (process.env.NODE_ENV === "development") {
        console.error("Server error:", error.response?.status, error.message);
      }
    }

    // Handle network errors
    if (!error.response) {
      if (process.env.NODE_ENV === "development") {
        console.error("Network error:", error.message);
      }
    }

    // Log all errors for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    return Promise.reject(error);
  },
);
