"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft, FileSpreadsheet, Calendar, User } from "lucide-react";
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
import type { QuizletResponse } from "@/interface/quizlet/quizlet.interface";

export default function ViewQuizletPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = parseInt(params.id as string);

  // Try to get data from query params first
  const dataFromParams = useMemo(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      try {
        return JSON.parse(decodeURIComponent(dataParam)) as QuizletResponse;
      } catch {
        return null;
      }
    }
    return null;
  }, [searchParams]);

  // Only fetch if no data from params
  const {
    data: fetchedData,
    isLoading,
    error,
  } = useGetQuizletById(id, {
    enabled: !dataFromParams,
  });

  const quizlet = dataFromParams || fetchedData;

  if (isLoading && !dataFromParams) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Đang tải...</div>
      </div>
    );
  }

  if ((error || !quizlet) && !dataFromParams) {
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
        <Button
          onClick={() =>
            router.push(
              `/admin/quizlets/${id}/edit?data=${encodeURIComponent(JSON.stringify(quizlet))}`,
            )
          }
        >
          Chỉnh sửa
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Người tạo</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizlet.userName}</div>
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
          <CardTitle>Câu hỏi ({quizlet.questions.length})</CardTitle>
          <CardDescription>Danh sách các câu hỏi trong quizlet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {quizlet.questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
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
                {question.options.map((option, optIndex) => {
                  const isCorrect = question.correctAnswers.includes(option);
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
                        {option}
                      </span>
                      {isCorrect && (
                        <Badge variant="default" className="ml-auto">
                          Đáp án đúng
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              {index < quizlet.questions.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
