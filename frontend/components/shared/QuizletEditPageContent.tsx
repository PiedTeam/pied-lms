"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUpdateQuizlet } from "@/service";
import { QuizletEditForm } from "@/components/shared/QuizletEditForm";
import type {
  QuizletResponse,
  UpdateQuestionDto,
} from "@/interface/quizlet/quizlet.interface";
import { QuizletLevel } from "@/interface/quizlet/quizlet.interface";
import {
  getQuizletLevelLabel,
  normalizeQuizletLevel,
} from "@/utils/quizlet-level.utils";

interface QuizletEditPageContentProps {
  quizlet: QuizletResponse;
  quizletId: number;
  returnPath: string;
}

interface QuizletEditFormState {
  title: string;
  isPublished: boolean;
  isHidden: boolean;
  level: QuizletLevel;
  questions: UpdateQuestionDto[];
}

function buildInitialFormState(
  quizlet: QuizletResponse,
): QuizletEditFormState {
  const questions = quizlet.listQuestion.map((question) => ({
    content: question.content,
    score: question.score,
    answers: question.answers.map((answer) => answer.content),
    correctAnswers: question.correctAnswers || [],
    explanation: question.explanation ?? "",
    questionType:
      question.questionType === "MultipleChoice" || question.type === 1 ? 1 : 0,
    isHidden: question.isHidden,
    level: normalizeQuizletLevel(question.level) ?? QuizletLevel.Easy,
  }));

  return {
    title: quizlet.title,
    isPublished: quizlet.isPublished,
    isHidden: quizlet.isHidden,
    level:
      normalizeQuizletLevel(quizlet.level) ??
      (questions.length > 0 ? questions[0].level : QuizletLevel.Easy),
    questions,
  };
}

export function QuizletEditPageContent({
  quizlet,
  quizletId,
  returnPath,
}: QuizletEditPageContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: updateQuizlet, isPending } = useUpdateQuizlet();
  const [formData, setFormData] = useState<QuizletEditFormState>(() =>
    buildInitialFormState(quizlet),
  );

  const { title, isPublished, isHidden, level, questions } = formData;

  const setTitle = (value: string) =>
    setFormData((prev) => ({ ...prev, title: value }));
  const setIsPublished = (value: boolean) =>
    setFormData((prev) => ({ ...prev, isPublished: value }));
  const setIsHidden = (value: boolean) =>
    setFormData((prev) => ({ ...prev, isHidden: value }));
  const setLevel = (value: QuizletLevel) =>
    setFormData((prev) => ({ ...prev, level: value }));
  const setQuestions = (value: UpdateQuestionDto[]) =>
    setFormData((prev) => ({ ...prev, questions: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    if (!Object.values(QuizletLevel).includes(level)) {
      toast({
        title: "Error",
        description: "Please select a difficulty level",
        variant: "destructive",
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "Error",
        description: "At least one question is required",
        variant: "destructive",
      });
      return;
    }

    for (let index = 0; index < questions.length; index += 1) {
      const question = questions[index];

      if (!question.content.trim()) {
        toast({
          title: "Error",
          description: `Question ${index + 1}: Content cannot be empty`,
          variant: "destructive",
        });
        return;
      }

      if (question.answers.length < 2) {
        toast({
          title: "Error",
          description: `Question ${index + 1}: At least 2 answers are required`,
          variant: "destructive",
        });
        return;
      }

      if (question.correctAnswers.length === 0) {
        toast({
          title: "Error",
          description: `Question ${index + 1}: At least one correct answer must be selected`,
          variant: "destructive",
        });
        return;
      }
    }

    updateQuizlet(
      {
        id: quizletId,
        payload: {
          title,
          isPublished,
          isHidden,
          level,
          listQuestion: questions,
        },
      },
      {
        onSuccess: (message) => {
          toast({
            title: "Success",
            description: message,
          });
          router.push(returnPath);
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Quizlet</h1>
          <p className="text-muted-foreground">Update quizlet information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">
                Difficulty <span className="text-red-500">*</span>
              </Label>
              <Select
                value={level.toString()}
                onValueChange={(value) => {
                  const parsedLevel = parseInt(value, 10) as QuizletLevel;
                  if (Object.values(QuizletLevel).includes(parsedLevel)) {
                    setLevel(parsedLevel);
                  }
                }}
              >
                <SelectTrigger id="level" className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Easy</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Hard</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current selection: {getQuizletLevelLabel(level)} | Raw level:{" "}
                {JSON.stringify(level)} | Type: {typeof level}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublished"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <Label htmlFor="isPublished" className="cursor-pointer">
                Published
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isHidden"
                checked={isHidden}
                onCheckedChange={setIsHidden}
              />
              <Label htmlFor="isHidden" className="cursor-pointer">
                Hide difficulty level
              </Label>
            </div>
          </CardContent>
        </Card>

        <QuizletEditForm
          questions={questions}
          onQuestionsChange={setQuestions}
        />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
