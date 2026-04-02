import { create } from "zustand";
import { persist } from "zustand/middleware";
import { decodeJwtToken, isTokenExpired } from "@/utils/jwt.utils";
import type { User, AuthState } from "@/interface/store/auth.types";

export type { User, AuthState } from "@/interface/store/auth.types";

// Cross-tab communication channel
let broadcastChannel: BroadcastChannel | null = null;

// Session expiry timers
let expiryTimer: NodeJS.Timeout | null = null;
let periodicCheckInterval: NodeJS.Timeout | null = null;

// Clear all session expiry timers
function clearExpiryTimers(): void {
  if (expiryTimer) {
    clearTimeout(expiryTimer);
    expiryTimer = null;
  }
  if (periodicCheckInterval) {
    clearInterval(periodicCheckInterval);
    periodicCheckInterval = null;
  }
}

// Handle token expiry by calling forceLogout
async function handleTokenExpiry(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  clearExpiryTimers();

  try {
    const { forceLogout } = await import("@/utils/auth-session");
    await forceLogout({ reason: "Session expired" });
  } catch (error) {
    console.error("[auth] Error during token expiry logout:", error);
    // Fallback: redirect to login page
    window.location.replace("/login");
  }
}

// Check if current token is expired and handle it
async function checkTokenExpiry(): Promise<void> {
  const state = useAuthStore.getState();

  if (!state.token || !state.isAuthenticated) {
    clearExpiryTimers();
    return;
  }

  if (isTokenExpired(state.token)) {
    await handleTokenExpiry();
  }
}

// Setup session expiry detection for a token
function setupExpiryDetection(token: string | null): void {
  // Clear any existing timers
  clearExpiryTimers();

  if (!token || typeof window === "undefined") {
    return;
  }

  // Decode token to get expiry time
  const payload = decodeJwtToken(token);
  if (!payload || !payload.exp) {
    return;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const expiryTime = payload.exp;
  const timeUntilExpiry = expiryTime - currentTime;

  // If token is already expired, logout immediately
  if (timeUntilExpiry <= 0) {
    handleTokenExpiry();
    return;
  }

  // Set timer to logout when token expires
  // Convert seconds to milliseconds
  const timeoutMs = timeUntilExpiry * 1000;
  expiryTimer = setTimeout(() => {
    handleTokenExpiry();
  }, timeoutMs);

  // Setup periodic check every 30 seconds as backup
  periodicCheckInterval = setInterval(() => {
    checkTokenExpiry();
  }, 30000); // 30 seconds
}

// Helper function to get dashboard route based on user role
function getDashboardRoute(role?: string): string {
  switch (role?.toLowerCase()) {
    case "teacher":
      return "/teacher/dashboard";
    case "mentor":
      return "/mentor/dashboard";
    case "admin":
      return "/admin";
    case "student":
    default:
      return "/dashboard";
  }
}

// Helper function to handle cross-tab auth state changes
function handleCrossTabAuthChange(newState: {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}): void {
  const currentState = useAuthStore.getState();

  // Only process if state actually changed
  if (
    currentState.token === newState.token &&
    currentState.isAuthenticated === newState.isAuthenticated &&
    currentState.user?.role === newState.user?.role
  ) {
    return;
  }

  // Update store state
  useAuthStore.setState({
    token: newState.token,
    user: newState.user,
    isAuthenticated: newState.isAuthenticated,
  });

  // Handle redirects based on auth state changes
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;

    // If user logged in on another tab and we're on login page, redirect to dashboard
    if (newState.isAuthenticated && currentPath === "/login") {
      const dashboardRoute = getDashboardRoute(newState.user?.role);
      window.location.replace(dashboardRoute);
    }

    // If user logged out on another tab and we're on a protected page, redirect to login
    if (
      !newState.isAuthenticated &&
      currentPath !== "/login" &&
      currentPath !== "/register"
    ) {
      window.location.replace("/login");
    }

    // If user role changed on another tab (e.g., logout admin and login student)
    // and we're on a role-specific page, redirect to appropriate dashboard
    if (
      newState.isAuthenticated &&
      currentState.user?.role !== newState.user?.role &&
      currentState.isAuthenticated
    ) {
      // Check if current path is a role-specific route
      const isStudentRoute =
        currentPath.startsWith("/dashboard") ||
        currentPath.startsWith("/exam-rooms") ||
        currentPath.startsWith("/quizzes") ||
        currentPath.startsWith("/profile");
      const isTeacherRoute = currentPath.startsWith("/teacher");
      const isMentorRoute = currentPath.startsWith("/mentor");
      const isAdminRoute = currentPath.startsWith("/admin");

      const newRole = newState.user?.role?.toLowerCase();
      const isNewRoleStudent = newRole === "student";
      const isNewRoleTeacher = newRole === "teacher";
      const isNewRoleMentor = newRole === "mentor";
      const isNewRoleAdmin = newRole === "admin";

      // If current route doesn't match new role, redirect to appropriate dashboard
      if (
        (isStudentRoute && !isNewRoleStudent) ||
        (isTeacherRoute && !isNewRoleTeacher) ||
        (isMentorRoute && !isNewRoleMentor) ||
        (isAdminRoute && !isNewRoleAdmin)
      ) {
        const dashboardRoute = getDashboardRoute(newState.user?.role);
        window.location.replace(dashboardRoute);
      }
    }
  }
}

