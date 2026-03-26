import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosGeneral as axios } from "@/common/axios";
import type { ApiResponse } from "@/interface";
import type {
  ImportStudentsRequest,
  ImportStudentsResponse,
  ApproveMentorResponse,
} from "@/interface/admin/admin.interface";
import {
  StudentImportError,
  createStudentImportError,
} from "@/utils/student-import.utils";

// Import Students
export function useImportStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: ImportStudentsRequest,
    ): Promise<ImportStudentsResponse> => {
      try {
        const { data } = await axios.post<ApiResponse<string>>(
          "/admin/students/import",
          payload,
          {
            timeout: 120000,
          },
        );

        if (!data.success) {
          throw new StudentImportError(
            data.message || "Failed to import students.",
            Object.entries(data.errors ?? {}).flatMap(([field, messages]) =>
              messages.map((message) =>
                field ? `${field}: ${message}` : message,
              ),
            ),
          );
        }

        return {
          success: true,
          message: data.message || "Students imported successfully.",
          data: data.data || "",
        };
      } catch (error) {
        throw createStudentImportError(error);
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["students"] }),
      ]);
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
        message: data.message || "Mentor approved successfully.",
        data: data.data || "",
      };
    },
  });
}
