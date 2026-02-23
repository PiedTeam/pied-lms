import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosGeneral as axios } from "@/common/axios";
import type { ApiResponse } from "@/interface";
import {
  Question,
  QuestionListResponse,
  CreateQuestionRequest,
  CreateQuestionResponse,
  UpdateQuestionRequest,
} from "@/interface/question/question.interface";

// Query keys
export const QUESTION_QUERY_KEYS = {
  all: ["questions"] as const,
  lists: () => [...QUESTION_QUERY_KEYS.all, "list"] as const,
  list: (filters: string) =>
    [...QUESTION_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...QUESTION_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...QUESTION_QUERY_KEYS.details(), id] as const,
};

// Backend response types for Quizlets
interface QuizletSummary {
  id: number;
  title: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
}

interface QuestionDto {
  content: string;
  score: number;
  answers: string[];
  correctAnswers: string[];
  questionType: string;
}

interface QuizletDetail {
  id: number;
  title: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  questions: QuestionDto[];
}

// API functions
const questionApi = {
  getAll: async (): Promise<QuestionListResponse> => {
    try {
      // Fetch all quizlets
      const { data } =
        await axios.get<ApiResponse<QuizletSummary[]>>("/quizlets");

      if (!data.success || !data.data) {
        return { listQuestion: [] };
      }

      // Fetch details for each quizlet to get questions
      const quizletDetails = await Promise.all(
        data.data.map(async (quizlet) => {
          try {
            const detailResponse = await axios.get<ApiResponse<QuizletDetail>>(
              `/quizlets/${quizlet.id}`,
            );
            return detailResponse.data.data;
          } catch (error) {
            console.error(`Failed to fetch quizlet ${quizlet.id}:`, error);
            return null;
          }
        }),
      );

      // Transform quizlet questions into Question format
      const questions: Question[] = [];
      let questionIndex = 0;

      quizletDetails.forEach((quizlet) => {
        if (!quizlet) return;

        quizlet.questions.forEach((q, idx) => {
          questionIndex++;
          questions.push({
            questionId: questionIndex.toString(), // Use sequential IDs since backend doesn't expose question IDs directly
            title:
              q.content.substring(0, 50) + (q.content.length > 50 ? "..." : ""), // Use first 50 chars as title
            descriptionPath: q.content, // Store full content
            score: q.score,
            timeLimit: 1000, // Default values
            memoryLimit: 256,
            order: idx + 1,
            createdAt: quizlet.createdAt,
            roomId: quizlet.id.toString(),
            code: `Q${questionIndex}`,
          });
        });
      });

      return { listQuestion: questions };
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      return { listQuestion: [] };
    }
  },

  getById: async (questionId: string): Promise<Question> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const question = mockQuestions.find((q) => q.questionId === questionId);
    if (!question) {
      throw new Error(`Question with ID ${questionId} not found`);
    }
    return question;
  },

  create: async (
    data: CreateQuestionRequest,
  ): Promise<CreateQuestionResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newId = Date.now().toString();
    return {
      message: "Question created successfully",
      questionUuid: newId,
    };
  },

  update: async (data: UpdateQuestionRequest): Promise<{ message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { message: "Question updated successfully" };
  },

  delete: async (questionId: string): Promise<{ message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { message: "Question deleted successfully" };
  },
};

// React Query hooks
export function useGetQuestions() {
  return useQuery({
    queryKey: QUESTION_QUERY_KEYS.lists(),
    queryFn: questionApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGetQuestionById(questionId: string) {
  return useQuery({
    queryKey: QUESTION_QUERY_KEYS.detail(questionId),
    queryFn: () => questionApi.getById(questionId),
    enabled: !!questionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTION_QUERY_KEYS.lists() });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questionApi.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUESTION_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.detail(variables.questionId),
      });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questionApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTION_QUERY_KEYS.lists() });
    },
  });
}
