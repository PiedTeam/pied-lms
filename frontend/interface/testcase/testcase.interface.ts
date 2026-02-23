// TestCase Interfaces

export interface TestCaseResponse {
  questionId: number;
  id: string;
  index: number;
  inputPath: string;
  outputPath: string;
  isHidden: boolean;
}

export interface CreateTestCaseRequest {
  questionId: number; // Changed to number to match backend int
  index: number; // Added required field
  inputPath: string; // Changed from input to inputPath
  outputPath: string; // Changed from expectedOutput to outputPath
  isHidden: boolean;
}

export interface UpdateTestCaseRequest {
  questionId: number;
  index: number;
  inputPath: string;
  outputPath: string;
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
