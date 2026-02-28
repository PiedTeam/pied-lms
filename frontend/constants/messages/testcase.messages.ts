// Test case related messages

export const TESTCASE_MESSAGES = {
  SUCCESS: {
    CREATED: "Tạo test case thành công",
    UPDATED: "Cập nhật test case thành công",
    DELETED: "Xóa test case thành công",
    EXECUTED: "Chạy test case thành công",
  },
  ERROR: {
    CREATE_FAILED: "Tạo test case thất bại",
    UPDATE_FAILED: "Cập nhật test case thất bại",
    DELETE_FAILED: "Xóa test case thất bại",
    NOT_FOUND: "Không tìm thấy test case",
    EXECUTE_FAILED: "Chạy test case thất bại",
    LOAD_FAILED: "Không thể tải danh sách test case",
    INVALID_QUESTION_ID: "Vui lòng nhập Question ID hợp lệ",
    COMPILATION_ERROR: "Lỗi biên dịch code",
    RUNTIME_ERROR: "Lỗi runtime",
    TIME_LIMIT_EXCEEDED: "Vượt quá thời gian cho phép",
    MEMORY_LIMIT_EXCEEDED: "Vượt quá bộ nhớ cho phép",
  },
  VALIDATION: {
    INPUT_REQUIRED: "Input là bắt buộc",
    OUTPUT_REQUIRED: "Expected output là bắt buộc",
    TIME_LIMIT_MIN: "Thời gian tối thiểu là 1ms",
    TIME_LIMIT_MAX: "Thời gian tối đa là 30 giây",
    MEMORY_LIMIT_MIN: "Bộ nhớ tối thiểu là 1MB",
    MEMORY_LIMIT_MAX: "Bộ nhớ tối đa là 512MB",
    CODE_REQUIRED: "Vui lòng nhập code",
    LANGUAGE_REQUIRED: "Vui lòng chọn ngôn ngữ lập trình",
  },
} as const;
