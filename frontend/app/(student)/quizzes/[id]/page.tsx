"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
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

interface Answer {
  questionIndex: number;
  selectedAnswers: string[];
}

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = parseInt(params.id as string);

  const { data: quizlet } = useGetStudentQuizletById(id);

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

  if (!quizlet) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-destructive">Quiz not found</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const question = quizlet.questions[currentQuestion];
  const totalQuestions = quizlet.questions.length;
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
        description: "You must select at least one answer before proceeding",
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
        title: "Incomplete quiz",
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

    quizlet.questions.forEach((q, index) => {
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
      questions: quizlet.questions,
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{quizlet.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {totalQuestions}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-5 w-5" />
          <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{question.content}</CardTitle>
              <CardDescription className="mt-2">
                {question.questionType === "SingleChoice"
                  ? "Select one answer"
                  : "Select all correct answers"}
              </CardDescription>
            </div>
            <Badge variant="outline">{question.score} points</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.answers.map((answer, index) => {
            const isSelected = selectedAnswers.includes(answer);
            return (
              <button
                key={index}
                onClick={() => handleAnswerToggle(answer)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-primary bg-primary" : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                    )}
                  </div>
                  <span className="font-mono text-sm font-medium mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="flex-1">{answer}</span>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {Array.from({ length: totalQuestions }).map((_, index) => {
            const hasAnswer = answers.some((a) => a.questionIndex === index);
            return (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? "bg-primary text-primary-foreground"
                    : hasAnswer
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {currentQuestion === totalQuestions - 1 ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </div>
    </div>
  );
}
