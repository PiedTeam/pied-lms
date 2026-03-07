"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetExamById } from "@/services";

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const { data: exam, isLoading } = useGetExamById(examId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Đang tải...</div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Không tìm thấy đề thi</div>
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
          <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
        </div>
        <Button onClick={() => router.push(`/teacher/exams/${examId}/edit`)}>
          Chỉnh sửa
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Điểm tối đa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exam.totalMarks}</div>
            <p className="text-sm text-muted-foreground">điểm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Điểm đạt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exam.passingMarks}</div>
            <p className="text-sm text-muted-foreground">điểm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Ngày tạo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{formatDate(exam.createdAt)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chi tiết</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Tên đề thi
            </p>
            <p className="text-base">{exam.title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Mô tả</p>
            <p className="text-base whitespace-pre-line">
              {exam.description || "Không có mô tả"}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Điểm tối đa
              </p>
              <p className="text-base">{exam.totalMarks} điểm</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Điểm đạt
              </p>
              <p className="text-base">{exam.passingMarks} điểm</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
