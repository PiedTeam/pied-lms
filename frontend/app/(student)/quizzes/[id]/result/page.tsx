"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
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
import { QuizletLevel } from "@/interface/quizlet/quizlet.interface";

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
  questions: Array<{
    content: string;
    score: number;
    answers: string[];
    correctAnswers: string[];
    questionType: string;
    isHidden: boolean;
    level: QuizletLevel;
  }>;
}

export default function QuizResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem(`quiz-result-${id}`);
    if (data) {
      setResult(JSON.parse(data));
    }
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

  const percentage = (result.earnedScore / result.totalScore) * 100;
  const isPassed = percentage >= 60;
  const answeredCount = result.answers.filter(
    (answer) => answer.selectedAnswers.length > 0,
  ).length;
  const unansweredCount = result.totalQuestions - answeredCount;

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
                {result.totalQuestions - result.correctCount}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {(
                  ((result.totalQuestions - result.correctCount) /
                    result.totalQuestions) *
                  100
                ).toFixed(1)}
                % wrong
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
              Review your answers and the correct solutions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-6">
            {result.questions.map((question, questionIndex) => {
              const userAnswer = result.answers.find(
                (answer) => answer.questionIndex === questionIndex,
              );
              const userAnswers = userAnswer?.selectedAnswers || [];
              const correctAnswers = question.correctAnswers;
              const isCorrect =
                JSON.stringify([...userAnswers].sort()) ===
                JSON.stringify([...correctAnswers].sort());

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
                          ) : userAnswers.length === 0 ? (
                            <Badge
                              variant="outline"
                              className="border-dashed px-4 py-2 text-base"
                            >
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

                      <div className="space-y-3">
                        {question.answers.map((answer, answerIndex) => {
                          const isUserAnswer = userAnswers.includes(answer);
                          const isCorrectAnswer =
                            correctAnswers.includes(answer);

                          return (
                            <div
                              key={answerIndex}
                              className={`rounded-xl border-2 p-4 transition-all ${
                                isCorrectAnswer
                                  ? "border-green-500 bg-green-50 shadow-md"
                                  : isUserAnswer
                                    ? "border-red-500 bg-red-50 shadow-md"
                                    : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="rounded bg-primary/10 px-3 py-1 font-mono text-base font-bold">
                                  {String.fromCharCode(65 + answerIndex)}.
                                </span>
                                <span className="flex-1 text-base">
                                  {answer}
                                </span>
                                {isCorrectAnswer && (
                                  <Badge className="bg-green-600 text-white">
                                    Correct Answer
                                  </Badge>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <Badge variant="destructive">
                                    You selected
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
