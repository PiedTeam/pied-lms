"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
import { useGetQuizletById, useUpdateQuizlet } from "@/service";
import { QuizletEditForm } from "@/components/shared/QuizletEditForm";
import {
  QuizletLevel,
  type UpdateQuestionDto,
} from "@/interface/quizlet/quizlet.interface";
import {
  getQuizletLevelLabel,
  normalizeQuizletLevel,
} from "@/utils/quizlet-level.utils";

export default function EditQuizletPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = parseInt(params.id as string);

  // Always fetch from API
  const { data: quizlet, isLoading } = useGetQuizletById(id);

  const { mutate: updateQuizlet, isPending } = useUpdateQuizlet();

  const [formData, setFormData] = useState({
    title: "",
    isPublished: false,
    isHidden: false,
    level: QuizletLevel.Medium as QuizletLevel, // Start with a valid default instead of null
    questions: [] as UpdateQuestionDto[],
  });

  useEffect(() => {
    if (quizlet) {
      console.log("Original quizlet level:", quizlet.level);

      const initialQuestions = quizlet.listQuestion.map((q) => ({
        content: q.content,
        score: q.score,
        answers: q.answers || [],
        correctAnswers: q.correctAnswers || [],
        questionType:
          q.questionType === "MultipleChoice" || q.type === 1 ? 1 : 0,
        isHidden: q.isHidden,
        level: normalizeQuizletLevel(q.level) ?? QuizletLevel.Easy,
      }));

      const levelToSet =
        normalizeQuizletLevel(quizlet.level) ??
        (initialQuestions.length > 0
          ? initialQuestions[0].level
          : QuizletLevel.Easy);

      console.log("Normalized level:", levelToSet);

      setFormData({
        title: quizlet.title,
        isPublished: quizlet.isPublished,
        isHidden: quizlet.isHidden,
        level: levelToSet,
        questions: initialQuestions,
      });
    }
  }, [quizlet]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    if (!level || !Object.values(QuizletLevel).includes(level)) {
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

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.content.trim()) {
        toast({
          title: "Error",
          description: `Question ${i + 1}: Content cannot be empty`,
          variant: "destructive",
        });
        return;
      }
      if (q.answers.length < 2) {
        toast({
          title: "Error",
          description: `Question ${i + 1}: At least 2 answers are required`,
          variant: "destructive",
        });
        return;
      }
      if (q.correctAnswers.length === 0) {
        toast({
          title: "Error",
          description: `Question ${i + 1}: At least one correct answer must be selected`,
          variant: "destructive",
        });
        return;
      }
    }

    updateQuizlet(
      {
        id,
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
          router.push(`/teacher/quizlets`);
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  if (!quizlet) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-destructive">Quizlet not found</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>
    );
  }

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
                onChange={(e) => setTitle(e.target.value)}
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
