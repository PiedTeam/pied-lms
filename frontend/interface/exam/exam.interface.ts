// Exam Interfaces (for Mentor - CRUD exam questions)

export interface ExamResponse {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
}

export interface CreateExamRequest {
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
}

export interface ImportedExamTestCase {
  index: number;
  input: string;
  output: string;
  isHidden: boolean;
  sourceRow: number;
}

export interface ExamImportProgress {
  percentage: number;
  message: string;
}

export interface ImportExamPayload {
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
  testCases: ImportedExamTestCase[];
  onProgress?: (progress: ExamImportProgress) => void;
}

export interface ImportExamResult {
  exam: ExamResponse;
  createdTestCases: number;
}

export interface ExamImportValidationResult {
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
  testCases: ImportedExamTestCase[];
  issues: string[];
  totalRows: number;
  validRows: number;
}

export interface UpdateExamRequest {
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
}

export interface GetExamsRequest {
  pageNumber?: number;
  pageSize?: number;
  includeDeleted?: boolean;
}

export interface GetExamsByMentorRequest {
  pageNumber?: number;
  pageSize?: number;
  includeDeleted?: boolean;
}

export interface GetExamsByMentorResponse {
  items: ExamResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

export interface GetExamsByAdminResponse {
  items: ExamResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface GetExamsByAdminResponse {
  items: ExamResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
