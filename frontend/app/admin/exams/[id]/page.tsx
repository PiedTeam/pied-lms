"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestCasesList } from "@/components/shared/TestCasesList";
import { useGetExamById } from "@/services";

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const { data: exam, isLoading } = useGetExamById(examId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Exam not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
        </div>
        <Button onClick={() => router.push(`/admin/exams/${examId}/edit`)}>
          Edit
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Max Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exam.totalMarks}</div>
            <p className="text-sm text-muted-foreground">points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Passing Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exam.passingMarks}</div>
            <p className="text-sm text-muted-foreground">points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Created At
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{formatDate(exam.createdAt)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Exam Title
            </p>
            <p className="text-base">{exam.title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {" "}
              Description
            </p>
            <p className="text-base whitespace-pre-line">
              {exam.description || "No description"}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Max Score
              </p>
              <p className="text-base">{exam.totalMarks} points</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Passing Score
              </p>
              <p className="text-base">{exam.passingMarks} points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <TestCasesList examId={examId} examTitle={exam.title} />
    </div>
  );
}
