import { queryClient } from "@/lib/query-client";

type AuthCleanupHandler = () => void;

const authCleanupHandlers = new Set<AuthCleanupHandler>();
let isForceLoggingOut = false;

export function registerAuthCleanup(handler: AuthCleanupHandler) {
  authCleanupHandlers.add(handler);
  return () => authCleanupHandlers.delete(handler);
}

export async function forceLogout({
  redirectTo = "/login",
  reason,
}: {
  redirectTo?: string;
  reason?: string;
} = {}) {
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

  authCleanupHandlers.forEach((handler) => {
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
