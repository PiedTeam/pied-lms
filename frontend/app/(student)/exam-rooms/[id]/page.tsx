"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, FileText, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  useGetExamRoomById,
  useCheckExamRoomAccess,
  useStartExam,
} from "@/service";
import { useState } from "react";

export default function StudentExamRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roomId = params.id as string;

  const { data: room, isLoading: isLoadingRoom } = useGetExamRoomById(roomId);
  const { data: accessData, isLoading: isLoadingAccess } =
    useCheckExamRoomAccess(roomId);
  const { mutate: startExam, isPending: isStarting } = useStartExam();

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500">
            Đang diễn ra
          </Badge>
        );
      case "upcoming":
        return <Badge variant="secondary">Sắp diễn ra</Badge>;
      case "closed":
        return <Badge variant="outline">Đã kết thúc</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStartExam = (examId: string) => {
    startExam(
      { examRoomId: roomId, examId },
      {
        onSuccess: (data) => {
          toast({
            title: "Thành công",
            description: "Bắt đầu làm bài thi",
          });
          // Navigate to exam taking page
          router.push(`/exam-rooms/${roomId}/exams/${examId}/take`);
        },
        onError: (error: Error) => {
          toast({
            title: "Lỗi",
            description: error.message || "Không thể bắt đầu làm bài",
            variant: "destructive",
          });
        },
      },
    );
  };

  if (isLoadingRoom || isLoadingAccess) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Đang tải...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Không tìm thấy phòng thi</div>
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
          <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
          <p className="text-muted-foreground">{room.description}</p>
        </div>
        {getStatusBadge(room.status)}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin phòng thi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Thời gian bắt đầu</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(room.startTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Thời gian kết thúc</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(room.endTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Thời lượng</p>
                <p className="text-sm text-muted-foreground">
                  {room.durationInMinutes} phút
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Đề thi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{room.exams?.length || 0}</div>
            <p className="text-sm text-muted-foreground">
              Tổng số đề thi trong phòng
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Danh sách đề thi
          </CardTitle>
          <CardDescription>{room.exams?.length || 0} đề thi</CardDescription>
        </CardHeader>
        <CardContent>
          {!room.exams?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có đề thi nào trong phòng
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên đề thi</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Điểm tối đa</TableHead>
                  <TableHead>Điểm đạt</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {room.exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {exam.description}
                    </TableCell>
                    <TableCell>{exam.totalMarks}</TableCell>
                    <TableCell>{exam.passingMarks}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleStartExam(exam.id)}
                        disabled={!accessData?.hasAccess || isStarting}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {isStarting ? "Đang bắt đầu..." : "Bắt đầu"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
