"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGetQuizletById, useUpdateQuizlet } from "@/service";
import type { UpdateQuestionDto } from "@/interface/quizlet/quizlet.interface";

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
  const [questions, setQuestions] = useState<UpdateQuestionDto[]>([]);

  // Initialize state when quizlet data is loaded
  useEffect(() => {
    if (quizlet) {
      const initialTitle = quizlet.title;
      const initialIsPublished = quizlet.isPublished;
      const initialQuestions = quizlet.listQuestion.map((q) => ({
        content: q.content,
        score: q.score,
        answers: q.answers || [], // Backend returns 'answers'
        correctAnswers: q.correctAnswers || [],
        questionType: q.type === 0 ? "SingleChoice" : "MultipleChoice",
      }));

      setTitle(initialTitle);
      setIsPublished(initialIsPublished);
      setQuestions(initialQuestions);
    }
  }, [quizlet]);

  const handleQuestionChange = (
    index: number,
    field: keyof UpdateQuestionDto,
    value: string | number,
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (
    questionIndex: number,
    answerIndex: number,
    value: string,
  ) => {
    const newQuestions = [...questions];
    const newAnswers = [...newQuestions[questionIndex].answers];
    newAnswers[answerIndex] = value;
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      answers: newAnswers,
    };
    setQuestions(newQuestions);
  };

  const toggleCorrectAnswer = (questionIndex: number, answer: string) => {
    const newQuestions = [...questions];
    const currentCorrect = newQuestions[questionIndex].correctAnswers;
    const isCurrentlyCorrect = currentCorrect.includes(answer);

    if (isCurrentlyCorrect) {
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        correctAnswers: currentCorrect.filter((a) => a !== answer),
      };
    } else {
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        correctAnswers: [...currentCorrect, answer],
      };
    }
    setQuestions(newQuestions);
  };

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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Câu hỏi ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-2">
                    {qIndex + 1}
                  </Badge>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-${qIndex}`}>
                        Nội dung câu hỏi <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id={`question-${qIndex}`}
                        value={question.content}
                        onChange={(e) =>
                          handleQuestionChange(
                            qIndex,
                            "content",
                            e.target.value,
                          )
                        }
                        placeholder="Nhập nội dung câu hỏi"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`score-${qIndex}`}>Điểm số</Label>
                        <Input
                          id={`score-${qIndex}`}
                          type="number"
                          step="0.1"
                          min="0"
                          value={question.score}
                          onChange={(e) =>
                            handleQuestionChange(
                              qIndex,
                              "score",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`type-${qIndex}`}>Loại câu hỏi</Label>
                        <select
                          id={`type-${qIndex}`}
                          value={question.questionType}
                          onChange={(e) =>
                            handleQuestionChange(
                              qIndex,
                              "questionType",
                              e.target.value,
                            )
                          }
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        >
                          <option value="SingleChoice">Một đáp án</option>
                          <option value="MultipleChoice">Nhiều đáp án</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Đáp án <span className="text-red-500">*</span>
                      </Label>
                      <div className="space-y-2">
                        {question.answers.map((answer, aIndex) => (
                          <div key={aIndex} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={question.correctAnswers.includes(answer)}
                              onChange={() =>
                                toggleCorrectAnswer(qIndex, answer)
                              }
                              className="h-4 w-4"
                            />
                            <span className="font-mono text-sm w-6">
                              {String.fromCharCode(65 + aIndex)}.
                            </span>
                            <Input
                              value={answer}
                              onChange={(e) =>
                                handleAnswerChange(
                                  qIndex,
                                  aIndex,
                                  e.target.value,
                                )
                              }
                              placeholder={`Đáp án ${String.fromCharCode(65 + aIndex)}`}
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Chọn checkbox để đánh dấu đáp án đúng
                      </p>
                    </div>
                  </div>
                </div>

                {qIndex < questions.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

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
