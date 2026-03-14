/**
 * @domain components
 * @description Student component prop interfaces
 */

import type { TestAnswerResponse } from "@/interface/student/test.interface";
import type { SubmitAnswerResponse } from "@/interface/student/submission.interface";
import type { RoomListResponse } from "@/interface/student/room.interface";
import type { Room } from "@/interface/student/room.interface";
import type { GetSubmissionsResponse } from "@/interface/student/submission.interface";
import type { QuestionResult } from "@/interface/student/submission.interface";
import type { StudentProfileResponse } from "@/interface/student/profile.interface";
import type { Exam } from "@/interface/student/exam.interface";
import type { ExamListResponse } from "@/interface/student/exam.interface";

/**
 * Props for the TestResults component
 */
export interface TestResultsProps {
  result: TestAnswerResponse | null;
  isLoading?: boolean;
  error?: Error | null;
  noCard?: boolean;
}

/**
 * Props for the SubmissionResults component
 */
export interface SubmissionResultsProps {
  result: SubmitAnswerResponse | null;
  isLoading?: boolean;
  error?: Error | null;
  noCard?: boolean;
}

/**
 * Props for the SubmissionHistoryTab component
 */
export interface SubmissionHistoryTabProps {
  examId: string;
  refreshSignal?: number;
  pageSize?: number;
}

/**
 * Props for the RoomList component
 */
export interface RoomListProps {
  data: RoomListResponse | undefined;
  isLoading: boolean;
  error?: Error | null;
}

/**
 * Props for the RoomCard component
 */
export interface StudentRoomCardProps {
  room: Room;
}

/**
 * Props for the ResultsView component
 */
export interface ResultsViewProps {
  data: GetSubmissionsResponse | undefined;
  isLoading: boolean;
  error?: Error | null;
  roomId?: string;
}

/**
 * Props for the QuestionResultCard component
 */
export interface QuestionResultCardProps {
  question: QuestionResult;
  roomId: string;
}

/**
 * Props for the ProfileView component
 */
export interface ProfileViewProps {
  profile: StudentProfileResponse | undefined;
  isLoading: boolean;
  error?: Error | null;
}

/**
 * Profile form values
 */
export interface Profile {
  full_name: string;
  email: string;
  studentId?: string;
}

/**
 * Update profile mutation interface
 */
export interface UpdateProfileMutation {
  mutate: () => void;
  mutateAsync: (payload: Profile) => Promise<void>;
  isPending?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  error?: Error | null;
}

/**
 * Props for the ExamTimer component
 */
export interface ExamTimerProps {
  closeTime: Date | string;
  serverTime?: Date | string;
  onTimeExpired?: () => void;
}

/**
 * Props for the ExamQuestionView component
 */
export interface ExamQuestionViewProps {
  question: Exam;
  room: Room;
  serverTime?: Date | string;
  onTest?: (code: string) => void;
  onExecute?: (code: string) => void;
  onSubmit?: (code: string) => void;
  isTesting?: boolean;
  isExecuting?: boolean;
  isSubmitting?: boolean;
  testOutput?: string;
  testError?: string;
  executeOutput?: string;
  executeError?: string;
}

/**
 * Props for the ExamList component
 */
export interface ExamListProps {
  data: ExamListResponse | undefined;
  isLoading: boolean;
  error?: Error | null;
  roomId?: string;
}

/**
 * Props for the ExamCard component
 */
export interface ExamCardProps {
  exam: Exam;
  roomId?: string;
}
