"use client";

import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TestCasesList } from "./TestCasesList";

interface TestCasesPageProps {
  role: "admin" | "teacher" | "mentor";
  questionTitle?: string;
}

export function TestCasesPage({ role, questionTitle }: TestCasesPageProps) {
  const params = useParams();
  const questionId = params.questionId as string;

  const getBackUrl = () => {
    switch (role) {
      case "admin":
        return `/admin/questions/${questionId}`;
      case "teacher":
        return `/teacher/questions/${questionId}`;
      case "mentor":
        return `/mentor/questions/${questionId}`;
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
            Back to Question
          </Link>
        </Button>
      </div>

      <TestCasesList questionId={questionId} questionTitle={questionTitle} />
    </div>
  );
}
