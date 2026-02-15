import { useMutation } from "@tanstack/react-query";
import { axiosGeneral as axios } from "@/common/axios";
import type { ApiResponse } from "@/interface";
import type {
  ImportStudentsRequest,
  ImportStudentsResponse,
  ApproveMentorResponse,
} from "@/interface/admin/admin.interface";

// Import Students
export function useImportStudents() {
  return useMutation({
    mutationFn: async (
      payload: ImportStudentsRequest,
    ): Promise<ImportStudentsResponse> => {
      const { data } = await axios.post<ApiResponse<string>>(
        "/admin/students/import",
        payload,
        {
          timeout: 120000, // 2 minutes timeout for bulk import
        },
      );

      if (!data.success) {
        throw new Error(data.message || "Failed to import students");
      }

      return {
        success: true,
        message: data.message || "Nhập danh sách sinh viên thành công",
        data: data.data || "",
      };
    },
  });
}

// Approve Mentor
export function useApproveMentor() {
  return useMutation({
    mutationFn: async (userId: string): Promise<ApproveMentorResponse> => {
      const { data } = await axios.post<ApiResponse<string>>(
        `/admin/mentors/${userId}/approve`,
      );

      if (!data.success) {
        if (data.isNotFound) {
          throw new Error("User not found");
        }
        throw new Error(data.message || "Failed to approve mentor");
      }

      return {
        success: true,
        message: data.message || "Phê duyệt mentor thành công",
        data: data.data || "",
      };
    },
  });
}
