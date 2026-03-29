/**
 * Exam import response from backend
 */
export interface ExamImportResponse {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
}

/**
 * Excel template structure for exam import
 */
export interface ExamImportTemplate {
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
  testCaseIndex: number;
  inputPath: string;
  outputPath: string;
  isHidden: boolean;
}

/**
 * File upload state for import component
 */
export interface FileUploadState {
  file: File | null;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}
