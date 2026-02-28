// Compiler API Interfaces

// Request interfaces
export interface CompileCodeRequest {
  code: string;
  input?: string;
  timeLimit?: number;
  memoryLimit?: number;
  optimizationLevel?: "0" | "1" | "2" | "3" | "s";
}

export interface JudgeCodeRequest {
  code: string;
  testCases: TestCaseInput[];
  timeLimit?: number;
  memoryLimit?: number;
  optimizationLevel?: "0" | "1" | "2" | "3" | "s";
}

export interface JudgeCodeFromFileRequest {
  code: string;
  examId: string;
  timeLimit?: number;
  memoryLimit?: number;
  optimizationLevel?: "0" | "1" | "2" | "3" | "s";
}

export interface TestCaseInput {
  input: string;
  expectedOutput: string;
}

// Response interfaces
export interface CompileCodeResponse {
  success: boolean;
  output: string | null;
  compilationTime: number;
  executionTime: number | null;
  error: string | null;
  errorCode: CompilerErrorCode | null;
  errorDetails: string | null;
}

export interface JudgeCodeResponse {
  passed: number;
  failed: number;
  total: number;
  results: TestCaseResult[];
}

export interface TestCaseResult {
  testCase: number;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  executionTime: number | null;
  error: string | null;
  errorCode: CompilerErrorCode | null;
}

// Error codes
export type CompilerErrorCode =
  | "COMPILE_ERROR"
  | "RUNTIME_ERROR"
  | "SEGMENTATION_FAULT"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "OUTPUT_LIMIT_EXCEEDED"
  | "STDERR_LIMIT_EXCEEDED"
  | "FLOATING_POINT_EXCEPTION"
  | "WRONG_ANSWER"
  | "INVALID_REQUEST"
  | "RATE_LIMIT_EXCEEDED"
  | "SERVER_BUSY";

// API Response wrapper
export interface CompilerApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string[]> | null;
  isNotFound: boolean;
  errorCode: string | null;
}
