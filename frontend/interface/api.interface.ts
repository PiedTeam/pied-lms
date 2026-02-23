// Base API interfaces

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: {
    [key: string]: string[];
  };
  isNotFound: boolean;
  errorCode: string;
  code: number;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: {
    [key: string]: string[];
  };
  errorCode?: string;
  code?: number;
}
