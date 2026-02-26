import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosGeneral as axios } from "@/common/axios";
import type { ApiResponse } from "@/interface";
import type {
  ExamParticipationResponse,
  StartExamRequest,
  GetStudentParticipationsRequest,
  PaginatedExamParticipationsResponse,
  GetExamRoomEnrollmentsRequest,
  PaginatedExamRoomEnrollmentsResponse,
} from "@/interface/exam-participation/exam-participation.interface";

// Start Exam (Student only)
export function useStartExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: StartExamRequest,
    ): Promise<ExamParticipationResponse> => {
      const { data } = await axios.post<ApiResponse<ExamParticipationResponse>>(
        "/participations/start",
        payload,
      );

      if (!data.success || !data.data) {
        // Check for access/permission error
        if (
          data.message?.toLowerCase().includes("authorized") ||
          data.message?.toLowerCase().includes("permission") ||
          data.message?.toLowerCase().includes("access")
        ) {
          throw new Error(
            "Bạn không có quyền truy cập phòng thi này hoặc chưa đến giờ thi",
          );
        }
        throw new Error(data.message || "Failed to start exam");
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participations"] });
    },
  });
}

// Get Student Participations (Student only)
export function useGetStudentParticipations(
  params: GetStudentParticipationsRequest = {},
) {
  const { pageNumber = 1, pageSize = 10 } = params;

  return useQuery({
    queryKey: ["participations", pageNumber, pageSize],
    queryFn: async (): Promise<PaginatedExamParticipationsResponse> => {
      const { data } = await axios.get<
        ApiResponse<PaginatedExamParticipationsResponse>
      >("/participations", {
        params: {
          pageNumber,
          pageSize,
        },
      });

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to load participation history");
      }

      return data.data;
    },
    retry: 1,
    staleTime: 30000,
  });
}

// Get Exam Room Enrollments (Admin, Mentor, Teacher)
export function useGetExamRoomEnrollments(
  params: GetExamRoomEnrollmentsRequest,
  enabled: boolean = true,
) {
  const { examRoomId, pageNumber = 1, pageSize = 100 } = params;

  return useQuery({
    queryKey: ["exam-room-enrollments", examRoomId, pageNumber, pageSize],
    queryFn: async (): Promise<PaginatedExamRoomEnrollmentsResponse> => {
      const { data } = await axios.get<
        ApiResponse<PaginatedExamRoomEnrollmentsResponse>
      >(`/participations/room/${examRoomId}`, {
        params: {
          pageNumber,
          pageSize,
        },
      });

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to load room enrollments");
      }

      return data.data;
    },
    enabled: enabled && !!examRoomId,
    retry: 1,
    staleTime: 30000,
  });
}
