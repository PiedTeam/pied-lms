// Exam Interfaces (for Mentor - CRUD exam questions)

export interface ExamResponse {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
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
}

export interface GetExamsByMentorResponse {
  items: ExamResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
