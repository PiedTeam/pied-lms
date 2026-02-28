// Authentication and password related messages

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
