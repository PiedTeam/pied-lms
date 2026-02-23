// Admin Interfaces

export interface StudentImportDto {
  email: string;
  firstName: string;
  lastName: string;
}

export interface ImportStudentsRequest {
  students: StudentImportDto[];
}

export interface ImportStudentsResponse {
  success: boolean;
  message: string;
  data: string;
}

export interface ApproveMentorResponse {
  success: boolean;
  message: string;
  data: string;
}
