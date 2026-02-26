"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Award,
  RotateCcw,
  Home,
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
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
            <Award className="h-3 w-3 mr-1" />
            Dễ
          </Badge>
        );
      case QuizletLevel.Medium:
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700">
            <Award className="h-3 w-3 mr-1" />
            Trung bình
          </Badge>
        );
      case QuizletLevel.Hard:
        return (
          <Badge className="bg-red-600 hover:bg-red-700">
            <Award className="h-3 w-3 mr-1" />
            Khó
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!result) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-destructive">Không tìm thấy kết quả</p>
          <Button className="mt-4" onClick={() => router.push("/quizzes")}>
            Về danh sách bài thi
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
    return `${mins} phút ${secs} giây`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6 space-y-6 max-w-6xl">
        {/* Header */}
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
            <h1 className="text-3xl font-bold text-primary">Kết quả bài thi</h1>
            <p className="text-muted-foreground">{result.quizletTitle}</p>
          </div>
        </div>

        {/* Result Summary Card */}
        <Card
          className={`border-4 shadow-2xl ${
            isPassed
              ? "border-green-500 bg-gradient-to-br from-green-50 to-white"
              : "border-orange-500 bg-gradient-to-br from-orange-50 to-white"
          }`}
        >
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {isPassed ? (
                <div className="p-6 bg-green-100 rounded-full">
                  <Trophy className="h-16 w-16 text-green-600" />
                </div>
              ) : (
                <div className="p-6 bg-orange-100 rounded-full">
                  <RotateCcw className="h-16 w-16 text-orange-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-4xl font-bold mb-2">
              {isPassed ? "Chúc mừng! 🎉" : "Cố gắng lên! 💪"}
            </CardTitle>
            <CardDescription className="text-lg">
              {isPassed
                ? "Bạn đã vượt qua bài thi với kết quả xuất sắc!"
                : "Bạn cần đạt ít nhất 60% để đạt. Hãy thử lại nhé!"}
            </CardDescription>
            <div className="mt-6">
              <div className="text-6xl font-bold text-primary mb-2">
                {percentage.toFixed(1)}%
              </div>
              <Progress value={percentage} className="h-4 mt-4" />
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm số</CardTitle>
              <Trophy className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {result.earnedScore.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                / {result.totalScore} điểm
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đúng</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {result.correctCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                / {result.totalQuestions} câu
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sai</CardTitle>
              <XCircle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {result.totalQuestions - result.correctCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {(
                  ((result.totalQuestions - result.correctCount) /
                    result.totalQuestions) *
                  100
                ).toFixed(1)}
                % sai
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thời gian</CardTitle>
              <Clock className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Math.floor(result.timeElapsed / 60)}:
                {(result.timeElapsed % 60).toString().padStart(2, "0")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTime(result.timeElapsed)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Answer Review */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-50 border-b-2">
            <CardTitle className="text-2xl">Xem lại đáp án</CardTitle>
            <CardDescription className="text-base">
              Xem lại câu trả lời của bạn và đáp án đúng
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
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
                <div key={qIndex} className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Badge
                      variant="outline"
                      className="text-base px-4 py-2 mt-1"
                    >
                      Câu {qIndex + 1}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <p className="font-semibold text-lg mb-3">
                            {question.content}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="secondary"
                              className="text-sm bg-blue-100 text-blue-700"
                            >
                              {question.questionType === "SingleChoice"
                                ? "Một đáp án"
                                : "Nhiều đáp án"}
                            </Badge>
                            {getLevelBadge(question.level, question.isHidden)}
                            <Badge variant="outline" className="text-sm">
                              {question.score} điểm
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <Badge className="bg-green-600 text-white px-4 py-2 text-base">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Đúng
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="px-4 py-2 text-base"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Sai
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {question.answers.map((answer, aIndex) => {
                          const isUserAnswer = userAnswers.includes(answer);
                          const isCorrectAnswer =
                            correctAnswers.includes(answer);

                          return (
                            <div
                              key={aIndex}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                isCorrectAnswer
                                  ? "border-green-500 bg-green-50 shadow-md"
                                  : isUserAnswer
                                    ? "border-red-500 bg-red-50 shadow-md"
                                    : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-base font-bold bg-primary/10 px-3 py-1 rounded">
                                  {String.fromCharCode(65 + aIndex)}.
                                </span>
                                <span className="flex-1 text-base">
                                  {answer}
                                </span>
                                {isCorrectAnswer && (
                                  <Badge className="bg-green-600 text-white">
                                    Đáp án đúng
                                  </Badge>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <Badge variant="destructive">
                                    Bạn đã chọn
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {qIndex < result.questions.length - 1 && (
                    <Separator className="my-6" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pb-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/quizzes")}
            className="px-8"
          >
            <Home className="mr-2 h-5 w-5" />
            Về danh sách
          </Button>
          <Button
            size="lg"
            onClick={() => router.push(`/quizzes/${id}`)}
            className="px-8 bg-primary hover:bg-primary/90"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Làm lại
          </Button>
        </div>
      </div>
    </div>
  );
}
