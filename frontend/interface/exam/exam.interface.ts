// Exam Interfaces (for Mentor - CRUD exam questions)

export interface ExamResponse {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
}

export interface CreateExamRequest {
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
}

export interface UpdateExamRequest {
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
}

export interface GetExamsByMentorRequest {
  pageNumber?: number;
  pageSize?: number;
  includeDeleted?: boolean;
}

export interface GetExamsByMentorResponse {
  items: ExamResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}
