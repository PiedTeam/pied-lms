import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosGeneral as axios } from "@/common/axios";
import type { JudgeCodeResponse } from "@/interface/compiler/compiler.interface";
import type {
  GetStudentSubmissionsRequest,
  PaginatedStudentSubmissionsResponse,
  StudentSubmission,
  StudentSubmissionDetail,
  SubmissionApiResponse,
  SubmitStudentCodeRequest,
} from "@/interface/student/code-submission.interface";

async function submitStudentCode(
  payload: SubmitStudentCodeRequest,
): Promise<JudgeCodeResponse> {
  const { examId, ...requestBody } = payload;
  const { data } = await axios.post<SubmissionApiResponse<JudgeCodeResponse>>(
    `/students/exams/${examId}/submissions`,
    requestBody,
  );

  if (!data.success || !data.data) {
    throw new Error(data.message || "Failed to submit code");
  }

  return data.data;
}

async function fetchStudentSubmissions(examId: string): Promise<StudentSubmission[]> {
  const { data } = await axios.get<SubmissionApiResponse<StudentSubmission[]>>(
    `/students/exams/${examId}/submissions`,
  );

  if (!data.success || !data.data) {
    throw new Error(data.message || "Failed to load submissions");
  }

  return data.data;
}

async function fetchSubmissionDetail(
  submissionId: string,
): Promise<StudentSubmissionDetail> {
  const { data } = await axios.get<SubmissionApiResponse<StudentSubmissionDetail>>(
    `/students/submissions/${submissionId}`,
  );

  if (!data.success || !data.data) {
    throw new Error(data.message || "Failed to load submission details");
  }

  return data.data;
}

export function useSubmitStudentCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitStudentCode,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["student-submissions", variables.examId],
      });
    },
  });
}

export function useGetStudentSubmissions(
  params: GetStudentSubmissionsRequest,
  enabled: boolean = true,
) {
  const { examId, pageNumber = 1, pageSize = 10 } = params;

  return useQuery({
    queryKey: ["student-submissions", examId, pageNumber, pageSize],
    queryFn: async (): Promise<PaginatedStudentSubmissionsResponse> => {
      const list = await fetchStudentSubmissions(examId);
      const start = Math.max(0, (pageNumber - 1) * pageSize);
      const items = list.slice(start, start + pageSize);

      return {
        items,
        totalCount: list.length,
        pageNumber,
        pageSize,
      };
    },
    enabled: enabled && !!examId,
    retry: 1,
    staleTime: 30000,
  });
}

export function useGetSubmissionDetail(
  submissionId: string,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["student-submission-detail", submissionId],
    queryFn: () => fetchSubmissionDetail(submissionId),
    enabled: enabled && !!submissionId,
    retry: 1,
    staleTime: 30000,
  });
}
