"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="TEACHER">
      <div className="flex min-h-screen">
        <TeacherSidebar />
        <main className="flex-1 ml-64">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
