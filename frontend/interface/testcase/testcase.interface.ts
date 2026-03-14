// TestCase Interfaces

export interface TestCaseResponse {
  examId: string; // Changed from questionId to examId (Guid)
  testCaseId: string; // Changed from id to testCaseId
  index: number;
  inputPath: string;
  outputPath: string;
  isHidden: boolean;
}

export interface CreateTestCaseRequest {
  examId: string;
  index: number;
  input: string;
  output: string;
  isHidden: boolean;
}

export interface UpdateTestCaseRequest {
  examId: string;
  index: number;
  input: string;
  output: string;
  isHidden: boolean;
}

export interface RunTestCaseRequest {
  code: string;
  language: "python" | "java" | "cpp" | "javascript";
}

export interface RunTestCaseResponse {
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  executionTime: number;
  memoryUsed: number;
  error: string | null;
}

export interface QuestionSummary {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}
