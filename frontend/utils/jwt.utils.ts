import type { JwtPayload } from "@/interface/auth/auth.interface";

/**
 * Decode JWT token without verification
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJwtToken(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 * @param token - JWT token string
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtToken(token);
  if (!payload || !payload.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Get user role from JWT token
 * @param token - JWT token string
 * @returns User role or null
 */
export function getRoleFromToken(token: string): string | null {
  const payload = decodeJwtToken(token);
  if (!payload) return null;

  return (
    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    null
  );
}

/**
 * Get user ID from JWT token
 * @param token - JWT token string
 * @returns User ID or null
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJwtToken(token);
  if (!payload) return null;

  return (
    payload[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] || null
  );
}

/**
 * Get user email from JWT token
 * @param token - JWT token string
 * @returns User email or null
 */
export function getEmailFromToken(token: string): string | null {
  const payload = decodeJwtToken(token);
  if (!payload) return null;

  return (
    payload[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    ] || null
  );
}