// Initialize cross-tab synchronization
function initCrossTabSync(): (() => void) | void {
  if (typeof window === "undefined") {
    return;
  }

  // Try to use BroadcastChannel API (modern browsers)
  if (typeof BroadcastChannel !== "undefined") {
    try {
      broadcastChannel = new BroadcastChannel("auth-channel");

      broadcastChannel.onmessage = (event: MessageEvent) => {
        if (event.data?.type === "AUTH_STATE_CHANGE") {
          handleCrossTabAuthChange(event.data.state);
        }
      };
    } catch {
      console.warn(
        "[auth] BroadcastChannel not available, falling back to StorageEvent",
      );
      broadcastChannel = null;
    }
  }

  // StorageEvent listener as fallback (works in all browsers)
  const handleStorageChange = (event: StorageEvent): void => {
    // Only process changes to our auth storage key
    if (event.key !== "auth-storage" || event.newValue === null) {
      return;
    }

    try {
      const newAuthState = JSON.parse(event.newValue);
      const state = newAuthState.state;

      if (state) {
        handleCrossTabAuthChange({
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        });
      }
    } catch {
      // Ignore parse errors
    }
  };

  window.addEventListener("storage", handleStorageChange);

  // Return cleanup function
  return (): void => {
    if (broadcastChannel) {
      broadcastChannel.close();
      broadcastChannel = null;
    }
    window.removeEventListener("storage", handleStorageChange);
  };
}

// Broadcast auth state changes to other tabs
function broadcastAuthStateChange(state: {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}): void {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: "AUTH_STATE_CHANGE",
        state,
      });
    } catch {
      // Ignore broadcast errors
    }
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setToken: (token: string | null): void => {
        const newState = {
          token,
          isAuthenticated: !!token,
        };
        set(newState);
        // Setup expiry detection for new token
        setupExpiryDetection(token);
        // Broadcast to other tabs
        broadcastAuthStateChange({
          token,
          user: useAuthStore.getState().user,
          isAuthenticated: !!token,
        });
      },
      setUser: (user: User | null): void => {
        set({
          user,
        });
        // Broadcast to other tabs
        const state = useAuthStore.getState();
        broadcastAuthStateChange({
          token: state.token,
          user,
          isAuthenticated: state.isAuthenticated,
        });
      },
      login: (accessToken: string, user: User): void => {
        const newState = {
          token: accessToken,
          user,
          isAuthenticated: !!accessToken,
        };
        set(newState);
        // Setup expiry detection for new token
        setupExpiryDetection(accessToken);
        // Broadcast to other tabs
        broadcastAuthStateChange(newState);
      },
      logout: (): void => {
        // Clear expiry timers
        clearExpiryTimers();
        // Clear auth data but preserve exam scores
        const newState = {
          token: null,
          user: null,
          isAuthenticated: false,
        };
        set(newState);
        // Broadcast to other tabs
        broadcastAuthStateChange(newState);
        // Note: exam_scores in localStorage will NOT be cleared
        // Only auth-storage will be cleared by zustand persist
      },
      setHasHydrated: (state: boolean): void => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage:
        () =>
        (state: AuthState | undefined, error: unknown): void => {
          if (!error && state) {
            state.setHasHydrated(true);
            // Setup expiry detection for hydrated token
            if (state.token) {
              setupExpiryDetection(state.token);
            }
          } else {
            // If there's an error or no state, still mark as hydrated
            // This handles the case where there's no stored data
            useAuthStore.getState().setHasHydrated(true);
          }
        },
    },
  ),
);

// Initialize cross-tab sync when module loads (client-side only)
if (typeof window !== "undefined") {
  initCrossTabSync();
}
