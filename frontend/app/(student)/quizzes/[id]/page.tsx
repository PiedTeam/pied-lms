"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Clock, CheckCircle2, Award } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useGetStudentQuizletById } from "@/service";
import { QuizletLevel } from "@/interface/quizlet/quizlet.interface";

interface Answer {
  questionIndex: number;
  selectedAnswers: string[];
}

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = parseInt(params.id as string);

  const { data: quizlet, isLoading } = useGetStudentQuizletById(id);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer
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
            <Award className="h-3 w-3 mr-1" />
            Easy
          </Badge>
        );
      case QuizletLevel.Medium:
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700">
            <Award className="h-3 w-3 mr-1" />
            Medium
          </Badge>
        );
      case QuizletLevel.Hard:
        return (
          <Badge className="bg-red-600 hover:bg-red-700">
            <Award className="h-3 w-3 mr-1" />
            Hard
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizlet) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
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

  const currentAnswer = answers.find(
    (a) => a.questionIndex === currentQuestion,
  );
  const selectedAnswers = currentAnswer?.selectedAnswers || [];

  const handleAnswerToggle = (answer: string) => {
    const isSingleChoice = question.questionType === "SingleChoice";

    let newSelectedAnswers: string[];
    if (isSingleChoice) {
      newSelectedAnswers = [answer];
    } else {
      if (selectedAnswers.includes(answer)) {
        newSelectedAnswers = selectedAnswers.filter((a) => a !== answer);
      } else {
        newSelectedAnswers = [...selectedAnswers, answer];
      }
    }

    const newAnswers = answers.filter(
      (a) => a.questionIndex !== currentQuestion,
    );
    newAnswers.push({
      questionIndex: currentQuestion,
      selectedAnswers: newSelectedAnswers,
    });
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (selectedAnswers.length === 0) {
      toast({
        title: "Please select an answer",
        description: "You must choose at least one answer before continuing",
        variant: "destructive",
      });
      return;
    }

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
    if (answers.length < totalQuestions) {
      toast({
        title: "Incomplete",
        description: "Please answer all questions before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Calculate score
    let correctCount = 0;
    let totalScore = 0;
    let earnedScore = 0;

    quizlet.listQuestion.forEach((q, index) => {
      totalScore += q.score;
      const userAnswer = answers.find((a) => a.questionIndex === index);

      if (userAnswer) {
        const correctAnswers = q.correctAnswers.sort();
        const userAnswers = userAnswer.selectedAnswers.sort();

        if (JSON.stringify(correctAnswers) === JSON.stringify(userAnswers)) {
          correctCount++;
          earnedScore += q.score;
        }
      }
    });

    // Navigate to result page with data
    const resultData = {
      quizletId: id,
      quizletTitle: quizlet.title,
      totalQuestions,
      correctCount,
      totalScore,
      earnedScore,
      timeElapsed,
      answers,
      questions: quizlet.listQuestion,
    };

    sessionStorage.setItem(`quiz-result-${id}`, JSON.stringify(resultData));
    router.push(`/quizzes/${id}/result`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <Card className="border-2 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
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
                <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-mono text-lg font-semibold text-primary">
                    {formatTime(timeElapsed)}
                  </span>
                </div>
              </div>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-50 border-b-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="outline" className="text-base px-3 py-1">
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
                    className="text-sm bg-blue-100 text-blue-700"
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
              <Badge
                variant="secondary"
                className="text-lg px-4 py-2 bg-blue-100 text-blue-700"
              >
                {question.score} points
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {question.answers.map((answer, index) => {
              const isSelected = selectedAnswers.includes(answer);
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerToggle(answer)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${isSelected
                      ? "border-primary bg-primary/10 shadow-md scale-[1.02]"
                      : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                          ? "border-primary bg-primary"
                          : "border-gray-300"
                        }`}
                    >
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <span className="font-mono text-base font-bold text-primary mr-2 bg-primary/10 px-3 py-1 rounded">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="flex-1 text-base">{answer}</span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="border-2 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                size="lg"
                className="px-8"
              >
                Previous
              </Button>

              <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: totalQuestions }).map((_, index) => {
                  const hasAnswer = answers.some(
                    (a) => a.questionIndex === index,
                  );
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${index === currentQuestion
                          ? "bg-primary text-white shadow-lg scale-110"
                          : hasAnswer
                            ? "bg-green-500 text-white border-2 border-green-600"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {currentQuestion === totalQuestions - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="lg"
                  className="px-8 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              ) : (
                <Button onClick={handleNext} size="lg" className="px-8">
                  Next
                </Button>
              )}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 bg-green-500 rounded"></span>
                Answered
              </span>
              <span className="mx-3">•</span>
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 bg-gray-200 rounded"></span>
                Unanswered
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
