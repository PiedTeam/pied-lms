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
  examRooms: {
    label: "Exam Rooms",
    color: "hsl(var(--chart-1))",
  },
  exams: {
    label: "Exams",
    color: "hsl(var(--chart-2))",
  },
  quizlets: {
    label: "Quizlets",
    color: "hsl(var(--chart-3))",
  },
  candidates: {
    label: "Candidates",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export default function AdminDashboardPage() {
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

  const isAnyError =
    isExamRoomsError || isExamsError || isQuizletsError || isStudentsError;

  const isLoadingChart =
    isLoadingExamRooms || isLoadingExams || isLoadingQuizlets || isLoadingStudents;

  const overviewChartData = [
    {
      metric: "Exam Rooms",
      examRooms: examRooms?.totalCount ?? 0,
    },
    {
      metric: "Exams",
      exams: exams?.totalCount ?? 0,
    },
    {
      metric: "Quizlets",
      quizlets: quizletCount ?? 0,
    },
    {
      metric: "Candidates",
      candidates: studentCount ?? 0,
    },
  ];

  const activeVsTotalChartData = [
    {
      label: "Total",
      value: examRooms?.totalCount ?? 0,
    },
    {
      label: "Active",
      value: activeExamRooms?.totalCount ?? 0,
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          System overview for exam room management
        </p>
        {isAnyError && (
          <p className="mt-1 text-xs text-destructive">
            Some data could not be loaded. Please refresh.
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Exam Rooms */}
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
                examRooms?.totalCount ?? "-"
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoadingActiveExamRooms ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading active rooms...
                </span>
              ) : (
                `${activeExamRooms?.totalCount ?? 0} active exam rooms`
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
                exams?.totalCount ?? "-"
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
                quizletCount ?? "-"
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total quizlets in system
            </p>
          </CardContent>
        </Card>

        {/* Total Candidates */}
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
                studentCount ?? "-"
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
        {/* Bar Chart - System overview by metric */}
        <Card>
          <CardHeader>
            <CardTitle>System overview</CardTitle>
            <CardDescription>
              Current count of each resource type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingChart ? (
              <div className="flex h-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ChartContainer config={chartConfig}>
                <BarChart
                  data={overviewChartData}
                  margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="metric"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="examRooms"
                    fill="var(--color-examRooms)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="exams"
                    fill="var(--color-exams)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="quizlets"
                    fill="var(--color-quizlets)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="candidates"
                    fill="var(--color-candidates)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Active vs Total exam rooms */}
        <Card>
          <CardHeader>
            <CardTitle>Exam rooms status</CardTitle>
            <CardDescription>
              Total vs active exam rooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingExamRooms || isLoadingActiveExamRooms ? (
              <div className="flex h-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ChartContainer config={chartConfig}>
                <BarChart
                  data={activeVsTotalChartData}
                  margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="value"
                    fill="var(--color-examRooms)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
