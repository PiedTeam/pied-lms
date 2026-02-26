"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Loader2,
  Plus,
  ArrowRight,
  User,
  Calendar,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useGetAvailableExamRooms } from "@/service";

export function StudentDashboard() {
  const user = useAuthStore((state) => state.user);
  const { data: roomsData, isLoading } = useGetAvailableExamRooms({
    pageNumber: 1,
    pageSize: 100,
  });

  const dashboardStats = useMemo(() => {
    const rooms = roomsData?.items || [];

    const totalRooms = rooms.filter((room) => !room.isDeleted).length;
    const activeExams = rooms.filter(
      (room) => room.status === "Ongoing" && !room.isDeleted,
    ).length;
    const upcomingExams = rooms.filter(
      (room) => room.status === "Upcoming" && !room.isDeleted,
    ).length;

    return {
      totalRooms,
      activeExams,
      upcomingExams,
    };
  }, [roomsData]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {user?.fullName ?? "Student"}! Here&apos;s an overview
          of your exam activities.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Rooms Joined
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats.totalRooms}
                </div>
                <p className="text-xs text-muted-foreground">
                  Rooms you&apos;ve joined
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Exams
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {dashboardStats.activeExams}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently open exams
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Exams
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardStats.upcomingExams}
                </div>
                <p className="text-xs text-muted-foreground">
                  Exams starting soon
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Quick access to common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button
                  asChild
                  variant="outline"
                  className="h-auto flex-col py-4"
                >
                  <Link href="/exam-rooms">
                    <Plus className="mb-2 h-6 w-6" />
                    <span>Join Room</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto flex-col py-4"
                >
                  <Link href="/exam-rooms">
                    <BookOpen className="mb-2 h-6 w-6" />
                    <span>View All Rooms</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto flex-col py-4"
                >
                  <Link href="/profile">
                    <User className="mb-2 h-6 w-6" />
                    <span>View Profile</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {dashboardStats.totalRooms === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  You haven&apos;t joined any exam rooms yet. Join a room to
                  start taking exams!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/exam-rooms">
                    <Plus className="mr-2 h-4 w-4" />
                    Join Your First Room
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        coded with love and coffee by hội bàn đầu
      </p>
    </div>
  );
}
