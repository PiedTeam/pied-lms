// User Management Interfaces

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[]; // Backend returns array of roles
  isActive: boolean;
  createdAt: string;
}

export interface GetAllUsersRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface GetAllUsersResponse {
  items: UserResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}
