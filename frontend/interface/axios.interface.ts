export interface AxiosErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
  data?: unknown;
}

export interface AxiosError {
  response?: {
    status: number;
    data?: AxiosErrorResponse;
  };
  message: string;
  config?: unknown;
}
