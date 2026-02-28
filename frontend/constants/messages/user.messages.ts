// User related messages

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
