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
import type {
  UpdateQuestionDto,
  QuizletLevel,
} from "@/interface/quizlet/quizlet.interface";

export default function EditQuizletPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = parseInt(params.id as string);

  // Always fetch from API
  const { data: quizlet, isLoading } = useGetQuizletById(id);

  const { mutate: updateQuizlet, isPending } = useUpdateQuizlet();

  const [title, setTitle] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [level, setLevel] = useState<QuizletLevel>(0);
  const [questions, setQuestions] = useState<UpdateQuestionDto[]>([]);

  // Initialize state when quizlet data is loaded
  useEffect(() => {
    if (quizlet) {
      const initialTitle = quizlet.title;
      const initialIsPublished = quizlet.isPublished;
      const initialIsHidden = quizlet.isHidden;
      const initialLevel = quizlet.level;
      const initialQuestions = quizlet.listQuestion.map((q) => ({
        content: q.content,
        score: q.score,
        answers: q.answers || [],
        correctAnswers: q.correctAnswers || [],
        questionType: q.questionType === "SingleChoice" ? 0 : 1,
        isHidden: q.isHidden,
        level: q.level,
      }));

      setTitle(initialTitle);
      setIsPublished(initialIsPublished);
      setIsHidden(initialIsHidden);
      setLevel(initialLevel);
      setQuestions(initialQuestions);
    }
  }, [quizlet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề",
        variant: "destructive",
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "Lỗi",
        description: "Phải có ít nhất một câu hỏi",
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.content.trim()) {
        toast({
          title: "Lỗi",
          description: `Câu hỏi ${i + 1}: Nội dung không được để trống`,
          variant: "destructive",
        });
        return;
      }
      if (q.answers.length < 2) {
        toast({
          title: "Lỗi",
          description: `Câu hỏi ${i + 1}: Phải có ít nhất 2 đáp án`,
          variant: "destructive",
        });
        return;
      }
      if (q.correctAnswers.length === 0) {
        toast({
          title: "Lỗi",
          description: `Câu hỏi ${i + 1}: Phải chọn ít nhất một đáp án đúng`,
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
            title: "Thành công",
            description: message,
          });
          router.push(`/admin/quizlets`);
        },
        onError: (error: Error) => {
          toast({
            title: "Lỗi",
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
        <div className="text-center py-12">Đang tải...</div>
      </div>
    );
  }

  if (!quizlet) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-destructive">Không tìm thấy quizlet</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Quay lại
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
          <h1 className="text-3xl font-bold tracking-tight">
            Chỉnh sửa Quizlet
          </h1>
          <p className="text-muted-foreground">Cập nhật thông tin quizlet</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Tiêu đề <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">
                Độ khó <span className="text-red-500">*</span>
              </Label>
              <Select
                value={level.toString()}
                onValueChange={(value) =>
                  setLevel(parseInt(value) as QuizletLevel)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Dễ</SelectItem>
                  <SelectItem value="2">Trung bình</SelectItem>
                  <SelectItem value="3">Khó</SelectItem>
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
                Xuất bản
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isHidden"
                checked={isHidden}
                onCheckedChange={setIsHidden}
              />
              <Label htmlFor="isHidden" className="cursor-pointer">
                Ẩn level (độ khó) của quizlet
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
            Hủy
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
