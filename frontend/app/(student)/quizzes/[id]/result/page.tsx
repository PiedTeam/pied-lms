"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Home,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  QuizletLevel,
  type StudentQuestionDto,
} from "@/interface/quizlet/quizlet.interface";

interface QuizResult {
  quizletId: number;
  quizletTitle: string;
  totalQuestions: number;
  correctCount: number;
  totalScore: number;
  earnedScore: number;
  timeElapsed: number;
  answers: Array<{
    questionIndex: number;
    selectedAnswers: string[];
  }>;
  questions: StudentQuestionDto[];
}

export default function QuizResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const result = useMemo<QuizResult | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const data = sessionStorage.getItem(`quiz-result-${id}`);
    return data ? (JSON.parse(data) as QuizResult) : null;
  }, [id]);

  const getLevelBadge = (level: QuizletLevel, isHidden: boolean) => {
    if (isHidden) return null;

    switch (level) {
      case QuizletLevel.Easy:
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <Award className="mr-1 h-3 w-3" />
            Easy
          </Badge>
        );
      case QuizletLevel.Medium:
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700">
            <Award className="mr-1 h-3 w-3" />
            Medium
          </Badge>
        );
      case QuizletLevel.Hard:
        return (
          <Badge className="bg-red-600 hover:bg-red-700">
            <Award className="mr-1 h-3 w-3" />
            Hard
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!result) {
    return (
      <div className="container mx-auto p-6">
        <div className="py-12 text-center">
          <p className="text-destructive">Result not found</p>
          <Button className="mt-4" onClick={() => router.push("/quizzes")}>
            Back to Quiz List
          </Button>
        </div>
      </div>
    );
  }

  const percentage =
    result.totalScore > 0 ? (result.earnedScore / result.totalScore) * 100 : 0;
  const isPassed = percentage >= 60;
  const answeredCount = result.answers.filter(
    (answer) => answer.selectedAnswers.length > 0,
  ).length;
  const unansweredCount = result.totalQuestions - answeredCount;
  const incorrectCount = Math.max(answeredCount - result.correctCount, 0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/quizzes")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Quiz Results</h1>
            <p className="text-muted-foreground">{result.quizletTitle}</p>
          </div>
        </div>

        <Card
          className={`border-4 shadow-2xl ${
            isPassed
              ? "border-green-500 bg-linear-to-br from-green-50 to-white"
              : "border-orange-500 bg-linear-to-br from-orange-50 to-white"
          }`}
        >
          <CardHeader className="pb-4 text-center">
            <div className="mb-4 flex justify-center">
              {isPassed ? (
                <div className="rounded-full bg-green-100 p-6">
                  <Trophy className="h-16 w-16 text-green-600" />
                </div>
              ) : (
                <div className="rounded-full bg-orange-100 p-6">
                  <RotateCcw className="h-16 w-16 text-orange-600" />
                </div>
              )}
            </div>
            <CardTitle className="mb-2 text-4xl font-bold">
              {isPassed ? "Congratulations!" : "Keep trying!"}
            </CardTitle>
            <CardDescription className="text-lg">
              {isPassed
                ? "You passed the quiz with an excellent result!"
                : "You need at least 60% to pass. Try again!"}
            </CardDescription>
            <div className="mt-6">
              <div className="mb-2 text-6xl font-bold text-primary">
                {percentage.toFixed(1)}%
              </div>
              <Progress value={percentage} className="mt-4 h-4" />
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-5">
          <Card className="border-2 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score</CardTitle>
              <Trophy className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {result.earnedScore.toFixed(1)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                / {result.totalScore} points
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Correct</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {result.correctCount}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                / {result.totalQuestions} questions
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wrong</CardTitle>
              <XCircle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {incorrectCount}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {answeredCount > 0
                  ? `${((incorrectCount / answeredCount) * 100).toFixed(1)}% of answered questions`
                  : "No wrong answers"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skipped</CardTitle>
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">
                {unansweredCount}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                unanswered questions
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Taken</CardTitle>
              <Clock className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Math.floor(result.timeElapsed / 60)}:
                {(result.timeElapsed % 60).toString().padStart(2, "0")}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatTime(result.timeElapsed)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="border-b-2 bg-linear-to-r from-primary/5 to-purple-50">
            <CardTitle className="text-2xl">Review Answers</CardTitle>
            <CardDescription className="text-base">
              Review your answers and the explanation for each question
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-6">
            {result.questions.map((question, questionIndex) => {
              const userAnswer = result.answers.find(
                (answer) => answer.questionIndex === questionIndex,
              );
              const userAnswers = userAnswer?.selectedAnswers || [];
              const correctAnswers = question.correctAnswers;
              const isUnanswered = userAnswers.length === 0;
              const isCorrect =
                JSON.stringify([...userAnswers].sort()) ===
                JSON.stringify([...correctAnswers].sort());
              const correctAnswerSummaries = question.answers
                .map((answer, answerIndex) => ({
                  answer: answer.content,
                  label: String.fromCharCode(65 + answerIndex),
                }))
                .filter(({ answer }) => correctAnswers.includes(answer));

              return (
                <div key={questionIndex} className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Badge
                      variant="outline"
                      className="mt-1 px-4 py-2 text-base"
                    >
                      Question {questionIndex + 1}
                    </Badge>

                    <div className="flex-1">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="mb-3 text-lg font-semibold">
                            {question.content}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-sm text-blue-700"
                            >
                              {question.questionType === "SingleChoice"
                                ? "Single Choice"
                                : "Multiple Choice"}
                            </Badge>
                            {getLevelBadge(question.level, question.isHidden)}
                            <Badge variant="outline" className="text-sm">
                              {question.score} points
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <Badge className="bg-green-600 px-4 py-2 text-base text-white">
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Correct
                            </Badge>
                          ) : isUnanswered ? (
                            <Badge
                              variant="outline"
                              className="border-amber-300 bg-amber-50 px-4 py-2 text-base text-amber-800"
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Not answered
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="px-4 py-2 text-base"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Incorrect
                            </Badge>
                          )}
                        </div>
                      </div>

                      {!isCorrect && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50/80 p-4">
                          <div className="flex items-start gap-3">
                            <div className="rounded-full bg-red-100 p-2 text-red-700">
                              <XCircle className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-red-900">
                                {isUnanswered
                                  ? "You did not answer this question."
                                  : "Your selected answer was incorrect."}
                              </p>
                              <p className="text-sm text-red-800">
                                Review the highlighted options and the
                                explanation below to understand the correct
                                reasoning.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {question.answers.map((answer, answerIndex) => {
                          const answerContent = answer.content;
                          const isUserAnswer = userAnswers.includes(answerContent);
                          const isCorrectAnswer =
                            correctAnswers.includes(answerContent);

                          return (
                            <div
                              key={`${questionIndex}-${answerIndex}-${answerContent}`}
                              className={`rounded-xl border-2 p-4 transition-all ${
                                isCorrectAnswer
                                  ? "border-green-500 bg-green-50 shadow-md"
                                  : isUserAnswer
                                    ? "border-red-300 bg-red-50/70"
                                    : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="rounded bg-primary/10 px-3 py-1 font-mono text-base font-bold">
                                  {String.fromCharCode(65 + answerIndex)}.
                                </span>
                                <span className="flex-1 text-base">
                                  {answerContent}
                                </span>
                                {isCorrectAnswer && (
                                  <Badge className="bg-green-600 text-white">
                                    Correct Answer
                                  </Badge>
                                )}
                                {isUserAnswer && (
                                  <Badge
                                    className={
                                      isCorrectAnswer
                                        ? "bg-green-600 text-white"
                                        : "bg-red-600 text-white"
                                    }
                                  >
                                    You selected
                                  </Badge>
                                )} 
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {question.explanation && (
                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm italic text-slate-700">
                          {question.explanation}
                        </div>
                      )}

                      {isUnanswered && correctAnswerSummaries.length > 0 && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex items-start gap-3">
                              <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                                <AlertCircle className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-amber-900">
                                  Correct answers for this question
                                </p>
                                <p className="text-sm text-amber-800">
                                  The correct options are highlighted above and
                                  listed here for quick review.
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {correctAnswerSummaries.map(({ answer, label }) => (
                                <div
                                  key={`${label}-${answer}`}
                                  className="rounded-full border border-green-200 bg-white px-3 py-1 text-sm font-medium text-green-700 shadow-sm"
                                >
                                  {label}. {answer}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {questionIndex < result.questions.length - 1 && (
                    <Separator className="my-6" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4 pb-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/quizzes")}
            className="px-8"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to List
          </Button>
          <Button
            size="lg"
            onClick={() => router.push(`/quizzes/${id}`)}
            className="bg-primary px-8 hover:bg-primary/90"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
