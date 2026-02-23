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
  useGetAllQuizlets,
  useGetQuizletById,
  useCreateQuizlet,
  useUpdateQuizlet,
  useDeleteQuizlet,
} from "./quizlet/quizlet.service";
