/**
 * @domain exam
 * @description Exam page types and interfaces
 */

/**
 * Represents an exam score record
 */
export interface ExamScore {
  studentId: string;
  examRoomId: string;
  examId: string;
  score: number;
  totalMarks: number;
  passedTestCases: number;
  totalTestCases: number;
  submittedAt: string;
}

/**
 * Represents an exam
 */
export interface Exam {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
}

/**
 * Represents a test case result from the judge
 */
export interface JudgeTestCaseResult {
  testCase: number;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  executionTime: number | null;
  error: string | null;
  errorCode: string | null;
}

/**
 * Represents a test case
 */
export interface TestCase {
  id: string;
  inputPath: string;
  outputPath: string;
  isVisible: boolean;
}
