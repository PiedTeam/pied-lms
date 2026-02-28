import { useMutation } from "@tanstack/react-query";
import { axiosGeneral as axios } from "@/common/axios";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  LogoutResponse,
} from "@/interface/auth/auth.interface";
import type { ApiResponse } from "@/interface";
import { AUTH_MESSAGES } from "@/constants";
import type { User } from "@/store/auth.store";

// Helper function to decode JWT token
function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterRequest): Promise<RegisterResponse> => {
      try {
        const { data } = await axios.post<ApiResponse<RegisterResponse>>(
          "/auth/register",
          payload,
        );

        if (!data.success || !data.data) {
          // Check if there are validation errors in the errors object
          if (data.errors && typeof data.errors === "object") {
            const errorMessages: string[] = [];
            Object.entries(data.errors).forEach(([, value]) => {
              if (Array.isArray(value)) {
                errorMessages.push(...value);
              } else if (typeof value === "string") {
                errorMessages.push(value);
              }
            });
            if (errorMessages.length > 0) {
              throw new Error(errorMessages.join(" "));
            }
          }
          throw new Error(data.message || AUTH_MESSAGES.ERROR.REGISTER_FAILED);
        }

        return data.data;
      } catch (error: unknown) {
        // Handle axios error response
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: {
              data?: {
                errors?: Record<string, string | string[]>;
                message?: string;
              };
            };
          };
          const errorData = axiosError.response?.data;

          if (errorData) {
            // Check for validation errors in errors object
            if (errorData.errors && typeof errorData.errors === "object") {
              const errorMessages: string[] = [];
              Object.entries(errorData.errors).forEach(([, value]) => {
                if (Array.isArray(value)) {
                  errorMessages.push(...value);
                } else if (typeof value === "string") {
                  errorMessages.push(value);
                }
              });
              if (errorMessages.length > 0) {
                throw new Error(errorMessages.join(" "));
              }
            }

            // Use message from response
            if (errorData.message) {
              throw new Error(errorData.message);
            }
          }
        }

        // Re-throw if already an Error object
        if (error instanceof Error) {
          throw error;
        }

        throw new Error(AUTH_MESSAGES.ERROR.REGISTER_FAILED);
      }
    },
    onSuccess: async (data) => {
      const { useAuthStore } = await import("@/store/auth.store");

      // Decode JWT to get role and other info
      const decodedToken = decodeJWT(data.accessToken);
      const role =
        (decodedToken?.[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] as string) || "Student";
      const email =
        (decodedToken?.[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ] as string) || data.email;
      const firstName =
        (decodedToken?.["FirstName"] as string) || data.firstName || "";
      const lastName =
        (decodedToken?.["LastName"] as string) || data.lastName || "";
      const uuid =
        (decodedToken?.[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] as string) || "";

      const user: User = {
        uuid,
        email,
        fullName: `${firstName} ${lastName}`.trim() || null,
        role,
      };

      // Note: refreshToken is stored in HTTP-only cookie by backend
      // We only store the accessToken in frontend
      useAuthStore.getState().login(data.accessToken, user);
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginRequest): Promise<LoginResponse> => {
      try {
        const { data } = await axios.post<ApiResponse<LoginResponse>>(
          "/auth/login",
          payload,
        );

        if (!data.success || !data.data) {
          // Check if there are validation errors in the errors object
          if (data.errors && typeof data.errors === "object") {
            const errorMessages: string[] = [];
            Object.entries(data.errors).forEach(([, value]) => {
              if (Array.isArray(value)) {
                errorMessages.push(...value);
              } else if (typeof value === "string") {
                errorMessages.push(value);
              }
            });
            if (errorMessages.length > 0) {
              throw new Error(errorMessages.join(" "));
            }
          }
          throw new Error(data.message || AUTH_MESSAGES.ERROR.LOGIN_FAILED);
        }

        return data.data;
      } catch (error: unknown) {
        // Handle axios error response
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: {
              data?: {
                errors?: Record<string, string | string[]>;
                message?: string;
              };
            };
          };
          const errorData = axiosError.response?.data;

          if (errorData) {
            // Check for validation errors in errors object
            if (errorData.errors && typeof errorData.errors === "object") {
              const errorMessages: string[] = [];
              Object.entries(errorData.errors).forEach(([, value]) => {
                if (Array.isArray(value)) {
                  errorMessages.push(...value);
                } else if (typeof value === "string") {
                  errorMessages.push(value);
                }
              });
              if (errorMessages.length > 0) {
                throw new Error(errorMessages.join(" "));
              }
            }

            // Use message from response
            if (errorData.message) {
              throw new Error(errorData.message);
            }
          }
        }

        // Re-throw if already an Error object
        if (error instanceof Error) {
          throw error;
        }

        throw new Error(AUTH_MESSAGES.ERROR.LOGIN_FAILED);
      }
    },
    onSuccess: async (data) => {
      const { useAuthStore } = await import("@/store/auth.store");

      // Decode JWT to get role and other info
      const decodedToken = decodeJWT(data.accessToken);
      const role =
        (decodedToken?.[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] as string) || "Student";
      const email =
        (decodedToken?.[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ] as string) || data.email;
      const firstName =
        (decodedToken?.["FirstName"] as string) || data.firstName || "";
      const lastName =
        (decodedToken?.["LastName"] as string) || data.lastName || "";
      const uuid =
        (decodedToken?.[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] as string) || "";

      const user: User = {
        uuid,
        email,
        fullName: `${firstName} ${lastName}`.trim() || null,
        role,
      };

      // Note: refreshToken is stored in HTTP-only cookie by backend
      // We only store the accessToken in frontend
      useAuthStore.getState().login(data.accessToken, user);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async (): Promise<LogoutResponse> => {
      const { data } = await axios.post<ApiResponse<null>>("/auth/logout");

      if (!data.success) {
        throw new Error(data.message || AUTH_MESSAGES.ERROR.LOGOUT_FAILED);
      }

      return {
        success: true,
        message: data.message || AUTH_MESSAGES.SUCCESS.LOGOUT,
      };
    },
    onSuccess: async () => {
      const { useAuthStore } = await import("@/store/auth.store");
      useAuthStore.getState().logout();
    },
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: async (): Promise<RefreshResponse> => {
      // Note: refreshToken is automatically sent via HTTP-only cookie
      // Backend will read it from cookie and return new accessToken
      const { data } =
        await axios.post<ApiResponse<RefreshResponse>>("/auth/refresh");

      if (!data.success || !data.data) {
        throw new Error(
          data.message || AUTH_MESSAGES.ERROR.TOKEN_REFRESH_FAILED,
        );
      }

      return data.data;
    },
    onSuccess: async (data) => {
      const { useAuthStore } = await import("@/store/auth.store");
      // Only update accessToken, refreshToken stays in HTTP-only cookie
      useAuthStore.getState().setToken(data.accessToken);
    },
  });
}
