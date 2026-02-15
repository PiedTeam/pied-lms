// Quizlet Interfaces

export interface QuestionResponse {
  id: number;
  content: string;
  score: number;
  type: QuestionType;
  options: string[];
  correctAnswers: string[];
}

export enum QuestionType {
  SingleChoice = 0,
  MultipleChoice = 1,
}

export interface QuizletResponse {
  id: number;
  title: string;
  description: string;
  isPublished: boolean;
  userName: string;
  createdAt: string;
  updatedAt: string;
  questions: QuestionResponse[];
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

export interface StudentQuizletResponse {
  id: number;
  title: string;
  userName: string;
  createdAt: string;
  isPublished: boolean;
  listQuestion: StudentQuestionDto[];
}
