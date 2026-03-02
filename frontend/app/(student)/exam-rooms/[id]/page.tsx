"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, FileText, Play, Eye } from "lucide-react";
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
import { useGetExamRoomById, useStartExam } from "@/service";
import { useState, useEffect } from "react";
import { useExamRoomScores } from "@/hooks/use-exam-scores";

export default function StudentExamRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roomId = params.id as string;

  const {
    data: room,
    isLoading: isLoadingRoom,
    refetch,
  } = useGetExamRoomById(roomId);
  const { mutate: startExam, isPending: isStartingExam } = useStartExam();
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [hasAutoRedirected, setHasAutoRedirected] = useState(false);

  // Get exam scores for this room
  const roomScores = useExamRoomScores(roomId);

  // Calculate time remaining until end time
  useEffect(() => {
    if (!room?.endTime) return;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const endTime = new Date(room.endTime).getTime();
      const diff = endTime - now;

      // Check if room is already closed/finished - don't auto redirect
      const isClosed = room.status?.toLowerCase() === "completed";

      if (diff <= 0) {
        setTimeRemaining("Exam time has ended");

        // Only auto redirect if room is still ongoing and hasn't redirected yet
        if (
          !isClosed &&
          !hasAutoRedirected &&
          room.status?.toLowerCase() === "ongoing"
        ) {
          setHasAutoRedirected(true);

          toast({
            title: "Exam Room Closed",
            description: "The exam room time has ended. Redirecting...",
            variant: "default",
          });

          // Refetch to update status
          refetch();

          // Redirect after 2 seconds
          setTimeout(() => {
            router.push("/exam-rooms");
          }, 2000);
        }

        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000); // Update every second

    return () => clearInterval(interval);
  }, [room?.endTime, room?.status, router, toast, hasAutoRedirected, refetch]);

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
      case "ongoing":
        return (
          <Badge variant="default" className="bg-green-500">
            Ongoing
          </Badge>
        );
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "completed":
        return <Badge variant="outline">Finished</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStartExam = (examId: string) => {
    const isClosed = room?.status?.toLowerCase() === "completed";

    // If room is closed, just view the exam (read-only mode)
    if (isClosed) {
      toast({
        title: "View Only",
        description: "This exam room has ended. You can only view the exam.",
        variant: "default",
      });
      router.push(`/exam-rooms/${roomId}/exams/${examId}/take`);
      return;
    }

    // Save room data to localStorage for time calculation
    if (room) {
      localStorage.setItem(
        `roomData_${roomId}`,
        JSON.stringify({
          endTime: room.endTime,
          startTime: room.startTime,
          durationInMinutes: room.durationInMinutes,
          isClosed: isClosed,
          roomCode: room.roomCode,
        }),
      );
    }

    // Call API to start exam and get participationId
    startExam(
      {
        roomCode: room?.roomCode || "",
        examId: examId,
      },
      {
        onSuccess: (participation) => {
          // Save participationId to localStorage
          const participationKey = `exam_participation_${roomId}_${examId}`;
          localStorage.setItem(participationKey, participation.id);

          toast({
            title: "Exam Started",
            description: "Good luck with your exam!",
          });

          // Navigate to exam taking page
          router.push(`/exam-rooms/${roomId}/exams/${examId}/take`);
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to start exam",
            variant: "destructive",
          });
        },
      },
    );
  };

  if (isLoadingRoom) {
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
            <CardTitle>Exam Room Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <p className="text-sm font-medium">Time Remaining</p>
                <p className="text-sm text-muted-foreground">
                  {timeRemaining || "Calculating..."}
                </p>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Exam List
          </CardTitle>
          <CardDescription>{room.exams?.length || 0} exams</CardDescription>
        </CardHeader>
        <CardContent>
          {!room.exams?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No exams available in this room
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Max Score</TableHead>
                  <TableHead>Passing Score</TableHead>
                  <TableHead>Your Score</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {room.exams.map((exam) => {
                  const isClosed = room.status?.toLowerCase() === "completed";
                  // Find score for this exam
                  const examScore = roomScores.find(
                    (s) => s.examId === exam.id,
                  );

                  return (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">
                        {exam.title}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {exam.description}
                      </TableCell>
                      <TableCell>{exam.totalMarks}</TableCell>
                      <TableCell>{exam.passingMarks}</TableCell>
                      <TableCell>
                        {examScore ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {examScore.score}/{examScore.totalMarks}
                            </span>
                            <Badge
                              variant={
                                examScore.score >= exam.passingMarks
                                  ? "default"
                                  : "destructive"
                              }
                              className={
                                examScore.score >= exam.passingMarks
                                  ? "bg-green-600"
                                  : ""
                              }
                            >
                              {examScore.score >= exam.passingMarks
                                ? "Passed"
                                : "Failed"}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Not submitted
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={isClosed ? "outline" : "default"}
                          onClick={() => handleStartExam(exam.id)}
                          disabled={isStartingExam}
                        >
                          {isClosed ? (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              {isStartingExam ? "Starting..." : "Start"}
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
