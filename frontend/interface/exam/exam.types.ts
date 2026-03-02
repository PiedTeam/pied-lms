export interface Exam {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
}

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
