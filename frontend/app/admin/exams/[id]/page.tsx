"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetExamById } from "@/service";

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const { data: exam, isLoading } = useGetExamById(examId);

  const formatDate = (dateString: string) => {
<<<<<<< HEAD
    return new Date(dateString).toLocaleDateString("vi-VN", {
=======
    return new Date(dateString).toLocaleDateString("en-US", {
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
        <div className="text-center py-8">Đang tải...</div>
=======
        <div className="text-center py-8">Loading...</div>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto p-6">
<<<<<<< HEAD
        <div className="text-center py-8">Không tìm thấy đề thi</div>
=======
        <div className="text-center py-8">Exam not found</div>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
          <p className="text-muted-foreground">{exam.description}</p>
        </div>
        <Button onClick={() => router.push(`/admin/exams/${examId}/edit`)}>
<<<<<<< HEAD
          Chỉnh sửa
=======
          Edit
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
<<<<<<< HEAD
              Điểm tối đa
=======
              Max Score
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exam.totalMarks}</div>
<<<<<<< HEAD
            <p className="text-sm text-muted-foreground">điểm</p>
=======
            <p className="text-sm text-muted-foreground">points</p>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
<<<<<<< HEAD
              Điểm đạt
=======
              Passing Score
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exam.passingMarks}</div>
<<<<<<< HEAD
            <p className="text-sm text-muted-foreground">điểm</p>
=======
            <p className="text-sm text-muted-foreground">points</p>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
<<<<<<< HEAD
              Ngày tạo
=======
              Created At
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{formatDate(exam.createdAt)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
<<<<<<< HEAD
          <CardTitle>Thông tin chi tiết</CardTitle>
=======
          <CardTitle>Exam Details</CardTitle>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
<<<<<<< HEAD
              Tên đề thi
=======
              Exam Title
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </p>
            <p className="text-base">{exam.title}</p>
          </div>
          <div>
<<<<<<< HEAD
            <p className="text-sm font-medium text-muted-foreground">Mô tả</p>
            <p className="text-base">{exam.description || "Không có mô tả"}</p>
=======
            <p className="text-sm font-medium text-muted-foreground">              Description
            </p>
            <p className="text-base">{exam.description || "No description"}</p>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
<<<<<<< HEAD
                Điểm tối đa
              </p>
              <p className="text-base">{exam.totalMarks} điểm</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Điểm đạt
              </p>
              <p className="text-base">{exam.passingMarks} điểm</p>
=======
                Max Score
              </p>
              <p className="text-base">{exam.totalMarks} points</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Passing Score
              </p>
              <p className="text-base">{exam.passingMarks} points</p>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
