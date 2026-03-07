import type { JudgeCodeResponse } from "@/interface/compiler/compiler.interface";
import type {
  StudentSubmission,
  StudentSubmissionDetail,
} from "@/interface/student/code-submission.interface";

const getStorageKey = (examId: string) => `mock_submission_history_${examId}`;

export function getMockSubmissions(examId: string): StudentSubmission[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(getStorageKey(examId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StudentSubmissionDetail[];

    return parsed
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map((item) => ({
        id: item.id,
        examId: item.examId,
        language: item.language,
        status: item.status,
        runtime: item.runtime,
        memory: item.memory,
        passedTestCases: item.passedTestCases,
        totalTestCases: item.totalTestCases,
        createdAt: item.createdAt,
      }));
  } catch (error) {
    console.error("Failed to read mock submissions", error);
    return [];
  }
}

export function getMockSubmissionDetail(
  examId: string,
  submissionId: string,
): StudentSubmissionDetail | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(getStorageKey(examId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudentSubmissionDetail[];
    return parsed.find((item) => item.id === submissionId) ?? null;
  } catch (error) {
    console.error("Failed to read mock submission detail", error);
    return null;
  }
}

export function saveMockSubmission(
  examId: string,
  submission: StudentSubmissionDetail,
): void {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(getStorageKey(examId));
    const list = raw ? (JSON.parse(raw) as StudentSubmissionDetail[]) : [];
    const existingIndex = list.findIndex((item) => item.id === submission.id);

    if (existingIndex >= 0) {
      list[existingIndex] = submission;
    } else {
      list.unshift(submission);
    }

    localStorage.setItem(getStorageKey(examId), JSON.stringify(list));
  } catch (error) {
    console.error("Failed to save mock submission", error);
  }
}

export function createMockSubmissionFromJudgeResult(
  examId: string,
  code: string,
  language: string,
  judgeResult: JudgeCodeResponse,
): StudentSubmissionDetail {
  const now = new Date().toISOString();
  const runtimeValues = judgeResult.results
    .map((item) => item.executionTime)
    .filter((value): value is number => value !== null);
  const runtime = runtimeValues.length > 0 ? Math.max(...runtimeValues) : null;

  return {
    id: `mock-${crypto.randomUUID()}`,
    examId,
    language,
    code,
    status: judgeResult.passed === judgeResult.total ? "Accepted" : "Failed",
    runtime,
    memory: null,
    passedTestCases: judgeResult.passed,
    totalTestCases: judgeResult.total,
    createdAt: now,
  };
}
