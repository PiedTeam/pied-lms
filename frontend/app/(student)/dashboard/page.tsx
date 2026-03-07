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

    const normalizedRole = user?.role?.toLowerCase();

    if (normalizedRole === "admin") {
      router.push("/admin/dashboard");
      return;
    }

    if (normalizedRole === "mentor") {
      router.push("/mentor/dashboard");
      return;
    }

    if (normalizedRole === "teacher") {
      router.push("/teacher/dashboard");
      return;
    }
  }, [token, user, router]);

  if (!token) return null;

  return <StudentDashboard />;
}
