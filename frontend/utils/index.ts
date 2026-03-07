// JWT utilities
export {
  decodeJwtToken,
  isTokenExpired,
  getRoleFromToken,
  getUserIdFromToken,
  getEmailFromToken,
} from "./jwt.utils";

// Exam score utilities
export {
  getAllExamScores,
  saveExamScore,
  getExamScore,
  getStudentExamScores,
  getExamRoomScores,
  deleteExamScore,
  clearAllExamScores,
  type ExamScore,
} from "./exam-score.utils";

// Submission history utilities
export {
  getMockSubmissions,
  getMockSubmissionDetail,
  saveMockSubmission,
  createMockSubmissionFromJudgeResult,
} from "./submission-history.utils";

// Auth session utilities
export { registerAuthCleanup, forceLogout } from "./auth-session";

// Query client
export { queryClient } from "./query-client";

// Class name utility
export { cn } from "./cn";
