// Exam related messages

export const EXAM_MESSAGES = {
  SUCCESS: {
    CREATED: "Tạo đề thi thành công",
    UPDATED: "Cập nhật đề thi thành công",
    DELETED: "Xóa đề thi thành công",
  },
  ERROR: {
    CREATE_FAILED: "Tạo đề thi thất bại",
    UPDATE_FAILED: "Cập nhật đề thi thất bại",
    DELETE_FAILED: "Xóa đề thi thất bại",
    NOT_FOUND: "Không tìm thấy đề thi",
    NO_PERMISSION: "Bạn không có quyền thực hiện thao tác này",
    LOAD_FAILED: "Không thể tải danh sách đề thi",
  },
} as const;
