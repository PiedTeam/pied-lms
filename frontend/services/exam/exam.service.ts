import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosGeneral as axios } from "@/common/axios";
import type { ApiResponse } from "@/interface";
import type {
  ExamResponse,
  CreateExamRequest,
  UpdateExamRequest,
  GetExamsByMentorResponse,
  GetExamsRequest,
  GetExamsByAdminResponse,
} from "@/interface/exam/exam.interface";

// Create Exam (Mentor only)
export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateExamRequest): Promise<ExamResponse> => {
      // Convert camelCase to PascalCase for backend
      const backendPayload = {
        Title: payload.title,
        Description: payload.description,
        TotalMarks: payload.totalMarks,
        PassingMarks: payload.passingMarks,
      };

      const { data } = await axios.post<ApiResponse<ExamResponse>>(
        "/exams",
        backendPayload,
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to create exam");
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}

// Get Exams By Mentor
export function useGetExamsByMentor(params: GetExamsByMentorRequest = {}) {
  const { pageNumber = 1, pageSize = 10, includeDeleted } = params;

  return useQuery({
    queryKey: ["exams", pageNumber, pageSize, includeDeleted],
    queryFn: async (): Promise<GetExamsByMentorResponse> => {
      const { data } = await axios.get<ApiResponse<GetExamsByMentorResponse>>(
        "/exams",
        {
          params: {
            pageNumber,
            pageSize,
            ...(includeDeleted !== undefined && { includeDeleted }),
          },
        },
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to load exams list");
      }

      return data.data;
    },
    retry: 1,
    staleTime: 30000,
  });
}

// Get Exams By Admin
export function useGetExamsByAdmin(params: GetExamsRequest = {}) {
  const { pageNumber = 1, pageSize = 10 } = params;

  return useQuery({
    queryKey: ["exams", pageNumber, pageSize],
    queryFn: async (): Promise<GetExamsByAdminResponse> => {
      const { data } = await axios.get<ApiResponse<GetExamsByAdminResponse>>(
        "/exams",
        {
          params: {
            pageNumber,
            pageSize,
            ...(includeDeleted !== undefined && { includeDeleted }),
          },
        },
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to load exams list");
      }

      return data.data;
    },
    retry: 1,
    staleTime: 30000,
  });
}

// Get Exams By Admin
export function useGetExamsByAdmin(params: GetExamsRequest = {}) {
  const { pageNumber = 1, pageSize = 10 } = params;

  return useQuery({
    queryKey: ["exams", pageNumber, pageSize],
    queryFn: async (): Promise<GetExamsByAdminResponse> => {
      const { data } = await axios.get<ApiResponse<GetExamsByAdminResponse>>(
        "/exams",
        {
          params: {
            pageNumber,
            pageSize,
          },
        },
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to load exams list");
      }

      return data.data;
    },
    retry: 1,
    staleTime: 30000,
  });
}

// Get Exam By ID
export function useGetExamById(examId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["exam", examId],
    queryFn: async (): Promise<ExamResponse> => {
      const { data } = await axios.get<ApiResponse<ExamResponse>>(
        `/exams/${examId}`,
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Exam not found");
      }

      return data.data;
    },
    enabled: enabled && !!examId,
    retry: 1,
  });
}

// Update Exam (Mentor only)
export function useUpdateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      examId,
      payload,
    }: {
      examId: string;
      payload: UpdateExamRequest;
    }): Promise<ExamResponse> => {
      try {
        // Convert camelCase to PascalCase for backend
        const backendPayload = {
          Title: payload.title,
          Description: payload.description,
          TotalMarks: payload.totalMarks,
          PassingMarks: payload.passingMarks,
        };

        const { data } = await axios.put<ApiResponse<ExamResponse>>(
          `/exams/${examId}`,
          backendPayload,
        );

        if (!data.success || !data.data) {
          throw new Error(data.message || "Failed to update exam");
        }

        return data.data;
      } catch (error: unknown) {
        // Extract error message from backend response
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          const errorMessage = axiosError.response?.data?.message;
          if (errorMessage) {
            throw new Error(errorMessage);
          }
        }
        // Re-throw if it's already an Error with message
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Failed to update exam");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam", variables.examId] });
    },
  });
}

// Delete Exam (Mentor only)
export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examId: string): Promise<string> => {
      try {
        const { data } = await axios.delete<ApiResponse<string>>(
          `/exams/${examId}`,
        );

        if (!data.success) {
          throw new Error(data.message || "Failed to delete exam");
        }

        return data.data || "Exam deleted successfully";
      } catch (error: unknown) {
        // Extract error message from backend response
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          const errorMessage = axiosError.response?.data?.message;
          if (errorMessage) {
            throw new Error(errorMessage);
          }
        }
        // Re-throw if it's already an Error with message
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Failed to delete exam");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}
