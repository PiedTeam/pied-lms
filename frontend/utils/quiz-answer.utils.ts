import type { QuizAnswerOption } from "@/interface/quizlet/quizlet.interface";

export interface QuizAnswerOptionApiShape {
  content?: string | null;
  explanation?: string | null;
  description?: string | null;
}

export type QuizAnswerOptionInput = string | QuizAnswerOptionApiShape;

export function normalizeQuizAnswerOption(
  option: QuizAnswerOptionInput,
): QuizAnswerOption {
  if (typeof option === "string") {
    return { content: option };
  }

  return {
    content: option.content?.trim() || "",
    explanation: normalizeExplanation(option.explanation, option.description),
  };
}

export function normalizeQuizAnswerOptions(
  options: QuizAnswerOptionInput[] | undefined,
): QuizAnswerOption[] {
  return (options ?? [])
    .map(normalizeQuizAnswerOption)
    .filter((option) => option.content.length > 0);
}

export function getQuizAnswerExplanation(
  option: Pick<QuizAnswerOption, "explanation">,
): string | null {
  return normalizeExplanation(option.explanation);
}

function normalizeExplanation(
  ...values: Array<string | null | undefined>
): string | null {
  const explanation = values.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  return explanation?.trim() || null;
}
