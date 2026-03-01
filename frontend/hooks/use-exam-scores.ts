import { useState, useEffect } from "react";
import {
  getAllExamScores,
  getExamScore,
  getStudentExamScores,
  getExamRoomScores,
  type ExamScore,
} from "@/utils/exam-score.utils";
import { useAuthStore } from "@/store/auth.store";

/**
 * Hook to get all exam scores
 */
export function useAllExamScores() {
  const [scores, setScores] = useState<ExamScore[]>([]);

  useEffect(() => {
    setScores(getAllExamScores());
  }, []);

  return scores;
}

/**
 * Hook to get exam score for current student and specific exam
 */
export function useExamScore(examRoomId: string, examId: string) {
  const [score, setScore] = useState<ExamScore | null>(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      setScore(getExamScore(user.uuid, examRoomId, examId));
    }
  }, [user, examRoomId, examId]);

  return score;
}

/**
 * Hook to get all exam scores for current student
 */
export function useStudentExamScores() {
  const [scores, setScores] = useState<ExamScore[]>([]);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      setScores(getStudentExamScores(user.uuid));
    }
  }, [user]);

  return scores;
}

/**
 * Hook to get all exam scores for current student in a specific exam room
 */
export function useExamRoomScores(examRoomId: string) {
  const [scores, setScores] = useState<ExamScore[]>([]);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      setScores(getExamRoomScores(user.uuid, examRoomId));
    }
  }, [user, examRoomId]);

  return scores;
}
