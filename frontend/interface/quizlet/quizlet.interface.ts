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
  answers: string[];
  correctAnswers: string[];
  questionType: string;
}

// Student summary response (GET /api/students/quizlets)
export interface StudentQuizletSummaryResponse {
  id: number;
  title: string;
  description: string;
  questionCount: number;
}

// Student full detail response (GET /api/students/quizlets/{id})
export interface StudentQuizletResponse {
  id: number;
  title: string;
  description: string;
  questions: StudentQuestionDto[];
}
