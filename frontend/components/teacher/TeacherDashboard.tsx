"use client";

// TODO: Old project services - need to be replaced or removed
// import { useGetAdminRooms } from "@/service/admin/room.service";
// import { useGetAdminQuestions } from "@/service/admin/question.service";
import { BookOpen, FileQuestion, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function TeacherDashboard() {
  // TODO: Replace with new services
  // const { data: roomsData } = useGetAdminRooms();
  // const { data: questionsData } = useGetAdminQuestions();
  interface RoomData {
    uuid: string;
    name: string;
    code: string;
  }

  interface QuestionData {
    id: string;
    title: string;
  }

  const roomsData: { data: RoomData[] } | null = null;
  const questionsData: { data: { listQuestion: QuestionData[] } } | null = null;

  const rooms: RoomData[] =
    (roomsData as { data: RoomData[] } | null)?.data || [];
  const questions: QuestionData[] =
    (questionsData as { data: { listQuestion: QuestionData[] } } | null)?.data
      ?.listQuestion || [];

  const stats = [
    {
      title: "Total Rooms",
      value: rooms.length,
      icon: BookOpen,
      href: "/teacher/rooms",
      color: "text-blue-600",
    },
    {
      title: "Total Questions",
      value: questions.length,
      icon: FileQuestion,
      href: "/teacher/questions",
      color: "text-green-600",
    },
    {
      title: "Active Students",
      value: 0, // TODO: Get from API
      icon: Users,
      href: "/teacher/students",
      color: "text-purple-600",
    },
    {
      title: "Avg Score",
      value: "0%", // TODO: Get from API
      icon: TrendingUp,
      href: "/teacher/analytics",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here&apos;s an overview of your teaching activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <Link href={stat.href}>
                  <Button variant="link" className="px-0 text-xs">
                    View details →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Rooms */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exam Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No exam rooms yet. Create your first room to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {rooms
                .slice(0, 5)
                .map((room: { uuid: string; name: string; code: string }) => (
                  <div
                    key={room.uuid}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{room.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Code: {room.code}
                      </p>
                    </div>
                    <Link href={`/teacher/rooms/${room.uuid}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
