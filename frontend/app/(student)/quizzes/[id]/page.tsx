"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Award, CheckCircle2, Clock } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useGetStudentQuizletById } from "@/service";
import { QuizletLevel } from "@/interface/quizlet/quizlet.interface";
import { cn } from "@/utils/cn";

interface Answer {
  questionIndex: number;
  selectedAnswers: string[];
}

interface QuestionScore {
  questionIndex: number;
  isCorrect: boolean;
  earnedScore: number;
}

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);

  const { data: quizlet, isLoading } = useGetStudentQuizletById(id);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [questionScores, setQuestionScores] = useState<QuestionScore[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const calculateQuestionScore = (
    questionIndex: number,
    selectedAnswers: string[],
  ) => {
    if (!quizlet) return;

    const quizQuestion = quizlet.listQuestion[questionIndex];
    const correctAnswers = quizQuestion.correctAnswers;

    // Element-by-element comparison instead of JSON.stringify
    const isCorrect =
      correctAnswers.length === selectedAnswers.length &&
      correctAnswers.every((answer) => selectedAnswers.includes(answer));

    const earnedScore = isCorrect ? quizQuestion.score : 0;

    setQuestionScores((prevScores) => {
      const newScores = prevScores.filter(
        (score) => score.questionIndex !== questionIndex,
      );
      newScores.push({
        questionIndex,
        isCorrect,
        earnedScore,
      });
      return newScores;
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizlet) {
    return (
      <div className="container mx-auto p-6">
        <div className="py-12 text-center">
          <p className="text-destructive">Quiz not found</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const question = quizlet.listQuestion[currentQuestion];
  const totalQuestions = quizlet.listQuestion.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const answeredCount = answers.filter(
    (answer) => answer.selectedAnswers.length > 0,
  ).length;
  const unansweredCount = totalQuestions - answeredCount;

  const currentAnswer = answers.find(
    (answer) => answer.questionIndex === currentQuestion,
  );
  const selectedAnswers = currentAnswer?.selectedAnswers || [];

  const handleAnswerToggle = (answer: string) => {
    const isSingleChoice = question.questionType === "SingleChoice";

    let newSelectedAnswers: string[];
    if (isSingleChoice) {
      newSelectedAnswers = [answer];
    } else if (selectedAnswers.includes(answer)) {
      newSelectedAnswers = selectedAnswers.filter(
        (selectedAnswer) => selectedAnswer !== answer,
      );
    } else {
      newSelectedAnswers = [...selectedAnswers, answer];
    }

    const newAnswers = answers.filter(
      (existingAnswer) => existingAnswer.questionIndex !== currentQuestion,
    );
    newAnswers.push({
      questionIndex: currentQuestion,
      selectedAnswers: newSelectedAnswers,
    });
    setAnswers(newAnswers);

    // Calculate score immediately when answer is selected
    calculateQuestionScore(currentQuestion, newSelectedAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const completedAnswers = answers.filter(
      (answer) => answer.selectedAnswers.length > 0,
    );

    let correctCount = 0;
    let totalScore = 0;
    let earnedScore = 0;

    quizlet.listQuestion.forEach((q, index) => {
      totalScore += q.score;

      const questionScore = questionScores.find(
        (score) => score.questionIndex === index,
      );
      if (questionScore?.isCorrect) {
        correctCount++;
        earnedScore += questionScore.earnedScore;
      }
    });

    const resultData = {
      quizletId: id,
      quizletTitle: quizlet.title,
      totalQuestions,
      correctCount,
      totalScore,
      earnedScore,
      timeElapsed,
      answers: completedAnswers,
      questions: quizlet.listQuestion,
    };

    sessionStorage.setItem(`quiz-result-${id}`, JSON.stringify(resultData));
    router.push(`/quizzes/${id}/result`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <Card className="border-2 shadow-lg">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="hover:bg-primary/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-primary">
                    {quizlet.title}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} / {totalQuestions}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-mono text-lg font-semibold text-primary">
                    {formatTime(timeElapsed)}
                  </span>
                </div>
                <div className="hidden rounded-lg border bg-background px-4 py-2 text-sm shadow-sm sm:block">
                  <p className="font-medium text-foreground">
                    {answeredCount}/{totalQuestions} answered
                  </p>
                  <p className="text-muted-foreground">
                    {unansweredCount} remaining
                  </p>
                </div>
                <div className="hidden rounded-lg border bg-background px-4 py-2 text-sm shadow-sm sm:block">
                  <p className="font-medium text-foreground">
                    Score:{" "}
                    {questionScores.reduce((sum, s) => sum + s.earnedScore, 0)}/
                    {quizlet.listQuestion.reduce((sum, q) => sum + q.score, 0)}
                  </p>
                  <p className="text-muted-foreground">
                    {questionScores.filter((s) => s.isCorrect).length} correct
                  </p>
                </div>
              </div>
            </div>

            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        <Card className="border-2 shadow-xl">
          <CardHeader className="border-b-2 bg-gradient-to-r from-primary/5 to-purple-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-3">
                  <Badge variant="outline" className="px-3 py-1 text-base">
                    Question {currentQuestion + 1}
                  </Badge>
                  {getLevelBadge(question.level, question.isHidden)}
                </div>
                <CardTitle className="text-2xl leading-relaxed">
                  {question.content}
                </CardTitle>
                <CardDescription className="mt-3 flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-sm text-blue-700"
                  >
                    {question.questionType === "SingleChoice"
                      ? "Single Choice"
                      : "Multiple Choice"}
                  </Badge>
                  <span className="text-base">
                    {question.questionType === "SingleChoice"
                      ? "Select one correct answer"
                      : "Select all correct answers"}
                  </span>
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 px-4 py-2 text-lg text-blue-700"
                >
                  {question.score} points
                </Badge>
                {selectedAnswers.length > 0 &&
                  (() => {
                    const currentScore = questionScores.find(
                      (s) => s.questionIndex === currentQuestion,
                    );
                    return (
                      <div className="text-center">
                        <Badge
                          className={`px-4 py-2 text-lg ${
                            currentScore?.isCorrect
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {currentScore?.isCorrect
                            ? "✓ Correct"
                            : "✗ Incorrect"}
                        </Badge>
                      </div>
                    );
                  })()}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-6">
            {question.questionType === "SingleChoice" ? (
              <RadioGroup
                value={selectedAnswers[0] || ""}
                onValueChange={handleAnswerToggle}
                className="space-y-4"
              >
                {question.answers.map((answer, index) => {
                  const answerContent = answer.content;
                  const isSelected = selectedAnswers.includes(answerContent);
                  const optionId = `question-${currentQuestion}-option-${index}`;

                  return (
                    <label
                      key={optionId}
                      htmlFor={optionId}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200",
                        isSelected
                          ? "scale-[1.02] border-primary bg-primary/10 shadow-md"
                          : "border-gray-200 hover:border-primary/50 hover:bg-gray-50",
                      )}
                    >
                      <RadioGroupItem
                        id={optionId}
                        value={answerContent}
                        className="size-5 border-2"
                      />
                      <span className="mr-2 rounded bg-primary/10 px-3 py-1 font-mono text-base font-bold text-primary">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="flex-1 text-base">{answerContent}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            ) : (
              <div className="space-y-4">
                {question.answers.map((answer, index) => {
                  const answerContent = answer.content;
                  const isSelected = selectedAnswers.includes(answerContent);
                  const optionId = `question-${currentQuestion}-option-${index}`;

                  return (
                    <label
                      key={optionId}
                      htmlFor={optionId}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200",
                        isSelected
                          ? "scale-[1.02] border-primary bg-primary/10 shadow-md"
                          : "border-gray-200 hover:border-primary/50 hover:bg-gray-50",
                      )}
                    >
                      <Checkbox
                        id={optionId}
                        checked={isSelected}
                        onCheckedChange={() =>
                          handleAnswerToggle(answerContent)
                        }
                        className="size-5"
                        aria-label={`Select answer ${String.fromCharCode(
                          65 + index,
                        )}`}
                      />
                      <span className="mr-2 rounded bg-primary/10 px-3 py-1 font-mono text-base font-bold text-primary">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="flex-1 text-base">{answerContent}</span>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedAnswers.length > 0 &&
          (() => {
            const score = questionScores.find(
              (s) => s.questionIndex === currentQuestion,
            );
            return (
              <Card
                className={`border-2 shadow-lg ${score?.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
              >
                <CardContent className="p-6">
                  {score?.isCorrect ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <h3 className="text-lg font-bold text-green-600">
                          Correct!
                        </h3>
                      </div>
                      {question.explanation && (
                        <div className="rounded-lg bg-white p-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Explanation:
                          </p>
                          <p className="text-base text-gray-600">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                        ✕
                      </div>
                      <h3 className="text-lg font-bold text-red-600">
                        Incorrect
                      </h3>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}

        <Card className="border-2 shadow-lg">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                size="lg"
                className="px-8"
              >
                Previous
              </Button>

              <div className="flex flex-wrap justify-center gap-2">
                {Array.from({ length: totalQuestions }).map((_, index) => {
                  const hasAnswer = answers.some(
                    (answer) =>
                      answer.questionIndex === index &&
                      answer.selectedAnswers.length > 0,
                  );

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentQuestion(index)}
                      className={cn(
                        "h-10 w-10 rounded-lg text-sm font-bold transition-all",
                        index === currentQuestion
                          ? "scale-110 bg-primary text-white shadow-lg"
                          : hasAnswer
                            ? "border-2 border-green-600 bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300",
                      )}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {currentQuestion < totalQuestions - 1 && (
                  <Button onClick={handleNext} size="lg" className="px-8">
                    Next
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={isSubmitting}
                      size="lg"
                      className="bg-green-600 px-8 hover:bg-green-700"
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Submit quiz now?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {unansweredCount > 0
                          ? `You still have ${unansweredCount} unanswered question${unansweredCount > 1 ? "s" : ""}. If you submit now, those questions will be counted as incorrect.`
                          : "All questions are answered. Your result will be calculated immediately after submission."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSubmit}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Confirm Submit
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-center text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center justify-center gap-3">
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded bg-green-500"></span>
                  Answered
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded bg-gray-200"></span>
                  Unanswered
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded bg-primary"></span>
                  Current
                </span>
              </div>
              <p>
                {answeredCount} answered, {unansweredCount} remaining
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
