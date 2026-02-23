// Admin User interfaces

export interface AdminUser {
  uuid: string;
  studentId?: string;
  studentCode?: string;
  fullName?: string;
  studentFullName?: string;
  email: string;
  studentEmail?: string;
  role?: string;
  isBanned?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUsersResponse {
  success: boolean;
  code: number;
  message: string;
  error?: string;
  data: AdminUser[];
}

export interface BanUserResponse {
  success: boolean;
  code: number;
  message: string;
  error?: string;
  data: {
    message: string;
  };
}
