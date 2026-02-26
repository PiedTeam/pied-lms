"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Users,
  FileQuestion,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { useGetExamRoomsByAdmin } from "@/services/exam-room/exam-room.service";
import { useGetExamsByAdmin } from "@/services/exam/exam.service";
import { useGetQuizletCount } from "@/services/quizlet/quizlet.service";
import { useGetStudentCount } from "@/services/user/user.service";

const chartConfig = {
  phongThi: {
    label: "Exam rooms",
    color: "hsl(var(--chart-1))",
  },
  sinhVien: {
    label: "Students",
    color: "hsl(var(--chart-2))",
  },
  cauHoi: {
    label: "Questions",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

// Fallback data when APIs are unavailable (UI demo)
const FALLBACK_STATS = {
  totalExamRooms: 24,
  activeExamRooms: 3,
  totalExams: 320,
  totalQuizlets: 12,
  totalStudents: 128,
};

// Mocked chart data for last 6 months
const MOCK_CHART_DATA = [
  { month: "Jan", phongThi: 3, sinhVien: 25, cauHoi: 40 },
  { month: "Feb", phongThi: 4, sinhVien: 30, cauHoi: 52 },
  { month: "Mar", phongThi: 5, sinhVien: 35, cauHoi: 60 },
  { month: "Apr", phongThi: 3, sinhVien: 28, cauHoi: 48 },
  { month: "May", phongThi: 4, sinhVien: 32, cauHoi: 55 },
  { month: "Jun", phongThi: 5, sinhVien: 40, cauHoi: 65 },
];

// Mocked recent activities
const MOCK_RECENT_ACTIVITIES = [
  {
    type: "room",
    message: 'Tạo phòng thi mới "Final Exam Room A"',
    time: "2 hours ago",
    color: "bg-purple-500",
  },
  {
    type: "question",
    message: 'Thêm câu hỏi mới vào "Midterm Room B"',
    time: "Yesterday",
    color: "bg-blue-500",
  },
  {
    type: "exam",
    message: 'Phòng thi "Quiz Room C" đã bắt đầu',
    time: "Đang diễn ra",
    color: "bg-green-500",
  },
  {
    type: "user",
    message: "Thêm mới 10 thí sinh vào hệ thống",
    time: "3 days ago",
    color: "bg-orange-500",
  },
];

export default function AdminDashboardPage() {
  // Live counts for top-level stats
  const {
    data: examRooms,
    isLoading: isLoadingExamRooms,
    isError: isExamRoomsError,
  } = useGetExamRoomsByAdmin({
    pageNumber: 1,
    pageSize: 1,
  });

  const {
    data: activeExamRooms,
    isLoading: isLoadingActiveExamRooms,
    isError: isActiveExamRoomsError,
  } = useGetExamRoomsByAdmin({
    pageNumber: 1,
    pageSize: 1,
    status: "active",
  });

  const {
    data: exams,
    isLoading: isLoadingExams,
    isError: isExamsError,
  } = useGetExamsByAdmin({
    pageNumber: 1,
    pageSize: 1,
  });

  const {
    data: quizletCount,
    isLoading: isLoadingQuizlets,
    isError: isQuizletsError,
  } = useGetQuizletCount();
  const {
    data: studentCount,
    isLoading: isLoadingStudents,
    isError: isStudentsError,
  } = useGetStudentCount();

  const usingFallback =
    isExamRoomsError ||
    isActiveExamRoomsError ||
    isExamsError ||
    isQuizletsError ||
    isStudentsError;

  const dashboardStats = {
    totalExamRooms: examRooms?.totalCount,
    activeExamRooms: activeExamRooms?.totalCount,
    totalExams: exams?.totalCount,
    totalQuizlets: quizletCount,
    totalStudents: studentCount,
  };

  const chartData = MOCK_CHART_DATA;
  const recentActivities = MOCK_RECENT_ACTIVITIES;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Tổng quan hệ thống quản lý phòng thi
        </p>
        {usingFallback && (
          <p className="mt-1 text-xs text-muted-foreground">
            Demo data (API unavailable)
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Rooms */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total exam rooms
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingExamRooms ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                dashboardStats.totalExamRooms
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoadingActiveExamRooms ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading active rooms...
                </span>
              ) : (
                `${dashboardStats.activeExamRooms} active exam rooms`
              )}
            </p>
          </CardContent>
        </Card>

        {/* Total Exams */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total exams</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingExams ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                dashboardStats.totalExams
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Exams configured in the system
            </p>
          </CardContent>
        </Card>

        {/* Total Quizlets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total quizlets
            </CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingQuizlets ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                dashboardStats.totalQuizlets
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total quizlets in system
            </p>
          </CardContent>
        </Card>

        {/* Total Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total candidates
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoadingStudents ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                dashboardStats.totalStudents
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered candidates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Area Chart - Xu hướng theo thời gian */}
        <Card>
          <CardHeader>
            <CardTitle>Last 6 months trend</CardTitle>
            <CardDescription>
              Statistics of exam rooms, students and questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart
                data={chartData}
                margin={{
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="phongThi"
                  type="monotone"
                  fill="var(--color-phongThi)"
                  fillOpacity={0.4}
                  stroke="var(--color-phongThi)"
                  stackId="1"
                />
                <Area
                  dataKey="sinhVien"
                  type="monotone"
                  fill="var(--color-sinhVien)"
                  fillOpacity={0.4}
                  stroke="var(--color-sinhVien)"
                  stackId="1"
                />
                <Area
                  dataKey="cauHoi"
                  type="monotone"
                  fill="var(--color-cauHoi)"
                  fillOpacity={0.4}
                  stroke="var(--color-cauHoi)"
                  stackId="1"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - So sánh */}
        <Card>
          <CardHeader>
            <CardTitle>Current month comparison</CardTitle>
            <CardDescription>Detailed statistics by metric</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart
                data={chartData.slice(-3)}
                margin={{
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="phongThi"
                  fill="var(--color-phongThi)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="sinhVien"
                  fill="var(--color-sinhVien)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="cauHoi"
                  fill="var(--color-cauHoi)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest activities in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No activity yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    <div className={`h-2 w-2 rounded-full ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
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
