// Submission related messages

export const SUBMISSION_MESSAGES = {
  SUCCESS: {
    SUBMITTED: "Nộp bài thành công",
    EXECUTED: "Chạy code thành công",
  },
  ERROR: {
    SUBMIT_FAILED: "Nộp bài thất bại",
    EXECUTE_FAILED: "Chạy code thất bại",
    COMPILATION_ERROR: "Lỗi biên dịch",
    RUNTIME_ERROR: "Lỗi runtime",
    TIME_LIMIT_EXCEEDED: "Vượt quá thời gian cho phép",
    MEMORY_LIMIT_EXCEEDED: "Vượt quá bộ nhớ cho phép",
  },
} as const;
