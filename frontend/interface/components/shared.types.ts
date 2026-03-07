/**
 * @domain components
 * @description Shared component prop interfaces
 */

import type { TestCaseResponse } from "@/interface/testcase/testcase.interface";
import type {
  QuizletResponse,
  UpdateQuestionDto,
} from "@/interface/quizlet/quizlet.interface";
import type { Question } from "@/interface/question/question.interface";
import type {
  CreateExamRequest,
  ExamResponse,
} from "@/interface/exam/exam.interface";
import type { CreateExamRoomRequest } from "@/interface/exam-room/exam-room.interface";

/**
 * Props for the TestCasesPage component
 */
export interface TestCasesPageProps {
  role: "admin" | "teacher" | "mentor";
  examTitle?: string;
}

/**
 * Props for the TestCasesList component
 */
export interface TestCasesListProps {
  examId: string;
  examTitle?: string;
}

/**
 * Form data for running test cases
 */
export interface RunTestCaseFormData {
  code: string;
  language: "c" | "python" | "java" | "cpp" | "javascript";
}

/**
 * Props for the TestCaseRunner component
 */
export interface TestCaseRunnerProps {
  testCase: TestCaseResponse;
  onClose: () => void;
}

/**
 * Form data for test case
 */
export interface TestCaseFormData {
  input: string;
  output: string;
  isHidden?: boolean;
  index?: number;
}

/**
 * Props for the TestCaseForm component
 */
export interface TestCaseFormProps {
  examId: string;
  testCase?: TestCaseResponse;
  existingTestCases?: TestCaseResponse[];
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Props for the QuizletViewDetail component
 */
export interface QuizletViewDetailProps {
  quizlet: QuizletResponse;
}

/**
 * Props for the QuizletsList component
 */
export interface QuizletsListProps {
  role: "admin" | "teacher" | "mentor";
}

/**
 * Props for the QuizletEditForm component
 */
export interface QuizletEditFormProps {
  questions: UpdateQuestionDto[];
  onQuestionsChange: (questions: UpdateQuestionDto[]) => void;
}

/**
 * Props for the QuestionsList component
 */
export interface QuestionsListProps {
  onQuestionSelect: (question: Question) => void;
  selectedQuestionId?: string;
}

/**
 * Props for the ExamsList component
 */
export interface ExamsListProps {
  basePath: string;
}

/**
 * Props for the ExamSelector component
 */
export interface ExamSelectorProps {
  exams: ExamResponse[];
  selectedExamId: string | null;
  onSelectExam: (examId: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

/**
 * Props for the ExamRoomsList component
 */
export interface ExamRoomsListProps {
  basePath: string;
}
