import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosGeneral as axios } from "@/common/axios";
import type { ApiResponse } from "@/interface";
import type { AxiosError } from "@/interface/axios.interface";
import type {
  QuizletResponse,
  QuizletSummaryResponse,
  CreateQuizletRequest,
  UpdateQuizletRequest,
  StudentQuizletResponse,
  StudentQuizletSummaryResponse,
} from "@/interface/quizlet/quizlet.interface";
import { QUIZLET_MESSAGES } from "@/constants/messages";

// Get Student Quizlets Summary (GET /api/students/quizlets)
export function useGetStudentQuizlets() {
  return useQuery({
    queryKey: ["student", "quizlets"],
    queryFn: async (): Promise<StudentQuizletSummaryResponse[]> => {
      const { data } =
        await axios.get<ApiResponse<StudentQuizletSummaryResponse[]>>(
          "/students/quizlets",
        );

      if (!data.success || !data.data) {
        throw new Error(data.message || QUIZLET_MESSAGES.ERROR.LOAD_FAILED);
      }

      return data.data;
    },
  });
}

// Get Student Quizlet By ID (GET /api/students/quizlets/{id})
export function useGetStudentQuizletById(id: number) {
  return useQuery({
    queryKey: ["student", "quizlets", id],
    queryFn: async (): Promise<StudentQuizletResponse> => {
      const { data } = await axios.get<ApiResponse<StudentQuizletResponse>>(
        `/students/quizlets/${id}`,
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || QUIZLET_MESSAGES.ERROR.NOT_FOUND);
      }

      return data.data;
    },
    enabled: !!id,
  });
}

// Get All Quizlets Summary (GET /api/quizlets)
export function useGetAllQuizlets() {
  return useQuery({
    queryKey: ["quizlets"],
    queryFn: async (): Promise<QuizletSummaryResponse[]> => {
      const { data } =
        await axios.get<ApiResponse<QuizletSummaryResponse[]>>("/quizlets");

      if (!data.success || !data.data) {
        throw new Error(data.message || QUIZLET_MESSAGES.ERROR.LOAD_FAILED);
      }

      return data.data;
    },
  });
}

// Get Quizlets Count (derived from GET /api/quizlets)
export function useGetQuizletCount() {
  return useQuery({
    queryKey: ["quizlets", "count"],
    queryFn: async (): Promise<number> => {
      const { data } =
        await axios.get<ApiResponse<QuizletSummaryResponse[]>>("/quizlets");

      if (!data.success || !data.data) {
        throw new Error(data.message || QUIZLET_MESSAGES.ERROR.LOAD_FAILED);
      }

      return data.data.length;
    },
  });
}

// Get Quizlet By ID (GET /api/quizlets/{id})
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
      formData.append("isHidden", payload.isHidden.toString());
      formData.append("level", payload.level.toString());
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
          {
            Title: payload.title,
            IsPublished: payload.isPublished,
            IsHidden: payload.isHidden,
            Level: payload.level,
            ListQuestion: payload.listQuestion.map((q) => ({
              Content: q.content,
              Score: q.score,
              Answers: q.answers,
              CorrectAnswers: q.correctAnswers,
              QuestionType:
                q.questionType === 0 ? "SingleChoice" : "MultipleChoice",
              IsHidden: q.isHidden,
              Level: q.level,
            })),
          },
        );

        if (!data.success) {
          throw new Error(data.message || QUIZLET_MESSAGES.ERROR.UPDATE_FAILED);
        }

        return data.message || QUIZLET_MESSAGES.SUCCESS.UPDATED;
      } catch (err) {
        const error = err as AxiosError;
        if (error.response?.status === 400 || error.response?.status === 403) {
          const errorMessage = error.response?.data?.message || "";
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

// Toggle Publish Status (Teacher/Admin/Mentor)
export function useTogglePublishQuizlet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isPublished,
    }: {
      id: number;
      isPublished: boolean;
    }): Promise<string> => {
      try {
        // Get current quizlet data first
        const { data: quizletData } = await axios.get<
          ApiResponse<QuizletResponse>
        >(`/quizlets/${id}`);

        if (!quizletData.success || !quizletData.data) {
          throw new Error(QUIZLET_MESSAGES.ERROR.NOT_FOUND);
        }

        const quizlet = quizletData.data;

        // Update with new publish status
        const { data } = await axios.put<ApiResponse<string>>(
          `/quizlets/${id}`,
          {
            title: quizlet.title,
            description: quizlet.description || "",
            isPublished: isPublished,
            isHidden: quizlet.isHidden,
            level: quizlet.level,
            listQuestion: quizlet.listQuestion.map((q) => ({
              content: q.content,
              score: q.score,
              answers: q.answers,
              correctAnswers: q.correctAnswers,
              questionType: q.type === 0 ? "SingleChoice" : "MultipleChoice",
              isHidden: q.isHidden,
              level: q.level,
            })),
          },
        );

        if (!data.success) {
          throw new Error(data.message || QUIZLET_MESSAGES.ERROR.UPDATE_FAILED);
        }

        return data.message || QUIZLET_MESSAGES.SUCCESS.UPDATED;
      } catch (err) {
        const error = err as AxiosError;
        if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || "";
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
