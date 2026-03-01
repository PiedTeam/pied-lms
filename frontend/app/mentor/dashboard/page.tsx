"use client";

import { useAuthStore } from "@/store/auth.store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DoorOpen, FileText, FileSpreadsheet, Users } from "lucide-react";
import { useGetExamRoomsByMentor, useGetExamsByMentor } from "@/service";
import { useGetQuizletCount } from "@/services/quizlet/quizlet.service";
import { useGetStudentCount } from "@/services/user/user.service";

export default function MentorDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: examRoomsData } = useGetExamRoomsByMentor({
    pageNumber: 1,
    pageSize: 10,
  });

  const { data: examsData } = useGetExamsByMentor({
    pageNumber: 1,
    pageSize: 10,
  });

  const { data: quizsCount } = useGetQuizletCount();
  const { data: studentsCount } = useGetStudentCount();
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.fullName || "Mentor"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exam Rooms</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {examRoomsData?.totalCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total exam rooms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {examsData?.totalCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total exams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizlets</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Total quizlets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentsCount !== undefined ? studentsCount : 0}
            </div>
            <p className="text-xs text-muted-foreground">Total students</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Exam Rooms</CardTitle>
            <CardDescription>
              {examRoomsData?.items.length || 0} exam rooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!examRoomsData?.items.length ? (
              <p className="text-sm text-muted-foreground">
                No exam rooms yet
              </p>
            ) : (
              <div className="space-y-4">
                {examRoomsData.items.slice(0, 5).map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{room.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(room.startTime).toLocaleDateString("en-US")}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {room.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Exams</CardTitle>
            <CardDescription>
              {examsData?.items.length || 0} exams
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!examsData?.items.length ? (
              <p className="text-sm text-muted-foreground">
                No exams yet
              </p>
            ) : (
              <div className="space-y-4">
                {examsData.items.slice(0, 5).map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{exam.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {exam.totalMarks} marks
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(exam.createdAt).toLocaleDateString("en-US")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
