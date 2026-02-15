"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";

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
      // Redirect to appropriate dashboard based on role
      if (user?.role === "ADMIN" || user?.role === "Administrator") {
        router.push("/admin");
      } else if (user?.role === "STUDENT" || user?.role === "Student") {
        router.push("/student/dashboard");
      } else if (user?.role === "MENTOR" || user?.role === "Mentor") {
        router.push("/mentor/dashboard");
      }
    }
  }, [token, user, router]);

  if (!token || (user?.role !== "TEACHER" && user?.role !== "Teacher"))
    return null;

  return <TeacherDashboard />;
}
