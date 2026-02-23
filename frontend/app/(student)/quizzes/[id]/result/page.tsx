"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

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

  if (!result) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-destructive">Result not found</p>
          <Button className="mt-4" onClick={() => router.push("/quizzes")}>
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  const percentage = (result.earnedScore / result.totalScore) * 100;
  const isPassed = percentage >= 60;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/quizzes")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Quiz Results</h1>
          <p className="text-muted-foreground">{result.quizletTitle}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result.earnedScore.toFixed(1)} / {result.totalScore}
            </div>
            <p className="text-xs text-muted-foreground">
              {percentage.toFixed(1)}%
            </p>
            <Progress value={percentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correct</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {result.correctCount}
            </div>
            <p className="text-xs text-muted-foreground">
              out of {result.totalQuestions} questions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incorrect</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {result.totalQuestions - result.correctCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                ((result.totalQuestions - result.correctCount) /
                  result.totalQuestions) *
                100
              ).toFixed(1)}
              % incorrect
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(result.timeElapsed)}
            </div>
            <p className="text-xs text-muted-foreground">Total time taken</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isPassed ? "Congratulations! 🎉" : "Keep Practicing! 💪"}
              </CardTitle>
              <CardDescription>
                {isPassed
                  ? "You passed the quiz with a great score!"
                  : "You need at least 60% to pass. Try again!"}
              </CardDescription>
            </div>
            <Badge variant={isPassed ? "default" : "destructive"}>
              {isPassed ? "PASSED" : "FAILED"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Answer Review</CardTitle>
          <CardDescription>
            Review your answers and see the correct solutions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {result.questions.map((question, qIndex) => {
            const userAnswer = result.answers.find(
              (a) => a.questionIndex === qIndex,
            );
            const userAnswers = userAnswer?.selectedAnswers || [];
            const correctAnswers = question.correctAnswers;
            const isCorrect =
              JSON.stringify(userAnswers.sort()) ===
              JSON.stringify(correctAnswers.sort());

            return (
              <div key={qIndex} className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    {qIndex + 1}
                  </Badge>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className="font-medium">{question.content}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{question.score} pts</Badge>
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {question.answers.map((answer, aIndex) => {
                        const isUserAnswer = userAnswers.includes(answer);
                        const isCorrectAnswer = correctAnswers.includes(answer);

                        return (
                          <div
                            key={aIndex}
                            className={`p-3 rounded-lg border-2 ${
                              isCorrectAnswer
                                ? "border-green-500 bg-green-50"
                                : isUserAnswer
                                  ? "border-red-500 bg-red-50"
                                  : "border-border"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">
                                {String.fromCharCode(65 + aIndex)}.
                              </span>
                              <span className="flex-1">{answer}</span>
                              {isCorrectAnswer && (
                                <Badge
                                  variant="default"
                                  className="bg-green-600"
                                >
                                  Correct
                                </Badge>
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <Badge variant="destructive">Your answer</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {qIndex < result.questions.length - 1 && <Separator />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.push("/quizzes")}>
          Back to Quizzes
        </Button>
        <Button onClick={() => router.push(`/quizzes/${id}`)}>
          Retake Quiz
        </Button>
      </div>
    </div>
  );
}
