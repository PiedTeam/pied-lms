"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  Eye,
  FileText,
  Hash,
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
import { EXAM_ROOM_MESSAGES } from "@/constants/messages";
import { EnrollStudentsDialog } from "@/components/mentor/EnrollStudentsDialog";

export default function ExamRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roomId = params.id as string;

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);
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
    return new Date(dateString).toLocaleString("en-US", {
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
        return <Badge variant="default">Ongoing</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAssignExam = async () => {
    if (selectedExamIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one exam",
        variant: "destructive",
      });
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const examId of selectedExamIds) {
      try {
        await new Promise<void>((resolve, reject) => {
          assignExam(
            { roomId, payload: { examId } },
            {
              onSuccess: () => {
                successCount++;
                resolve();
              },
              onError: () => {
                failCount++;
                reject();
              },
            },
          );
        });
      } catch {
        // Error already counted in failCount
      }
    }

    if (successCount > 0) {
      toast({
        title: "Success",
        description: `${successCount} exam(s) assigned successfully${failCount > 0 ? `, ${failCount} failed` : ""}`,
      });
    }

    if (failCount > 0 && successCount === 0) {
      toast({
        title: "Error",
        description: "Failed to assign exams",
        variant: "destructive",
      });
    }

    setIsAssignDialogOpen(false);
    setSelectedExamIds([]);
    setExamSearchQuery("");
  };

  const handleRemoveExam = (examId: string) => {
    removeExam(
      { roomId, examId },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: EXAM_ROOM_MESSAGES.SUCCESS.EXAM_REMOVED,
          });
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description:
              error.message || EXAM_ROOM_MESSAGES.ERROR.REMOVE_EXAM_FAILED,
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleCopyRoomCode = async (roomCode: string) => {
    try {
      await navigator.clipboard.writeText(roomCode);
      toast({
        title: "Success",
        description: "Room code copied to clipboard",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy room code",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Exam room not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/mentor/exam-rooms")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
          <p className="text-muted-foreground">{room.description}</p>
        </div>
        <Button
          onClick={() => router.push(`/mentor/exam-rooms/${roomId}/edit`)}
        >
          Edit
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Exam Room Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getStatusBadge(room.status)}
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Start Time</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(room.startTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">End Time</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(room.endTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {room.durationInMinutes} minutes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Hash className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Room Code</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs sm:text-sm text-muted-foreground font-mono bg-muted px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                    {room.roomCode || "N/A"}
                  </code>
                  {room.roomCode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 sm:h-6 sm:w-6"
                      onClick={() => handleCopyRoomCode(room.roomCode!)}
                      title="Copy room code"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{room.exams?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total exams in room</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {room.enrolledStudentsCount || 0}
            </div>
            <p className="text-sm text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exams" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Exam List
                  </CardTitle>
                  <CardDescription>
                    {room.exams?.length || 0} exams
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search exams..."
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
                        Assign Exam
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Assign Exam to Room</DialogTitle>
                        <DialogDescription>
                          Search and select an exam to assign to this room
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="search">Search Exams</Label>
                          <Input
                            id="search"
                            placeholder="Enter exam title..."
                            value={examSearchQuery}
                            onChange={(e) => setExamSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Exam List</Label>
                          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                            {!examsData?.items.length ? (
                              <div className="text-center py-8 text-muted-foreground">
                                No exams available
                              </div>
                            ) : filteredExams.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                No matching exams found
                              </div>
                            ) : (
                              <div className="divide-y">
                                {filteredExams.map((exam) => {
                                  const isAssigned = room.exams?.some(
                                    (e) => e.id === exam.id,
                                  );
                                  const isSelected = selectedExamIds.includes(
                                    exam.id,
                                  );
                                  return (
                                    <div
                                      key={exam.id}
                                      className={`p-4 hover:bg-accent cursor-pointer transition-colors ${
                                        isSelected ? "bg-accent" : ""
                                      } ${isAssigned ? "opacity-50" : ""}`}
                                      onClick={() => {
                                        if (isAssigned) return;
                                        setSelectedExamIds((prev) =>
                                          prev.includes(exam.id)
                                            ? prev.filter(
                                                (id) => id !== exam.id,
                                              )
                                            : [...prev, exam.id],
                                        );
                                      }}
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
                                                Assigned
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-sm text-muted-foreground mt-1">
                                            {exam.description}
                                          </p>
                                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span>
                                              Max Marks: {exam.totalMarks}
                                            </span>
                                            <span>
                                              Passing Marks: {exam.passingMarks}
                                            </span>
                                          </div>
                                        </div>
                                        {!isAssigned && (
                                          <div className="ml-2">
                                            <div
                                              className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                                                isSelected
                                                  ? "bg-primary border-primary"
                                                  : "border-muted-foreground"
                                              }`}
                                            >
                                              {isSelected && (
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
                                              )}
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
                            setSelectedExamIds([]);
                            setExamSearchQuery("");
                          }}
                          disabled={isAssigning}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAssignExam}
                          disabled={isAssigning || selectedExamIds.length === 0}
                        >
                          {isAssigning
                            ? "Assigning..."
                            : `Assign ${selectedExamIds.length > 0 ? `(${selectedExamIds.length})` : "Exam"}`}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!filteredAssignedExams?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  {examListSearchQuery
                    ? "No matching exams found"
                    : "No exams yet. Assign an exam to the room!"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Max Marks</TableHead>
                      <TableHead>Passing Marks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                                router.push(`/mentor/exams/${exam.id}`)
                              }
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveExam(exam.id)}
                              disabled={isRemoving}
                              title="Remove from room"
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
                    Student List
                  </CardTitle>
                  <CardDescription>
                    {room.enrolledStudentsCount || 0} students enrolled
                  </CardDescription>
                </div>
                <EnrollStudentsDialog roomId={roomId} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search students by name or email..."
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
                  No students enrolled in this exam room yet
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No matching students found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Enrollment Date</TableHead>
                      <TableHead>Email Status</TableHead>
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
                          <Badge variant="default">Sent</Badge>
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
