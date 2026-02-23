import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosGeneral as axios } from "@/common/axios";
import type { ApiResponse } from "@/interface";
import type { AxiosError } from "@/interface/axios.interface";
import type {
  QuizletResponse,
  CreateQuizletRequest,
  UpdateQuizletRequest,
  StudentQuizletResponse,
} from "@/interface/quizlet/quizlet.interface";
import { QUIZLET_MESSAGES } from "@/constants/messages.constants";

// Get Student Quizlets
export function useGetStudentQuizlets() {
  return useQuery({
    queryKey: ["student", "quizlets"],
    queryFn: async (): Promise<StudentQuizletResponse[]> => {
      const { data } =
        await axios.get<ApiResponse<StudentQuizletResponse[]>>(
          "/students/quizlets",
        );

      if (!data.success || !data.data) {
        throw new Error(data.message || QUIZLET_MESSAGES.ERROR.LOAD_FAILED);
      }

      return data.data;
    },
  });
}

// Get All Quizlets (Teacher/Admin/Mentor)
export function useGetAllQuizlets() {
  return useQuery({
    queryKey: ["quizlets"],
    queryFn: async (): Promise<QuizletResponse[]> => {
      const { data } =
        await axios.get<ApiResponse<QuizletResponse[]>>("/quizlets");

      if (!data.success || !data.data) {
        throw new Error(data.message || QUIZLET_MESSAGES.ERROR.LOAD_FAILED);
      }

      return data.data;
    },
  });
}

// Get Quizlet By ID (Teacher/Admin/Mentor)
export function useGetQuizletById(id: number) {
  return useQuery({
    queryKey: ["quizlets", id],
    queryFn: async (): Promise<QuizletResponse> => {
      const { data } = await axios.get<ApiResponse<QuizletResponse>>(
        `/quizlets/${id}`,
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || QUIZLET_MESSAGES.ERROR.NOT_FOUND);
      }

      return data.data;
    },
    enabled: !!id,
  });
}

// Create Quizlet (Teacher/Admin/Mentor)
export function useCreateQuizlet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateQuizletRequest): Promise<string> => {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("description", payload.description);
      formData.append("isPublished", payload.isPublished.toString());
      formData.append("listQuestion", payload.listQuestion);

      try {
        const { data } = await axios.post<ApiResponse<string>>(
          "/quizlets",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        if (!data.success) {
          throw new Error(data.message || QUIZLET_MESSAGES.ERROR.CREATE_FAILED);
        }

        return data.message || QUIZLET_MESSAGES.SUCCESS.CREATED;
      } catch (err) {
        const error = err as AxiosError;
        if (error.response?.status === 400) {
          throw new Error(
            error.response?.data?.message ||
              QUIZLET_MESSAGES.ERROR.CREATE_FAILED,
          );
        }
        throw new Error(error.message || QUIZLET_MESSAGES.ERROR.CREATE_FAILED);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizlets"] });
    },
  });
}

// Update Quizlet (Teacher/Admin/Mentor)
export function useUpdateQuizlet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateQuizletRequest;
    }): Promise<string> => {
      try {
        const { data } = await axios.put<ApiResponse<string>>(
          `/quizlets/${id}`,
          payload,
        );

        if (!data.success) {
          throw new Error(data.message || QUIZLET_MESSAGES.ERROR.UPDATE_FAILED);
        }

        return data.message || QUIZLET_MESSAGES.SUCCESS.UPDATED;
      } catch (err) {
        const error = err as AxiosError;
        // Handle 400 Bad Request - Permission denied
        if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || "";
          // Check if it's a permission error
          if (
            errorMessage.toLowerCase().includes("permission") ||
            errorMessage.toLowerCase().includes("quyền") ||
            errorMessage.toLowerCase().includes("không được phép") ||
            errorMessage.toLowerCase().includes("not allowed")
          ) {
            throw new Error(QUIZLET_MESSAGES.ERROR.NO_PERMISSION);
          }
          throw new Error(errorMessage || QUIZLET_MESSAGES.ERROR.UPDATE_FAILED);
        }
        throw new Error(error.message || QUIZLET_MESSAGES.ERROR.UPDATE_FAILED);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizlets"] });
    },
  });
}

// Delete Quizlet (Teacher/Admin)
export function useDeleteQuizlet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<string> => {
      try {
        const { data } = await axios.delete<ApiResponse<string>>(
          `/quizlets/${id}`,
        );

        if (!data.success) {
          throw new Error(data.message || QUIZLET_MESSAGES.ERROR.DELETE_FAILED);
        }

        return data.message || QUIZLET_MESSAGES.SUCCESS.DELETED;
      } catch (err) {
        const error = err as AxiosError;
        // Handle 400 Bad Request - Permission denied
        if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || "";
          // Check if it's a permission error
          if (
            errorMessage.toLowerCase().includes("permission") ||
            errorMessage.toLowerCase().includes("quyền") ||
            errorMessage.toLowerCase().includes("không được phép") ||
            errorMessage.toLowerCase().includes("not allowed")
          ) {
            throw new Error(QUIZLET_MESSAGES.ERROR.NO_PERMISSION);
          }
          throw new Error(errorMessage || QUIZLET_MESSAGES.ERROR.DELETE_FAILED);
        }
        throw new Error(error.message || QUIZLET_MESSAGES.ERROR.DELETE_FAILED);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizlets"] });
    },
  });
}
