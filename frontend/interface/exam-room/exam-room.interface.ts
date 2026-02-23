// Exam Room Interfaces

export interface CreateExamRoomRequest {
  name: string;
  description: string;
  startTime: string; // datetime-local format from input, will be converted to ISO 8601
  endTime: string; // datetime-local format from input, will be converted to ISO 8601
  durationInMinutes: number;
}

export interface ExamRoomResponse {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  durationInMinutes: number;
  status?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface ExamRoomExamResponse {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
  createdAt: string;
}

export interface ExamRoomDetailResponse {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  durationInMinutes: number;
  status: string;
  exams: ExamRoomExamResponse[];
  createdAt: string;
  updatedAt?: string;
}

export interface GetExamRoomsByMentorRequest {
  pageNumber?: number;
  pageSize?: number;
  status?: string; // active, upcoming, closed
}

export interface UpdateExamRoomRequest {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  durationInMinutes: number;
}

export interface AssignExamToRoomRequest {
  examId: string;
}

export interface GetAvailableExamRoomsRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface ExamRoomAccessResponse {
  hasAccess: boolean;
  reason?: string;
  examRoom?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  };
}

export interface PaginatedExamRoomsResponse {
  items: ExamRoomResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
