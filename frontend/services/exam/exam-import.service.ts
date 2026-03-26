import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosGeneral as axios } from "@/common/axios";
import type { ApiResponse } from "@/interface";

export interface ExamImportResponse {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
}

/**
 * Hook to import exam and test cases from Excel file
 * @returns Mutation hook for importing exam
 */
export function useImportExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<ExamImportResponse> => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await axios.post<ApiResponse<ExamImportResponse>>(
          "/exams/import",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        if (!data.success || !data.data) {
          throw new Error(data.message || "Failed to import exam");
        }

        return data.data;
      } catch (error: unknown) {
        // Extract error message from backend response
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: {
              data?: {
                message?: string;
                errors?: Record<string, string[]>;
              };
            };
          };
          const errorData = axiosError.response?.data;

          if (errorData?.errors) {
            const errorMessages = Object.values(errorData.errors)
              .flat()
              .join(", ");
            if (errorMessages) {
              throw new Error(errorMessages);
            }
          }

          if (errorData?.message) {
            throw new Error(errorData.message);
          }
        }

        // Re-throw if it's already an Error with message
        if (error instanceof Error) {
          throw error;
        }

        throw new Error("Failed to import exam");
      }
    },
    onSuccess: () => {
      // Invalidate exams list to refresh data
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}

/**
 * Download exam import template
 * @returns Promise that triggers file download
 */
export async function downloadExamTemplate(): Promise<void> {
  try {
    // Download template from public folder
    const link = document.createElement("a");
    link.href = "/templates/exam_import_template.xlsx";
    link.setAttribute("download", "exam_import_template.xlsx");
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  } catch (error) {
    console.error("Failed to download template:", error);
    throw new Error("Failed to download exam template");
  }
}
