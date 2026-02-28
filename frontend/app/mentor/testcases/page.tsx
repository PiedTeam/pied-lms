"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trophy, Hash, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TestCasesList } from "@/components/shared/TestCasesList";
import { ExamSelector } from "@/components/shared/ExamSelector";
import { useGetExamsByMentor } from "@/service";

export default function MentorTestCasesPage() {
  const router = useRouter();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  const { data: examsData, isLoading } = useGetExamsByMentor({
    pageNumber: 1,
    pageSize: 100,
  });
  const exams = examsData?.items || [];
  const selectedExam = exams.find((exam) => exam.id === selectedExamId);

  const handleExamSelect = (examId: string) => {
    setSelectedExamId(examId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Test Case Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Create and manage test cases for exams
        </p>
      </div>

      {/* Exam Selector */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading exams...
            </div>
          ) : (
            <ExamSelector
              exams={exams}
              selectedExamId={selectedExamId}
              onSelectExam={handleExamSelect}
            />
          )}
        </CardContent>
      </Card>

      {/* Test Cases Management */}
      {selectedExam ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {selectedExam.title}
                </CardTitle>
                <CardDescription>{selectedExam.description}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/mentor/exams/${selectedExam.id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
<<<<<<< HEAD
                Xem Đề Thi
=======
                View Exam
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="w-fit">
                    <Trophy className="w-3 h-3 mr-1" />
                    {selectedExam.totalMarks}
                  </Badge>
                  <span className="text-muted-foreground">total marks</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="w-fit">
                    <Hash className="w-3 h-3 mr-1" />
                    {selectedExam.passingMarks}
                  </Badge>
                  <span className="text-muted-foreground">passing marks</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <TestCasesList
            examId={selectedExam.id}
            examTitle={selectedExam.title}
          />
        </div>
      ) : (
        <Card className="h-[400px] flex items-center justify-center">
          <CardContent className="text-center">
            <div className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground">
              No Exam Selected
            </h3>
            <p className="text-sm text-muted-foreground/80 mt-2 max-w-sm mx-auto">
              Select an exam from the list to view and manage its test cases
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
