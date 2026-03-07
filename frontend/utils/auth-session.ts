import { queryClient } from "@/utils/query-client";

type AuthCleanupHandler = () => void;

const authCleanupHandlers = new Set<AuthCleanupHandler>();
let isForceLoggingOut = false;

export function registerAuthCleanup(handler: AuthCleanupHandler): () => void {
  authCleanupHandlers.add(handler);
  return () => authCleanupHandlers.delete(handler);
}

export async function forceLogout({
  redirectTo = "/login",
  reason,
}: {
  redirectTo?: string;
  reason?: string;
} = {}): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (isForceLoggingOut) {
    return;
  }

  isForceLoggingOut = true;

  if (process.env.NODE_ENV === "development" && reason) {
    console.warn(`[auth] force logout: ${reason}`);
  }

  // Broadcast logout to other tabs immediately
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("auth-channel");
      channel.postMessage({
        type: "AUTH_STATE_CHANGE",
        state: {
          token: null,
          user: null,
          isAuthenticated: false,
        },
      });
      channel.close();
    }
  } catch {
    // Ignore broadcast errors, logout must continue
  }

  authCleanupHandlers.forEach((handler: AuthCleanupHandler) => {
    try {
      handler();
    } catch {
      // Ignore cleanup errors, logout must continue.
    }
  });

  try {
    const { useAuthStore } = await import("@/store/auth.store");
    useAuthStore.getState().logout();
  } catch {
    // Ignore store cleanup error.
  }

  try {
    await queryClient.cancelQueries();
    queryClient.clear();
  } catch {
    // Ignore query cleanup error.
  }

  window.location.replace(redirectTo);
}
