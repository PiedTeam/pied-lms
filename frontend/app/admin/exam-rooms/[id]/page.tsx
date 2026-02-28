"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
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
<<<<<<< HEAD
import { EXAM_ROOM_MESSAGES } from "@/constants/messages.constants";
=======
import { EXAM_ROOM_MESSAGES } from "@/constants/messages";
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
    return new Date(dateString).toLocaleString("vi-VN", {
=======
    return new Date(dateString).toLocaleString("en-US", {
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
        return <Badge variant="default">Đang diễn ra</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Sắp diễn ra</Badge>;
      case "closed":
        return <Badge variant="outline">Đã kết thúc</Badge>;
=======
        return <Badge variant="default">Ongoing</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "closed":
        return <Badge variant="outline">Ended</Badge>;
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAssignExam = () => {
    if (!selectedExamId) {
      toast({
<<<<<<< HEAD
        title: "Lỗi",
        description: "Vui lòng chọn đề thi",
=======
        title: "Error",
        description: "Please select an exam",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        variant: "destructive",
      });
      return;
    }

    assignExam(
      { roomId, payload: { examId: selectedExamId } },
      {
        onSuccess: () => {
          toast({
<<<<<<< HEAD
            title: "Thành công",
=======
            title: "Success",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            description: EXAM_ROOM_MESSAGES.SUCCESS.EXAM_ASSIGNED,
          });
          setIsAssignDialogOpen(false);
          setSelectedExamId("");
          setExamSearchQuery("");
        },
        onError: (error: Error) => {
          toast({
<<<<<<< HEAD
            title: "Lỗi",
=======
            title: "Error",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
            title: "Thành công",
=======
            title: "Success",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            description: EXAM_ROOM_MESSAGES.SUCCESS.EXAM_REMOVED,
          });
        },
        onError: (error: Error) => {
          toast({
<<<<<<< HEAD
            title: "Lỗi",
=======
            title: "Error",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
        <div className="text-center py-8">Đang tải...</div>
=======
        <div className="text-center py-8">Loading...</div>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto p-6">
<<<<<<< HEAD
        <div className="text-center py-8">Không tìm thấy phòng thi</div>
=======
        <div className="text-center py-8">Exam room not found</div>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
            <CardTitle>Thông tin phòng thi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trạng thái</span>
=======
            <CardTitle>Exam Room Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              {getStatusBadge(room.status)}
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
<<<<<<< HEAD
                <p className="text-sm font-medium">Thời gian bắt đầu</p>
=======
                <p className="text-sm font-medium">Start Time</p>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(room.startTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
<<<<<<< HEAD
                <p className="text-sm font-medium">Thời gian kết thúc</p>
=======
                <p className="text-sm font-medium">End Time</p>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(room.endTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
<<<<<<< HEAD
                <p className="text-sm font-medium">Thời lượng</p>
                <p className="text-sm text-muted-foreground">
                  {room.durationInMinutes} phút
=======
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {room.durationInMinutes} minutes
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
<<<<<<< HEAD
              Đề thi
=======
              Exams
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{room.exams?.length || 0}</div>
<<<<<<< HEAD
            <p className="text-sm text-muted-foreground">
              Tổng số đề thi trong phòng
            </p>
=======
            <p className="text-sm text-muted-foreground">Total exams in room</p>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
<<<<<<< HEAD
              Học sinh
=======
              Students
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {room.enrolledStudentsCount || 0}
            </div>
<<<<<<< HEAD
            <p className="text-sm text-muted-foreground">
              Số học sinh đã đăng ký
            </p>
=======
            <p className="text-sm text-muted-foreground">Enrolled students</p>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exams" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
<<<<<<< HEAD
          <TabsTrigger value="exams">Đề thi</TabsTrigger>
          <TabsTrigger value="students">Học sinh</TabsTrigger>
=======
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        </TabsList>

        <TabsContent value="exams" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
<<<<<<< HEAD
                    Danh sách đề thi
                  </CardTitle>
                  <CardDescription>
                    {room.exams?.length || 0} đề thi
=======
                    Exam List
                  </CardTitle>
                  <CardDescription>
                    {room.exams?.length || 0} exams
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
<<<<<<< HEAD
                    placeholder="Tìm kiếm đề thi..."
=======
                    placeholder="Search exams..."
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
                        Gán đề thi
=======
                        Assign Exam
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
<<<<<<< HEAD
                        <DialogTitle>Gán đề thi vào phòng</DialogTitle>
                        <DialogDescription>
                          Tìm kiếm và chọn đề thi để gán vào phòng thi này
=======
                        <DialogTitle>Assign Exam to Room</DialogTitle>
                        <DialogDescription>
                          Search and select an exam to assign to this exam room
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
<<<<<<< HEAD
                          <Label htmlFor="search">Tìm kiếm đề thi</Label>
                          <Input
                            id="search"
                            placeholder="Nhập tên đề thi..."
=======
                          <Label htmlFor="search">Search Exam</Label>
                          <Input
                            id="search"
                            placeholder="Enter exam name..."
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                            value={examSearchQuery}
                            onChange={(e) => setExamSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
<<<<<<< HEAD
                          <Label>Danh sách đề thi</Label>
                          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                            {!examsData?.items.length ? (
                              <div className="text-center py-8 text-muted-foreground">
                                Không có đề thi nào
                              </div>
                            ) : filteredExams.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                Không tìm thấy đề thi phù hợp
=======
                          <Label>Exam List</Label>
                          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                            {!examsData?.items.length ? (
                              <div className="text-center py-8 text-muted-foreground">
                                No exams available
                              </div>
                            ) : filteredExams.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                No matching exams found
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
                                        !isAssigned &&
                                        setSelectedExamId(exam.id)
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
<<<<<<< HEAD
                                                Đã gán
=======
                                                Assigned
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-sm text-muted-foreground mt-1">
                                            {exam.description}
                                          </p>
                                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span>
<<<<<<< HEAD
                                              Điểm tối đa: {exam.totalMarks}
                                            </span>
                                            <span>
                                              Điểm đạt: {exam.passingMarks}
=======
                                              Max Score: {exam.totalMarks}
                                            </span>
                                            <span>
                                              Passing Score: {exam.passingMarks}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
                          Hủy
=======
                          Cancel
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                        </Button>
                        <Button
                          onClick={handleAssignExam}
                          disabled={isAssigning || !selectedExamId}
                        >
<<<<<<< HEAD
                          {isAssigning ? "Đang gán..." : "Gán đề thi"}
=======
                          {isAssigning ? "Assigning..." : "Assign Exam"}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!filteredAssignedExams.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  {examListSearchQuery
<<<<<<< HEAD
                    ? "Không tìm thấy đề thi phù hợp"
                    : "Chưa có đề thi nào. Gán đề thi vào phòng!"}
=======
                    ? "No matching exams found"
                    : "No exams yet. Assign exams to this room!"}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
<<<<<<< HEAD
                      <TableHead>Tên đề thi</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Điểm tối đa</TableHead>
                      <TableHead>Điểm đạt</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
=======
                      <TableHead>Exam Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Max Score</TableHead>
                      <TableHead>Passing Score</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/admin/exams/${exam.id}`)
                              }
<<<<<<< HEAD
                              title="Xem chi tiết"
=======
                              title="View details"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveExam(exam.id)}
                              disabled={isRemoving}
<<<<<<< HEAD
                              title="Xóa khỏi phòng"
=======
                              title="Remove from room"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
<<<<<<< HEAD
                    Danh sách học sinh
                  </CardTitle>
                  <CardDescription>
                    {room.enrolledStudentsCount || 0} học sinh đã đăng ký
=======
                    Student List
                  </CardTitle>
                  <CardDescription>
                    {room.enrolledStudentsCount || 0} students enrolled
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  </CardDescription>
                </div>
                <EnrollStudentsDialog roomId={roomId} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
<<<<<<< HEAD
                  placeholder="Tìm kiếm học sinh theo tên hoặc email..."
=======
                  placeholder="Search students by name or email..."
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
                  Chưa có học sinh nào đăng ký phòng thi này
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Không tìm thấy học sinh phù hợp
=======
                  No students enrolled in this exam room yet
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No matching students found
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
<<<<<<< HEAD
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Ngày đăng ký</TableHead>
                      <TableHead>Trạng thái email</TableHead>
=======
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Enrolled At</TableHead>
                      <TableHead>Email Status</TableHead>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
                            <Badge variant="default">Đã gửi</Badge>
                          ) : (
                            <Badge variant="outline">Chưa gửi</Badge>
=======
                            <Badge variant="default">Sent</Badge>
                          ) : (
                            <Badge variant="outline">Not Sent</Badge>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
