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
<<<<<<< HEAD
=======
  useResetPassword,
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
  useGetUserById,
  useGetAllUsers,
  useGetAllStudents,
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
<<<<<<< HEAD
=======
  useGetExamRoomsByAdmin,
  useGetAllExamRooms,
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
  useGetExamRoomById,
  useUpdateExamRoom,
  useDeleteExamRoom,
  useAssignExamToRoom,
  useRemoveExamFromRoom,
  useGetAvailableExamRooms,
  useCheckExamRoomAccess,
  useEnrollStudents,
} from "./exam-room/exam-room.service";

// Exam Services (Mentor - CRUD exam questions)
export {
  useCreateExam,
  useGetExamsByMentor,
<<<<<<< HEAD
=======
  useGetExamsByAdmin,
  useGetAllExams,
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
  useGetExamById,
  useUpdateExam,
  useDeleteExam,
} from "./exam/exam.service";

// Exam Participation Services (Student - taking exams)
export {
  useStartExam,
  useGetStudentParticipations,
  useGetExamRoomEnrollments,
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
<<<<<<< HEAD
=======

// Compiler Services
export {
  useCompileCode,
  useJudgeCode,
  useJudgeCodeFromFile,
} from "./compiler/compiler.mutation";
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
