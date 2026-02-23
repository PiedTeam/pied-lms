// Auth Services
export {
  useLogin,
  useRegister,
  useLogout,
  useRefreshToken,
} from "./auth/auth.service";

// User Services
export {
  useChangePassword,
  useGetUserById,
  useGetAllUsers,
} from "./user/user.service";

// Admin Services
export { useImportStudents, useApproveMentor } from "./admin/admin.service";

// Question Services
export {
  useGetQuestions,
  useGetQuestionById,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "./question/question.service";

// Exam Room Services
export {
  useCreateExamRoom,
  useGetExamRoomsByMentor,
  useGetExamRoomById,
  useUpdateExamRoom,
  useDeleteExamRoom,
  useAssignExamToRoom,
  useRemoveExamFromRoom,
  useGetAvailableExamRooms,
  useCheckExamRoomAccess,
} from "./exam-room/exam-room.service";

// Exam Services (Mentor - CRUD exam questions)
export {
  useCreateExam,
  useGetExamsByMentor,
  useGetExamById,
  useUpdateExam,
  useDeleteExam,
} from "./exam/exam.service";

// Exam Participation Services (Student - taking exams)
export {
  useStartExam,
  useGetStudentParticipations,
} from "./exam-participation/exam-participation.service";

// Quizlet Services
export {
  useGetStudentQuizlets,
  useGetStudentQuizletById,
  useGetAllQuizlets,
  useGetQuizletById,
  useCreateQuizlet,
  useUpdateQuizlet,
  useTogglePublishQuizlet,
  useDeleteQuizlet,
} from "./quizlet/quizlet.service";

// TestCase Services
export {
  useGetTestCasesByExam, // Changed from useGetTestCasesByQuestion
  useGetTestCaseById,
  useCreateTestCase,
  useUpdateTestCase,
  useDeleteTestCase,
  useRunTestCase,
} from "./testcase/testcase.service";
