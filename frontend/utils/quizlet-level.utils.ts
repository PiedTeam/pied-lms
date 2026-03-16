import { QuizletLevel } from "@/interface/quizlet/quizlet.interface";

export function normalizeQuizletLevel(level: unknown): QuizletLevel | null {
  if (
    typeof level === "number" &&
    Number.isInteger(level) &&
    level >= QuizletLevel.Easy &&
    level <= QuizletLevel.Hard
  ) {
    return level as QuizletLevel;
  }

  if (typeof level === "string") {
    const trimmedLevel = level.trim();

    if (!trimmedLevel) {
      return null;
    }

    const numericLevel = Number(trimmedLevel);
    if (
      Number.isInteger(numericLevel) &&
      numericLevel >= QuizletLevel.Easy &&
      numericLevel <= QuizletLevel.Hard
    ) {
      return numericLevel as QuizletLevel;
    }

    switch (trimmedLevel.toLowerCase()) {
      case "easy":
        return QuizletLevel.Easy;
      case "medium":
        return QuizletLevel.Medium;
      case "hard":
        return QuizletLevel.Hard;
      default:
        return null;
    }
  }

  return null;
}

export function getQuizletLevelLabel(level: unknown): string {
  switch (normalizeQuizletLevel(level)) {
    case QuizletLevel.Easy:
      return "Easy";
    case QuizletLevel.Medium:
      return "Medium";
    case QuizletLevel.Hard:
      return "Hard";
    default:
      return "Not selected";
  }
}
