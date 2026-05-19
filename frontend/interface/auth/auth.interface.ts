// Complete authentication interfaces for all auth operations

// Register
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken?: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
}

// Refresh
export type RefreshRequest = Record<string, never>; // Empty object type

export interface RefreshResponse {
  accessToken: string;
}

// Logout
export type LogoutRequest = Record<string, never>; // Empty object type

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// Reset Password
export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// JWT Token Payload
export interface JwtPayload {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  FirstName: string;
  LastName: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  exp: number;
  iss: string;
  aud: string;
}
