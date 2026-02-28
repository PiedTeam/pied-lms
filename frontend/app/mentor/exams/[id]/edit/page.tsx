"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useGetExamById, useUpdateExam } from "@/service";
<<<<<<< HEAD
import { EXAM_MESSAGES } from "@/constants/messages.constants";
=======
import { EXAM_MESSAGES } from "@/constants/messages";
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { UpdateExamRequest } from "@/interface/exam/exam.interface";

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const examId = params.id as string;

  const { data: exam, isLoading } = useGetExamById(examId);
  const { mutate: updateExam, isPending: isUpdating } = useUpdateExam();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateExamRequest>();

  useEffect(() => {
    if (exam) {
      reset({
        title: exam.title,
        description: exam.description,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
      });
    }
  }, [exam, reset]);

  const onSubmit = (data: UpdateExamRequest) => {
    updateExam(
      { examId, payload: data },
      {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: EXAM_MESSAGES.SUCCESS.UPDATED,
          });
          router.push(`/mentor/exams`);
        },
        onError: (error: Error) => {
          toast({
            title: "Lỗi",
            description: error.message || EXAM_MESSAGES.ERROR.UPDATE_FAILED,
            variant: "destructive",
          });
        },
      },
    );
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/mentor/exams`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Chỉnh sửa đề thi
          </h1>
          <p className="text-muted-foreground">Cập nhật thông tin đề thi</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin đề thi</CardTitle>
          <CardDescription>Nhập thông tin chi tiết về đề thi</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                Tên đề thi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                {...register("title", {
                  required: "Tên đề thi là bắt buộc",
                })}
                placeholder="Nhập tên đề thi"
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Nhập mô tả đề thi"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="totalMarks">
                  Điểm tối đa <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="totalMarks"
                  type="number"
                  {...register("totalMarks", {
                    required: "Điểm tối đa là bắt buộc",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Điểm tối đa phải lớn hơn 0",
                    },
                  })}
                  placeholder="100"
                />
                {errors.totalMarks && (
                  <p className="text-sm text-destructive">
                    {errors.totalMarks.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="passingMarks">
                  Điểm đạt <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="passingMarks"
                  type="number"
                  {...register("passingMarks", {
                    required: "Điểm đạt là bắt buộc",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Điểm đạt phải lớn hơn 0",
                    },
                  })}
                  placeholder="60"
                />
                {errors.passingMarks && (
                  <p className="text-sm text-destructive">
                    {errors.passingMarks.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/mentor/exams`)}
                disabled={isUpdating}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isUpdating}>
                <Save className="mr-2 h-4 w-4" />
                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
