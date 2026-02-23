import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosGeneral as axios } from "@/common/axios";
import type { ApiResponse } from "@/interface";
import type {
  CreateExamRoomRequest,
  ExamRoomResponse,
  ExamRoomDetailResponse,
  GetExamRoomsByMentorRequest,
  UpdateExamRoomRequest,
  AssignExamToRoomRequest,
  GetAvailableExamRoomsRequest,
  ExamRoomAccessResponse,
  PaginatedExamRoomsResponse,
} from "@/interface/exam-room/exam-room.interface";

// Create Exam Room (Mentor)
export function useCreateExamRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: CreateExamRoomRequest,
    ): Promise<ExamRoomResponse> => {
      // Convert datetime-local format to ISO 8601
      const startTime = new Date(payload.startTime).toISOString();
      const endTime = new Date(payload.endTime).toISOString();

      // Convert camelCase to PascalCase for backend
      const backendPayload = {
        Name: payload.name,
        Description: payload.description,
        StartTime: startTime,
        EndTime: endTime,
        DurationInMinutes: payload.durationInMinutes,
      };

      const { data } = await axios.post<ApiResponse<ExamRoomResponse>>(
        "/exam-rooms",
        backendPayload,
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to create exam room");
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-rooms"] });
    },
  });
}

// Get Exam Rooms By Mentor
export function useGetExamRoomsByMentor(
  params: GetExamRoomsByMentorRequest = {},
) {
  const { pageNumber = 1, pageSize = 10, status } = params;

  return useQuery({
    queryKey: ["exam-rooms", "mentor", pageNumber, pageSize, status],
    queryFn: async (): Promise<PaginatedExamRoomsResponse> => {
      const { data } = await axios.get<ApiResponse<PaginatedExamRoomsResponse>>(
        "/exam-rooms",
        {
          params: {
            pageNumber,
            pageSize,
            ...(status && { status }),
          },
        },
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to load exam rooms list");
      }

      return data.data;
    },
  });
}

// Get Exam Room By ID
export function useGetExamRoomById(roomId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["exam-room", roomId],
    queryFn: async (): Promise<ExamRoomDetailResponse> => {
      const { data } = await axios.get<ApiResponse<ExamRoomDetailResponse>>(
        `/exam-rooms/${roomId}`,
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Exam room not found");
      }

      return data.data;
    },
    enabled: enabled && !!roomId,
  });
}

// Update Exam Room (Mentor)
export function useUpdateExamRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      payload,
    }: {
      roomId: string;
      payload: UpdateExamRoomRequest;
    }): Promise<ExamRoomResponse> => {
      try {
        // Convert datetime-local format to ISO 8601
        const startTime = new Date(payload.startTime).toISOString();
        const endTime = new Date(payload.endTime).toISOString();

        // Convert camelCase to PascalCase for backend
        const backendPayload = {
          Name: payload.name,
          Description: payload.description,
          StartTime: startTime,
          EndTime: endTime,
          DurationInMinutes: payload.durationInMinutes,
        };

        const { data } = await axios.put<ApiResponse<ExamRoomResponse>>(
          `/exam-rooms/${roomId}`,
          backendPayload,
        );

        if (!data.success || !data.data) {
          throw new Error(data.message || "Failed to update exam room");
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
        throw new Error("Failed to update exam room");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exam-rooms"] });
      queryClient.invalidateQueries({
        queryKey: ["exam-room", variables.roomId],
      });
    },
  });
}

// Delete Exam Room (Mentor)
export function useDeleteExamRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string): Promise<string> => {
      try {
        const { data } = await axios.delete<ApiResponse<string>>(
          `/exam-rooms/${roomId}`,
        );

        if (!data.success) {
          throw new Error(data.message || "Failed to delete exam room");
        }

        return data.message || "Exam room deleted successfully";
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
        throw new Error("Failed to delete exam room");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-rooms"] });
    },
  });
}

// Assign Exam to Room (Mentor)
export function useAssignExamToRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      payload,
    }: {
      roomId: string;
      payload: AssignExamToRoomRequest;
    }): Promise<string> => {
      // Convert camelCase to PascalCase for backend
      const backendPayload = {
        ExamId: payload.examId,
      };

      const { data } = await axios.post<ApiResponse<string>>(
        `/exam-rooms/${roomId}/exams`,
        backendPayload,
      );

      if (!data.success) {
        throw new Error(data.message || "Failed to assign exam to room");
      }

      return data.message || "Exam assigned to room successfully";
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exam-room", variables.roomId],
      });
    },
  });
}

// Remove Exam from Room (Mentor)
export function useRemoveExamFromRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      examId,
    }: {
      roomId: string;
      examId: string;
    }): Promise<string> => {
      const { data } = await axios.delete<ApiResponse<string>>(
        `/exam-rooms/${roomId}/exams/${examId}`,
      );

      if (!data.success) {
        throw new Error(data.message || "Failed to remove exam from room");
      }

      return data.message || "Exam removed from room successfully";
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exam-room", variables.roomId],
      });
    },
  });
}

// Get Available Exam Rooms (Student)
export function useGetAvailableExamRooms(
  params: GetAvailableExamRoomsRequest = {},
) {
  const { pageNumber = 1, pageSize = 10 } = params;

  return useQuery({
    queryKey: ["exam-rooms", "available", pageNumber, pageSize],
    queryFn: async (): Promise<PaginatedExamRoomsResponse> => {
      const { data } = await axios.get<ApiResponse<PaginatedExamRoomsResponse>>(
        "/exam-rooms/available",
        {
          params: {
            pageNumber,
            pageSize,
          },
        },
      );

      if (!data.success || !data.data) {
        throw new Error(
          data.message || "Failed to load available exam rooms list",
        );
      }

      return data.data;
    },
  });
}

// Check Exam Room Access (Student)
export function useCheckExamRoomAccess(
  roomId: string,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["exam-room", "access", roomId],
    queryFn: async (): Promise<ExamRoomAccessResponse> => {
      const { data } = await axios.get<ApiResponse<ExamRoomAccessResponse>>(
        `/exam-rooms/${roomId}/access`,
      );

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to check room access");
      }

      return data.data;
    },
    enabled: enabled && !!roomId,
  });
}
