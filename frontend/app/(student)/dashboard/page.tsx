"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { StudentDashboard } from "@/components/student/StudentDashboard";

export default function StudentDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (user?.role === "ADMIN" || user?.role === "Administrator") {
      router.push("/admin");
    }

    if (user?.role === "MENTOR" || user?.role === "Mentor") {
      router.push("/mentor/dashboard");
    }

    if (user?.role === "TEACHER" || user?.role === "Teacher") {
      router.push("/teacher/dashboard");
    }
  }, [token, user, router]);

  if (!token) return null;

  return <StudentDashboard />;
}
