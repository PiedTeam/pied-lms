// Exam Participation Interfaces

export interface ExamParticipationResponse {
  id: string;
  examRoomId: string;
  examRoomName: string;
  examId: string;
  examTitle: string;
  startedAt: string;
  deadline: string;
  submittedAt: string | null;
  score: number | null;
  isCompleted: boolean;
}

export interface ExamRoomAccessResponse {
  canAccess: boolean;
  reason: string;
  availableFrom: string | null;
  availableUntil: string | null;
}

export interface ExamRoomEnrollmentResponse {
  id: string;
  studentId: string;
  studentEmail: string;
  studentFirstName: string;
  studentLastName: string;
  enrolledAt: string;
  emailSent: boolean;
  emailSentAt: string | null;
}

export interface GetExamRoomEnrollmentsRequest {
  examRoomId: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedExamRoomEnrollmentsResponse {
  items: ExamRoomEnrollmentResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

export interface GetStudentParticipationsRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedExamParticipationsResponse {
  items: ExamParticipationResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

export interface SubmitExamResponse {
  participationId: string;
  submittedAt: string;
  score: number | null;
  isCompleted: boolean;
  message: string;
}

export interface StartExamRequest {
  examRoomId: string;
  examId: string;
}

export interface SubmitExamRequest {
  participationId: string;
  answers: ExamAnswer[];
  isFinal: boolean;
}

export interface ExamAnswer {
  questionId: string;
  answer: string;
}
