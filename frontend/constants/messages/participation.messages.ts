// Participation related messages

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
