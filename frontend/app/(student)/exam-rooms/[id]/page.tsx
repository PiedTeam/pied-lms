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
import { useGetExamRoomById } from "@/service";
import { useState, useEffect } from "react";

export default function StudentExamRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roomId = params.id as string;

  const { data: room, isLoading: isLoadingRoom } = useGetExamRoomById(roomId);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Calculate time remaining until end time
  useEffect(() => {
    if (!room?.endTime) return;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const endTime = new Date(room.endTime).getTime();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeRemaining("Finished");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(
          `${days}d ${hours}h ${minutes}m ${seconds}s`,
        );
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
  }, [room?.endTime]);

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
        return (
          <Badge variant="default" className="bg-green-500">
            Ongoing
          </Badge>
        );
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "closed":
        return <Badge variant="outline">Finished</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStartExam = (examId: string) => {
    // Save room data to localStorage for time calculation
    if (room) {
      localStorage.setItem(
        `roomData_${roomId}`,
        JSON.stringify({
          endTime: room.endTime,
          startTime: room.startTime,
          durationInMinutes: room.durationInMinutes,
        }),
      );
    }

    // Simply navigate to exam taking page
    // No API call here, just show the UI
    router.push(`/exam-rooms/${roomId}/exams/${examId}/take`);
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
            <p className="text-sm text-muted-foreground">
              Total exams in room
            </p>
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
                  <TableHead className="text-right">Action</TableHead>
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
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start
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
