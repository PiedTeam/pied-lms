// Quizlet Interfaces

export interface QuestionResponse {
  id: number;
  content: string;
  score: number;
  type: QuestionType;
  answers: string[]; // Backend returns "answers" not "options"
  correctAnswers: string[];
}

export enum QuestionType {
  SingleChoice = 0,
  MultipleChoice = 1,
}

// Summary response for list (GET /api/quizlets)
export interface QuizletSummaryResponse {
  id: number;
  title: string;
  description: string;
  userName: string;
  isPublished: boolean;
  quantityQuestion: number; // Backend returns quantityQuestion not questionCount
  createdAt: string;
  updatedAt: string;
}

// Full detail response (GET /api/quizlets/{id})
export interface QuizletResponse {
  id: number;
  title: string;
  description: string;
  isPublished: boolean;
  listQuestion: QuestionResponse[];
  createdAt: string;
}

export interface CreateQuizletRequest {
  title: string;
  description: string;
  isPublished: boolean;
  listQuestion: File; // Excel file (.xlsx) with columns: Content, Option1, Option2, Option3, Option4, CorrectAnswer
}

export interface UpdateQuestionDto {
  content: string;
  score: number;
  answers: string[];
  correctAnswers: string[];
  questionType: string;
}

export interface UpdateQuizletRequest {
  title: string;
  isPublished: boolean;
  listQuestion: UpdateQuestionDto[];
}

export interface StudentQuestionDto {
  content: string;
  score: number;
  answers: string[]; // Backend returns "answers" not "options"
  correctAnswers: string[];
  questionType: string; // "SingleChoice" or "MultipleChoice"
}

// Student summary response (GET /api/students/quizlets)
// Backend returns QuizletSummaryResponse (same as admin/teacher list)
export interface StudentQuizletSummaryResponse {
  id: number;
  title: string;
  description: string;
  userName: string;
  isPublished: boolean;
  quantityQuestion: number; // Backend uses quantityQuestion not questionCount
  createdAt: string;
  updatedAt: string;
}

// Student full detail response (GET /api/students/quizlets/{id})
// Backend returns QuizletDetailResponse with ListQuestion
export interface StudentQuizletResponse {
  id: number;
  title: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  listQuestion: StudentQuestionDto[]; // Backend uses listQuestion not questions
}
