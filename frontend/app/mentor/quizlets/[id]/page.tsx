"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileSpreadsheet, Calendar } from "lucide-react";
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
import { useGetQuizletById } from "@/service";

export default function ViewQuizletPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  // Always fetch from API
  const { data: quizlet, isLoading, error } = useGetQuizletById(id);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Đang tải...</div>
      </div>
    );
  }

  if (error || !quizlet) {
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{quizlet.title}</h1>
          <p className="text-muted-foreground">{quizlet.description}</p>
        </div>
        <Button onClick={() => router.push(`/mentor/quizlets/${id}/edit`)}>
          Chỉnh sửa
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {quizlet.isPublished ? (
              <Badge variant="default">Đã xuất bản</Badge>
            ) : (
              <Badge variant="secondary">Nháp</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ngày tạo</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(quizlet.createdAt).toLocaleDateString("vi-VN")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Câu hỏi ({quizlet.listQuestion.length})</CardTitle>
          <CardDescription>Danh sách các câu hỏi trong quizlet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {quizlet.listQuestion && quizlet.listQuestion.length > 0 ? (
            quizlet.listQuestion.map((question, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    {index + 1}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">{question.content}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Điểm: {question.score} | Loại:{" "}
                      {question.type === 0 ? "Một đáp án" : "Nhiều đáp án"}
                    </p>
                  </div>
                </div>

                <div className="ml-10 space-y-2">
                  <p className="text-xs text-blue-500">
                    Debug: Answers length = {question.answers?.length || 0}
                  </p>
                  {question.answers && question.answers.length > 0 ? (
                    question.answers.map((answer, optIndex) => {
                      const isCorrect =
                        question.correctAnswers?.includes(answer);
                      return (
                        <div
                          key={optIndex}
                          className={`flex items-center gap-2 p-2 rounded ${
                            isCorrect
                              ? "bg-green-50 border border-green-200"
                              : "bg-muted"
                          }`}
                        >
                          <span className="font-mono text-sm">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span
                            className={
                              isCorrect ? "font-medium text-green-700" : ""
                            }
                          >
                            {answer}
                          </span>
                          {isCorrect && (
                            <Badge variant="default" className="ml-auto">
                              Đáp án đúng
                            </Badge>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Không có đáp án
                    </p>
                  )}
                </div>

                {index < quizlet.listQuestion.length - 1 && <Separator />}
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              Không có câu hỏi nào
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
