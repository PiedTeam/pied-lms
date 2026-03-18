import { QuizletLevel } from "@/interface/quizlet/quizlet.interface";

export function normalizeQuizletLevel(level: unknown): QuizletLevel | null {
  console.log("🔍 normalizeQuizletLevel input:", level, typeof level);

  if (
    typeof level === "number" &&
    Number.isInteger(level) &&
    level >= QuizletLevel.Easy &&
    level <= QuizletLevel.Hard
  ) {
    console.log("🔍 normalizeQuizletLevel returning number:", level);
    return level as QuizletLevel;
  }

  if (typeof level === "string") {
    const trimmedLevel = level.trim();

    if (!trimmedLevel) {
      console.log("🔍 normalizeQuizletLevel empty string, returning null");
      return null;
    }

    const numericLevel = Number(trimmedLevel);
    if (
      Number.isInteger(numericLevel) &&
      numericLevel >= QuizletLevel.Easy &&
      numericLevel <= QuizletLevel.Hard
    ) {
      console.log(
        "🔍 normalizeQuizletLevel returning parsed string:",
        numericLevel,
      );
      return numericLevel as QuizletLevel;
    }

    switch (trimmedLevel.toLowerCase()) {
      case "easy":
        console.log("🔍 normalizeQuizletLevel returning Easy from string");
        return QuizletLevel.Easy;
      case "medium":
        console.log("🔍 normalizeQuizletLevel returning Medium from string");
        return QuizletLevel.Medium;
      case "hard":
        console.log("🔍 normalizeQuizletLevel returning Hard from string");
        return QuizletLevel.Hard;
      default:
        console.log("🔍 normalizeQuizletLevel unknown string, returning null");
        return null;
    }
  }

  console.log("🔍 normalizeQuizletLevel unknown type, returning null");
  return null;
}

export function getQuizletLevelLabel(level: unknown): string {
  console.log("🔍 getQuizletLevelLabel input:", level, typeof level);
  const normalizedLevel = normalizeQuizletLevel(level);
  console.log("🔍 getQuizletLevelLabel normalized:", normalizedLevel);

  switch (normalizedLevel) {
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
