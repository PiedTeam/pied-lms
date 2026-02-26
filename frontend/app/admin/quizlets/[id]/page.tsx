"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileSpreadsheet, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetQuizletById } from "@/service";
import { QuizletViewDetail } from "@/components/shared/QuizletViewDetail";

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
        <Button onClick={() => router.push(`/admin/quizlets/${id}/edit`)}>
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
            <CardTitle className="text-sm font-medium">Độ khó</CardTitle>
          </CardHeader>
          <CardContent>
            {quizlet.level === 1 && <Badge className="bg-green-600">Dễ</Badge>}
            {quizlet.level === 2 && (
              <Badge className="bg-yellow-600">Trung bình</Badge>
            )}
            {quizlet.level === 3 && <Badge className="bg-red-600">Khó</Badge>}
            {quizlet.isHidden && (
              <Badge variant="outline" className="ml-2">
                Level ẩn
              </Badge>
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
            <p className="text-xs text-muted-foreground mt-1">
              Bởi: {quizlet.userName || "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <QuizletViewDetail quizlet={quizlet} />
    </div>
  );
}
