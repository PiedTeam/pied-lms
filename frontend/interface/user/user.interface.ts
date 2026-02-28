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
<<<<<<< HEAD
  role: string;
  createdAt: string;
  lastLogin: string | null;
=======
  roles: string[]; // Backend returns array of roles
  isActive: boolean;
  createdAt: string;
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
  totalPages: number;
=======
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
}
