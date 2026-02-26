"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function TeacherDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (user?.role !== "TEACHER" && user?.role !== "Teacher") {
      if (user?.role === "ADMIN" || user?.role === "Admin") {
        router.push("/admin");
      } else if (user?.role === "STUDENT" || user?.role === "Student") {
        router.push("/student/dashboard");
      } else if (user?.role === "MENTOR" || user?.role === "Mentor") {
        router.push("/mentor/dashboard");
      }
    }
  }, [token, user, router]);

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

  // --- Debug logs ---
  console.log("[TeacherDashboard] user:", user);
  console.log("[TeacherDashboard] examRoomsData:", examRoomsData);
  console.log("[TeacherDashboard] examsData:", examsData);
  console.log("[TeacherDashboard] quizsCount:", quizsCount);
  console.log("[TeacherDashboard] studentsCount:", studentsCount);
  // ------------------

  if (!token || (user?.role !== "TEACHER" && user?.role !== "Teacher"))
    return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.fullName || "Teacher"}
        </p>
      </div>

      {/* Stats Cards */}
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

      {/* Recent Lists */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent exam rooms</CardTitle>
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
            <CardTitle>Recent exams</CardTitle>
            <CardDescription>
              {examsData?.items.length || 0} exams
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!examsData?.items.length ? (
              <p className="text-sm text-muted-foreground">No exams yet</p>
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
