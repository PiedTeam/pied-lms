// Exam Participation Interfaces (for Student - taking exams)

export interface ExamParticipationResponse {
  id: string;
  examId: string;
  examTitle: string;
  examRoomId: string;
  examRoomName: string;
  studentId: string;
  startTime: string;
  endTime: string | null;
  score: number | null;
  isPassed: boolean | null;
  status: string; // "InProgress", "Completed", "Abandoned"
  createdAt: string;
}

export interface StartExamRequest {
  examRoomId: string;
  examId: string;
}

export interface GetStudentParticipationsRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface GetStudentParticipationsResponse {
  items: ExamParticipationResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ExamRoomAccessResponse {
  hasAccess: boolean;
  reason: string | null;
  examRoom: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  } | null;
}
