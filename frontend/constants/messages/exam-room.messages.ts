// Exam room related messages

export const EXAM_ROOM_MESSAGES = {
  SUCCESS: {
    CREATED: "Tạo phòng thi thành công",
    UPDATED: "Cập nhật phòng thi thành công",
    DELETED: "Xóa phòng thi thành công",
    EXAM_ASSIGNED: "Gán bài thi vào phòng thành công",
    EXAM_REMOVED: "Xóa bài thi khỏi phòng thành công",
    STUDENTS_ENROLLED: "Thêm học sinh vào phòng thi thành công",
  },
  ERROR: {
    CREATE_FAILED: "Tạo phòng thi thất bại",
    UPDATE_FAILED: "Cập nhật phòng thi thất bại",
    DELETE_FAILED: "Xóa phòng thi thất bại",
    NOT_FOUND: "Không tìm thấy phòng thi",
    NO_ACCESS: "Bạn không có quyền truy cập phòng thi này",
    ASSIGN_EXAM_FAILED: "Gán bài thi vào phòng thất bại",
    REMOVE_EXAM_FAILED: "Xóa bài thi khỏi phòng thất bại",
    ENROLL_STUDENTS_FAILED: "Thêm học sinh vào phòng thi thất bại",
    NO_STUDENTS_SELECTED: "Vui lòng chọn ít nhất một học sinh",
  },
} as const;

export const ROOM_MESSAGES = {
  SUCCESS: {
    CREATED: "Tạo phòng thi thành công",
    UPDATED: "Cập nhật phòng thi thành công",
    DELETED: "Xóa phòng thi thành công",
    JOINED: "Tham gia phòng thi thành công",
  },
  ERROR: {
    CREATE_FAILED: "Tạo phòng thi thất bại",
    UPDATE_FAILED: "Cập nhật phòng thi thất bại",
    DELETE_FAILED: "Xóa phòng thi thất bại",
    JOIN_FAILED: "Tham gia phòng thi thất bại",
    NOT_FOUND: "Không tìm thấy phòng thi",
    INVALID_CODE: "Mã phòng không hợp lệ",
  },
} as const;
