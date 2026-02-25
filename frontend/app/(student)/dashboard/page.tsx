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

    if (user?.role === "ADMIN") {
      router.push("/admin");
    }

    if (user?.role === "MENTOR") {
      router.push("/dashboard");
    }
  }, [token, user, router]);

  if (!token) return null;

  return <StudentDashboard />;
}
