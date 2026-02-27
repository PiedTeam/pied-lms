"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  Loader2,
} from "lucide-react";
import {
  useGetAllUsers,
  useGetAllStudents,
  useGetAllExamRooms,
  useGetAllQuizlets,
  useGetAllExams,
} from "@/service";

export default function AdminDashboardPage() {
  // Fetch data with pageSize=1 to get only totalCount
  const { data: usersData, isLoading: loadingUsers } = useGetAllUsers({
    pageNumber: 1,
    pageSize: 1,
  });

  const { data: studentsData, isLoading: loadingStudents } = useGetAllStudents({
    pageNumber: 1,
    pageSize: 1,
  });

  const { data: examRoomsData, isLoading: loadingExamRooms } =
    useGetAllExamRooms({
      pageNumber: 1,
      pageSize: 1,
    });

  const { data: activeExamRoomsData, isLoading: loadingActiveExamRooms } =
    useGetAllExamRooms({
      pageNumber: 1,
      pageSize: 1,
      status: "Ongoing",
    });

  const { data: examsData, isLoading: loadingExams } = useGetAllExams({
    pageNumber: 1,
    pageSize: 1,
  });

  const { data: quizletsData, isLoading: loadingQuizlets } =
    useGetAllQuizlets();

  const stats = [
    {
      title: "Tổng phòng thi",
      value: examRoomsData?.totalCount || 0,
      subtitle: loadingActiveExamRooms
        ? "Đang tải..."
        : `${activeExamRoomsData?.totalCount || 0} phòng đang hoạt động`,
      icon: BookOpen,
      loading: loadingExamRooms,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Tổng bài thi",
      value: examsData?.totalCount || 0,
      subtitle: "Bài thi trong hệ thống",
      icon: FileText,
      loading: loadingExams,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Tổng quizlet",
      value: quizletsData?.length || 0,
      subtitle: "Quizlet trong hệ thống",
      icon: FileText,
      loading: loadingQuizlets,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Tổng học sinh",
      value: studentsData?.totalCount || 0,
      subtitle: "Học sinh đã đăng ký",
      icon: GraduationCap,
      loading: loadingStudents,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Tổng quan hệ thống quản lý phòng thi
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {stat.loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Đang tải...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.subtitle}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
