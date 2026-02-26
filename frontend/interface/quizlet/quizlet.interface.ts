// Quizlet Interfaces

export enum QuestionType {
  SingleChoice = 0,
  MultipleChoice = 1,
}

export enum QuizletLevel {
  Easy = 1,
  Medium = 2,
  Hard = 3,
}

export interface QuestionResponse {
  content: string;
  score: number;
  answers: string[];
  correctAnswers: string[];
  questionType: string; // "SingleChoice" or "MultipleChoice"
  isHidden: boolean;
  level: QuizletLevel;
}

// Summary response for list (GET /api/quizlets)
export interface QuizletSummaryResponse {
  id: number;
  title: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  isHidden: boolean;
  level: QuizletLevel;
  quantityQuestion: number;
}

// Full detail response (GET /api/quizlets/{id})
export interface QuizletResponse {
  id: number;
  title: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  isHidden: boolean;
  level: QuizletLevel;
  listQuestion: QuestionResponse[];
}

export interface CreateQuizletRequest {
  title: string;
  description: string;
  isPublished: boolean;
  isHidden: boolean;
  level: QuizletLevel;
  listQuestion: File; // JSON file with questions array
}

export interface UpdateQuestionDto {
  content: string;
  score: number;
  questionType: number; // 0 = SingleChoice, 1 = MultipleChoice
  answers: string[];
  correctAnswers: string[];
  isHidden: boolean;
  level: QuizletLevel;
}

export interface UpdateQuizletRequest {
  title: string;
  isPublished: boolean;
  isHidden: boolean;
  level: QuizletLevel;
  listQuestion: UpdateQuestionDto[];
}

export interface StudentQuestionDto {
  content: string;
  score: number;
  answers: string[];
  correctAnswers: string[];
  questionType: string; // "SingleChoice" or "MultipleChoice"
  isHidden: boolean;
  level: QuizletLevel;
}

// Student summary response (GET /api/students/quizlets)
export interface StudentQuizletSummaryResponse {
  id: number;
  title: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  isHidden: boolean;
  level: QuizletLevel;
  quantityQuestion: number;
}

// Student full detail response (GET /api/students/quizlets/{id})
export interface StudentQuizletResponse {
  id: number;
  title: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  isHidden: boolean;
  level: QuizletLevel;
  listQuestion: StudentQuestionDto[];
}
