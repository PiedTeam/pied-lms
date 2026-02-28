// Quizlet related messages

export const QUIZLET_MESSAGES = {
  SUCCESS: {
    CREATED: "Tạo quizlet thành công",
    UPDATED: "Cập nhật quizlet thành công",
    DELETED: "Xóa quizlet thành công",
  },
  ERROR: {
    CREATE_FAILED: "Tạo quizlet thất bại",
    UPDATE_FAILED: "Cập nhật quizlet thất bại",
    DELETE_FAILED: "Xóa quizlet thất bại",
    NOT_FOUND: "Không tìm thấy quizlet",
    NO_PERMISSION: "Bạn không có quyền thực hiện thao tác này",
    LOAD_FAILED: "Không thể tải danh sách quizlet",
    INVALID_FILE: "File không hợp lệ. Vui lòng chọn file Excel (.xlsx)",
  },
} as const;
