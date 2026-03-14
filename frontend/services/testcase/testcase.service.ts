import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosGeneral as axios } from "@/common/axios";
import type { ApiResponse } from "@/interface";
import type { AxiosError } from "@/interface/axios.interface";
import type {
  TestCaseResponse,
  CreateTestCaseRequest,
  UpdateTestCaseRequest,
  RunTestCaseRequest,
  RunTestCaseResponse,
} from "@/interface/testcase/testcase.interface";

// Get TestCases By Exam ID
export function useGetTestCasesByExam(examId: string) {
  return useQuery({
    queryKey: ["testcases", "exam", examId],
    queryFn: async (): Promise<TestCaseResponse[]> => {
      const { data } = await axios.get<ApiResponse<TestCaseResponse[]>>(
        `/testcases/${examId}`,
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to load test cases");
      }

      return data.data;
    },
    enabled: !!examId,
  });
}

// Get TestCase By ID
export function useGetTestCaseById(id: string) {
  return useQuery({
    queryKey: ["testcases", id],
    queryFn: async (): Promise<TestCaseResponse> => {
      const { data } = await axios.get<ApiResponse<TestCaseResponse>>(
        `/testcases/${id}`,
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Test case not found");
      }

      return data.data;
    },
    enabled: !!id,
  });
}

// Create TestCase
export function useCreateTestCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTestCaseRequest): Promise<string> => {
      try {
        const { data } = await axios.post<ApiResponse<TestCaseResponse>>(
          "/testcases",
          payload,
        );

        if (!data.success) {
          throw new Error(data.message || "Failed to create test case");
        }

        return data.message || "Test case created successfully";
      } catch (err) {
        const error = err as AxiosError;
        throw new Error(
          error.response?.data?.message || "Failed to create test case",
        );
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["testcases", "exam", variables.examId],
      });
    },
  });
}

// Update TestCase
export function useUpdateTestCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTestCaseRequest;
    }): Promise<string> => {
      try {
        const { data } = await axios.put<ApiResponse<string>>(
          `/testcases/${id}`,
          payload,
        );

        if (!data.success) {
          throw new Error(data.message || "Failed to update test case");
        }

        return data.message || "Test case updated successfully";
      } catch (err) {
        const error = err as AxiosError;
        throw new Error(
          error.response?.data?.message || "Failed to update test case",
        );
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["testcases", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["testcases", "exam"] });
    },
  });
}

// Delete TestCase
export function useDeleteTestCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      try {
        const { data } = await axios.delete<ApiResponse<string>>(
          `/testcases/${id}`,
        );

        if (!data.success) {
          throw new Error(data.message || "Failed to delete test case");
        }

        return data.message || "Test case deleted successfully";
      } catch (err) {
        const error = err as AxiosError;
        throw new Error(
          error.response?.data?.message || "Failed to delete test case",
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testcases"] });
    },
  });
}

// Run TestCase
export function useRunTestCase() {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: RunTestCaseRequest;
    }): Promise<RunTestCaseResponse> => {
      try {
        const { data } = await axios.post<ApiResponse<RunTestCaseResponse>>(
          `/testcases/${id}/run`,
          payload,
        );

        if (!data.success || !data.data) {
          throw new Error(data.message || "Failed to run test case");
        }

        return data.data;
      } catch (err) {
        const error = err as AxiosError;
        // For test case execution, we might get a 400 with execution results
        if (error.response?.status === 400 && error.response?.data?.data) {
          return error.response.data.data as RunTestCaseResponse;
        }
        throw new Error(
          error.response?.data?.message || "Failed to run test case",
        );
      }
    },
  });
}
