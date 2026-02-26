import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosGeneral as axios } from "@/common/axios";
import type { ApiResponse } from "@/interface";
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  UserResponse,
  GetAllUsersRequest,
  GetAllUsersResponse,
} from "@/interface/user/user.interface";

// Change Password
export function useChangePassword() {
  return useMutation({
    mutationFn: async (
      payload: ChangePasswordRequest,
    ): Promise<ChangePasswordResponse> => {
      const { data } = await axios.post<ApiResponse<string>>(
        "/auth/change-password",
        payload,
      );

      if (!data.success) {
        throw new Error(data.message || "Failed to change password");
      }

      return {
        success: true,
        message: data.message || "Đổi mật khẩu thành công",
      };
    },
  });
}

// Get User By ID
export function useGetUserById(userId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async (): Promise<UserResponse> => {
      const { data } = await axios.get<ApiResponse<UserResponse>>(
        `/auth/users/${userId}`,
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "User not found");
      }

      return data.data;
    },
    enabled: enabled && !!userId,
  });
}

// Get All Users
export function useGetAllUsers(params: GetAllUsersRequest = {}) {
  const { pageNumber = 1, pageSize = 10 } = params;

  return useQuery({
    queryKey: ["users", pageNumber, pageSize],
    queryFn: async (): Promise<GetAllUsersResponse> => {
      const { data } = await axios.get<ApiResponse<GetAllUsersResponse>>(
        "/auth/users",
        {
          params: {
            pageNumber,
            pageSize,
          },
        },
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to load users list");
      }

      return data.data;
    },
    retry: 1, // Only retry once
    staleTime: 30000, // 30 seconds
  });
}

// Get count of users with student role
export function useGetStudentCount() {
  return useQuery({
    queryKey: ["users", "count", "student"],
    queryFn: async (): Promise<number> => {
      const { data } = await axios.get<ApiResponse<GetAllUsersResponse>>(
        "/auth/students",
        {
          params: {
            pageNumber: 1,
            pageSize: 10,
          },
        },
      );
      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to load users list");
      }     
      console.log(data.data)
      return data.data.totalCount;
    },
    retry: 1,
    staleTime: 30000,
  });
}
