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
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt?: string;
  exams?: ExamRoomExamResponse[]; // For student exam rooms page
<<<<<<< HEAD
=======
  examCount?: number; // Number of exams in the room (from backend)
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
  roomCode?: string; // For joining rooms
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
  enrolledStudentsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface GetExamRoomsByMentorRequest {
  pageNumber?: number;
  pageSize?: number;
  status?: string; // active, upcoming, closed
  includeDeleted?: boolean;
}

export interface GetExamRoomsByAdminRequest {
  pageNumber?: number;
  pageSize?: number;
  status?: string; // active, upcoming, closed
}

export interface GetExamRoomsByAdminRequest {
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
}

export interface EnrollStudentsRequest {
  studentIds: string[];
}

export interface EnrollmentError {
  studentId: string;
  reason: string;
}

export interface EnrollmentResultResponse {
  totalStudents: number;
  successfulEnrollments: number;
  failedEnrollments: number;
  errors: EnrollmentError[];
}
