export type OptimizationLevel =
  | 0
  | 1
  | 2
  | 3
  | "0"
  | "1"
  | "2"
  | "3"
  | "s"
  | null;

export interface StudentSubmission {
  id: string;
  examId: string;
  language: string;
  status: string;
  runtime: number | null;
  memory: number | null;
  passedTestCases: number;
  totalTestCases: number;
  createdAt: string;
}

export interface StudentSubmissionDetail extends StudentSubmission {
  code: string;
}

export interface SubmitStudentCodeRequest {
  examId: string;
  code: string;
  language?: string;
  optimizationLevel?: OptimizationLevel;
}

export interface GetStudentSubmissionsRequest {
  examId: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedStudentSubmissionsResponse {
  items: StudentSubmission[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface SubmissionApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string[]> | null;
  isNotFound: boolean;
  errorCode: string | null;
  code?: number;
}
