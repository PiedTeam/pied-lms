"use client";

import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TestCasesList } from "./TestCasesList";

interface TestCasesPageProps {
  role: "admin" | "teacher" | "mentor";
  examTitle?: string;
}

export function TestCasesPage({ role, examTitle }: TestCasesPageProps) {
  const params = useParams();
  const examId = params.examId as string;

  const getBackUrl = () => {
    switch (role) {
      case "admin":
        return `/admin/exams/${examId}`;
      case "teacher":
        return `/teacher/exams/${examId}`;
      case "mentor":
        return `/mentor/exams/${examId}`;
      default:
        return "/";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={getBackUrl()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exam
          </Link>
        </Button>
      </div>

      <TestCasesList examId={examId} examTitle={examTitle} />
    </div>
  );
}
