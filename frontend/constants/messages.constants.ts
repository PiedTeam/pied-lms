// Message constants for API responses and user feedback

export const AUTH_MESSAGES = {
  SUCCESS: {
    LOGIN: "Đăng nhập thành công",
    REGISTER: "Tạo tài khoản thành công",
    LOGOUT: "Đăng xuất thành công",
    TOKEN_REFRESHED: "Phiên làm việc đã được làm mới",
  },
  ERROR: {
    LOGIN_FAILED: "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
    REGISTER_FAILED: "Đăng ký thất bại. Vui lòng thử lại.",
    LOGOUT_FAILED: "Đăng xuất thất bại. Vui lòng thử lại.",
    TOKEN_REFRESH_FAILED: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
    PASSWORD_RESET_FAILED: "Đặt lại mật khẩu thất bại. Vui lòng thử lại.",
    INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng",
    EMAIL_EXISTS: "Email đã được đăng ký",
    ACCOUNT_BANNED:
      "Tài khoản của bạn đã bị cấm. Vui lòng liên hệ quản trị viên.",
  },
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: "Trường này là bắt buộc",
  INVALID_EMAIL: "Vui lòng nhập địa chỉ email hợp lệ",
  PASSWORD_TOO_SHORT: "Mật khẩu phải có ít nhất 8 ký tự",
  PASSWORDS_DONT_MATCH: "Mật khẩu không khớp",
  INVALID_FORMAT: "Định dạng không hợp lệ",
} as const;

export const NETWORK_MESSAGES = {
  ERROR: {
    NETWORK_ERROR: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.",
    SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau.",
    TIMEOUT: "Yêu cầu hết thời gian chờ. Vui lòng thử lại.",
    NOT_FOUND: "Không tìm thấy tài nguyên",
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

export const QUESTION_MESSAGES = {
  SUCCESS: {
    CREATED: "Tạo câu hỏi thành công",
    UPDATED: "Cập nhật câu hỏi thành công",
    DELETED: "Xóa câu hỏi thành công",
  },
  ERROR: {
    CREATE_FAILED: "Tạo câu hỏi thất bại",
    UPDATE_FAILED: "Cập nhật câu hỏi thất bại",
    DELETE_FAILED: "Xóa câu hỏi thất bại",
    NOT_FOUND: "Không tìm thấy câu hỏi",
  },
} as const;

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

export const USER_MESSAGES = {
  SUCCESS: {
    UPDATED: "Cập nhật thông tin thành công",
    BANNED: "Cấm người dùng thành công",
    UNBANNED: "Bỏ cấm người dùng thành công",
  },
  ERROR: {
    UPDATE_FAILED: "Cập nhật thông tin thất bại",
    BAN_FAILED: "Cấm người dùng thất bại",
    UNBAN_FAILED: "Bỏ cấm người dùng thất bại",
    NOT_FOUND: "Không tìm thấy người dùng",
  },
} as const;

export const PASSWORD_MESSAGES = {
  SUCCESS: {
    CHANGED: "Đổi mật khẩu thành công",
  },
  ERROR: {
    CHANGE_FAILED: "Đổi mật khẩu thất bại",
    CURRENT_PASSWORD_INCORRECT: "Mật khẩu hiện tại không đúng",
    NEW_PASSWORD_SAME: "Mật khẩu mới phải khác mật khẩu cũ",
  },
} as const;

export const ADMIN_MESSAGES = {
  SUCCESS: {
    STUDENTS_IMPORTED: "Nhập danh sách sinh viên thành công",
    MENTOR_APPROVED: "Phê duyệt mentor thành công",
  },
  ERROR: {
    IMPORT_STUDENTS_FAILED: "Nhập danh sách sinh viên thất bại",
    APPROVE_MENTOR_FAILED: "Phê duyệt mentor thất bại",
    INVALID_FILE: "File không hợp lệ",
  },
} as const;

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

export const PARTICIPATION_MESSAGES = {
  SUCCESS: {
    STARTED: "Bắt đầu làm bài thành công",
    SUBMITTED: "Nộp bài thành công",
  },
  ERROR: {
    START_FAILED: "Không thể bắt đầu làm bài",
    SUBMIT_FAILED: "Nộp bài thất bại",
    NO_ACCESS: "Bạn không có quyền truy cập bài thi này",
    NOT_STARTED: "Chưa đến giờ thi",
    ALREADY_ENDED: "Bài thi đã kết thúc",
    LOAD_FAILED: "Không thể tải lịch sử làm bài",
  },
} as const;

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
