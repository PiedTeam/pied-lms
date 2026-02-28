// Utility functions for managing exam scores in localStorage

export interface ExamScore {
  studentId: string;
  examRoomId: string;
  examId: string;
  score: number;
  totalMarks: number;
  passedTestCases: number;
  totalTestCases: number;
  submittedAt: string;
}

const EXAM_SCORES_KEY = "exam_scores";

/**
 * Get all exam scores from localStorage
 */
export function getAllExamScores(): ExamScore[] {
  if (typeof window === "undefined") return [];

  try {
    const scoresStr = localStorage.getItem(EXAM_SCORES_KEY);
    if (!scoresStr) return [];
    return JSON.parse(scoresStr);
  } catch (error) {
    console.error("Error reading exam scores:", error);
    return [];
  }
}

/**
 * Save exam score to localStorage
 */
export function saveExamScore(score: ExamScore): void {
  if (typeof window === "undefined") return;

  try {
    const scores = getAllExamScores();

    // Check if score already exists for this student/room/exam
    const existingIndex = scores.findIndex(
      (s) =>
        s.studentId === score.studentId &&
        s.examRoomId === score.examRoomId &&
        s.examId === score.examId,
    );

    if (existingIndex >= 0) {
      // Update existing score
      scores[existingIndex] = score;
    } else {
      // Add new score
      scores.push(score);
    }

    localStorage.setItem(EXAM_SCORES_KEY, JSON.stringify(scores));
  } catch (error) {
    console.error("Error saving exam score:", error);
  }
}

/**
 * Get exam score for specific student/room/exam
 */
export function getExamScore(
  studentId: string,
  examRoomId: string,
  examId: string,
): ExamScore | null {
  const scores = getAllExamScores();
  return (
    scores.find(
      (s) =>
        s.studentId === studentId &&
        s.examRoomId === examRoomId &&
        s.examId === examId,
    ) || null
  );
}

/**
 * Get all exam scores for a specific student
 */
export function getStudentExamScores(studentId: string): ExamScore[] {
  const scores = getAllExamScores();
  return scores.filter((s) => s.studentId === studentId);
}

/**
 * Get all exam scores for a specific exam room
 */
export function getExamRoomScores(
  studentId: string,
  examRoomId: string,
): ExamScore[] {
  const scores = getAllExamScores();
  return scores.filter(
    (s) => s.studentId === studentId && s.examRoomId === examRoomId,
  );
}

/**
 * Delete exam score for specific student/room/exam
 */
export function deleteExamScore(
  studentId: string,
  examRoomId: string,
  examId: string,
): void {
  if (typeof window === "undefined") return;

  try {
    const scores = getAllExamScores();
    const filteredScores = scores.filter(
      (s) =>
        !(
          s.studentId === studentId &&
          s.examRoomId === examRoomId &&
          s.examId === examId
        ),
    );
    localStorage.setItem(EXAM_SCORES_KEY, JSON.stringify(filteredScores));
  } catch (error) {
    console.error("Error deleting exam score:", error);
  }
}

/**
 * Clear all exam scores (use with caution - typically only for testing)
 */
export function clearAllExamScores(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(EXAM_SCORES_KEY);
}
