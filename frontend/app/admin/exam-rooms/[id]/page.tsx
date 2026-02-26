"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  useGetExamRoomById,
  useGetExamsByMentor,
  useAssignExamToRoom,
  useRemoveExamFromRoom,
  useGetExamRoomEnrollments,
} from "@/services";
import { EXAM_ROOM_MESSAGES } from "@/constants/messages.constants";
import { EnrollStudentsDialog } from "@/components/admin/EnrollStudentsDialog";

export default function ExamRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roomId = params.id as string;

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examSearchQuery, setExamSearchQuery] = useState("");
  const [examListSearchQuery, setExamListSearchQuery] = useState("");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  const { data: room, isLoading } = useGetExamRoomById(roomId);
  const { data: examsData } = useGetExamsByMentor({
    pageNumber: 1,
    pageSize: 100,
  });
  const { data: enrollmentsData, isLoading: isLoadingEnrollments } =
    useGetExamRoomEnrollments({
      examRoomId: roomId,
      pageNumber: 1,
      pageSize: 100,
    });
  const { mutate: assignExam, isPending: isAssigning } = useAssignExamToRoom();
  const { mutate: removeExam, isPending: isRemoving } = useRemoveExamFromRoom();

  const filteredExams =
    examsData?.items.filter((exam) =>
      exam.title.toLowerCase().includes(examSearchQuery.toLowerCase()),
    ) || [];

  const enrolledStudents = enrollmentsData?.items || [];

  // Filter assigned exams in the room
  const assignedExams = room?.exams || [];
  const filteredAssignedExams = examListSearchQuery
    ? assignedExams.filter(
        (exam) =>
          exam.title
            .toLowerCase()
            .includes(examListSearchQuery.toLowerCase()) ||
          exam.description
            ?.toLowerCase()
            .includes(examListSearchQuery.toLowerCase()),
      )
    : assignedExams;

  const filteredStudents = enrolledStudents.filter(
    (enrollment) =>
      enrollment.studentEmail
        .toLowerCase()
        .includes(studentSearchQuery.toLowerCase()) ||
      `${enrollment.studentFirstName} ${enrollment.studentLastName}`
        .toLowerCase()
        .includes(studentSearchQuery.toLowerCase()),
  );

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
        return <Badge variant="default">Đang diễn ra</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Sắp diễn ra</Badge>;
      case "closed":
        return <Badge variant="outline">Đã kết thúc</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAssignExam = () => {
    if (!selectedExamId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn đề thi",
        variant: "destructive",
      });
      return;
    }

    assignExam(
      { roomId, payload: { examId: selectedExamId } },
      {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: EXAM_ROOM_MESSAGES.SUCCESS.EXAM_ASSIGNED,
          });
          setIsAssignDialogOpen(false);
          setSelectedExamId("");
          setExamSearchQuery("");
        },
        onError: (error: Error) => {
          toast({
            title: "Lỗi",
            description:
              error.message || EXAM_ROOM_MESSAGES.ERROR.ASSIGN_EXAM_FAILED,
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleRemoveExam = (examId: string) => {
    removeExam(
      { roomId, examId },
      {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: EXAM_ROOM_MESSAGES.SUCCESS.EXAM_REMOVED,
          });
        },
        onError: (error: Error) => {
          toast({
            title: "Lỗi",
            description:
              error.message || EXAM_ROOM_MESSAGES.ERROR.REMOVE_EXAM_FAILED,
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/exam-rooms")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
          <p className="text-muted-foreground">{room.description}</p>
        </div>
        <Button onClick={() => router.push(`/admin/exam-rooms/${roomId}/edit`)}>
          Chỉnh sửa
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin phòng thi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trạng thái</span>
              {getStatusBadge(room.status)}
            </div>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Học sinh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {room.enrolledStudentsCount || 0}
            </div>
            <p className="text-sm text-muted-foreground">
              Số học sinh đã đăng ký
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exams" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exams">Đề thi</TabsTrigger>
          <TabsTrigger value="students">Học sinh</TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Danh sách đề thi
                  </CardTitle>
                  <CardDescription>
                    {room.exams?.length || 0} đề thi
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Tìm kiếm đề thi..."
                    value={examListSearchQuery}
                    onChange={(e) => setExamListSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Dialog
                    open={isAssignDialogOpen}
                    onOpenChange={setIsAssignDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Gán đề thi
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Gán đề thi vào phòng</DialogTitle>
                      <DialogDescription>
                        Tìm kiếm và chọn đề thi để gán vào phòng thi này
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="search">Tìm kiếm đề thi</Label>
                        <Input
                          id="search"
                          placeholder="Nhập tên đề thi..."
                          value={examSearchQuery}
                          onChange={(e) => setExamSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Danh sách đề thi</Label>
                        <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                          {!examsData?.items.length ? (
                            <div className="text-center py-8 text-muted-foreground">
                              Không có đề thi nào
                            </div>
                          ) : filteredExams.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              Không tìm thấy đề thi phù hợp
                            </div>
                          ) : (
                            <div className="divide-y">
                              {filteredExams.map((exam) => {
                                const isAssigned = room.exams?.some(
                                  (e) => e.id === exam.id,
                                );
                                return (
                                  <div
                                    key={exam.id}
                                    className={`p-4 hover:bg-accent cursor-pointer transition-colors ${
                                      selectedExamId === exam.id
                                        ? "bg-accent"
                                        : ""
                                    } ${isAssigned ? "opacity-50" : ""}`}
                                    onClick={() =>
                                      !isAssigned && setSelectedExamId(exam.id)
                                    }
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-medium">
                                            {exam.title}
                                          </h4>
                                          {isAssigned && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              Đã gán
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {exam.description}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                          <span>
                                            Điểm tối đa: {exam.totalMarks}
                                          </span>
                                          <span>
                                            Điểm đạt: {exam.passingMarks}
                                          </span>
                                        </div>
                                      </div>
                                      {selectedExamId === exam.id &&
                                        !isAssigned && (
                                          <div className="ml-2">
                                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                              <svg
                                                className="h-3 w-3 text-primary-foreground"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path d="M5 13l4 4L19 7"></path>
                                              </svg>
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAssignDialogOpen(false);
                          setSelectedExamId("");
                          setExamSearchQuery("");
                        }}
                        disabled={isAssigning}
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={handleAssignExam}
                        disabled={isAssigning || !selectedExamId}
                      >
                        {isAssigning ? "Đang gán..." : "Gán đề thi"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {!filteredAssignedExams.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  {examListSearchQuery
                    ? "Không tìm thấy đề thi phù hợp"
                    : "Chưa có đề thi nào. Gán đề thi vào phòng!"}
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
                    {filteredAssignedExams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">
                          {exam.title}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {exam.description}
                        </TableCell>
                        <TableCell>{exam.totalMarks}</TableCell>
                        <TableCell>{exam.passingMarks}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveExam(exam.id)}
                            disabled={isRemoving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Danh sách học sinh
                  </CardTitle>
                  <CardDescription>
                    {room.enrolledStudentsCount || 0} học sinh đã đăng ký
                  </CardDescription>
                </div>
                <EnrollStudentsDialog roomId={roomId} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Tìm kiếm học sinh theo tên hoặc email..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                />
              </div>
              {isLoadingEnrollments ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted animate-pulse rounded-md"
                    />
                  ))}
                </div>
              ) : !enrolledStudents.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có học sinh nào đăng ký phòng thi này
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Không tìm thấy học sinh phù hợp
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Ngày đăng ký</TableHead>
                      <TableHead>Trạng thái email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {enrollment.studentFirstName}{" "}
                          {enrollment.studentLastName}
                        </TableCell>
                        <TableCell>{enrollment.studentEmail}</TableCell>
                        <TableCell>
                          {formatDateTime(enrollment.enrolledAt)}
                        </TableCell>
                        <TableCell>
                          {enrollment.emailSent ? (
                            <Badge variant="default">Đã gửi</Badge>
                          ) : (
                            <Badge variant="outline">Chưa gửi</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
