/**
 * @domain store
 * @description Authentication store types and interfaces
 */

/**
 * Represents a user in the authentication system
 */
export interface User {
  uuid: string;
  email: string;
  fullName: string | null;
  role?: string;
  avatar?: string | null;
  createdAt?: string | null;
  lastLogin?: string | null;
}

/**
 * Authentication store state interface
 * Manages user authentication state, tokens, and related operations
 */
export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}
