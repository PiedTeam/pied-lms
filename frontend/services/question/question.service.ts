import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Question,
  QuestionListResponse,
  CreateQuestionRequest,
  CreateQuestionResponse,
  UpdateQuestionRequest,
} from "@/interface/question/question.interface";

// Mock data for development - temporary until backend is fixed
const mockQuestions: Question[] = [
  {
    questionId: "1",
    title: "Two Sum Problem",
    descriptionPath: "/problems/two-sum.md",
    score: 100,
    timeLimit: 1000,
    memoryLimit: 256,
    order: 1,
    createdAt: "2024-01-15T10:00:00Z",
    roomId: "room-001",
    code: "TWO_SUM",
  },
  {
    questionId: "2",
    title: "Reverse String",
    descriptionPath: "/problems/reverse-string.md",
    score: 80,
    timeLimit: 500,
    memoryLimit: 128,
    order: 2,
    createdAt: "2024-01-15T11:00:00Z",
    roomId: "room-001",
    code: "REVERSE_STR",
  },
  {
    questionId: "3",
    title: "Binary Search",
    descriptionPath: "/problems/binary-search.md",
    score: 150,
    timeLimit: 2000,
    memoryLimit: 512,
    order: 3,
    createdAt: "2024-01-15T12:00:00Z",
    roomId: "room-002",
    code: "BINARY_SEARCH",
  },
  {
    questionId: "4",
    title: "Fibonacci Sequence",
    descriptionPath: "/problems/fibonacci.md",
    score: 120,
    timeLimit: 1500,
    memoryLimit: 256,
    order: 4,
    createdAt: "2024-01-15T13:00:00Z",
    roomId: "room-002",
    code: "FIBONACCI",
  },
  {
    questionId: "5",
    title: "Merge Sort Algorithm",
    descriptionPath: "/problems/merge-sort.md",
    score: 200,
    timeLimit: 3000,
    memoryLimit: 1024,
    order: 5,
    createdAt: "2024-01-15T14:00:00Z",
    roomId: "room-003",
    code: "MERGE_SORT",
  },
];

// Query keys
export const QUESTION_QUERY_KEYS = {
  all: ["questions"] as const,
  lists: () => [...QUESTION_QUERY_KEYS.all, "list"] as const,
  list: (filters: string) =>
    [...QUESTION_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...QUESTION_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...QUESTION_QUERY_KEYS.details(), id] as const,
};

// Mock API functions - temporary until backend is fixed
const questionApi = {
  getAll: async (): Promise<QuestionListResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { listQuestion: mockQuestions };
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
