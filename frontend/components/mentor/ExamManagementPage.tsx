"use client";

import { useState } from "react";
import { useGetExamsByMentor } from "@/services/exam/exam.service";
import { ExamImportDialog } from "@/components/shared/ExamImportDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Plus } from "lucide-react";

/**
 * Exam Management Page for Mentors
 * Displays list of exams and provides import functionality
 */
export function ExamManagementPage() {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const {
    data: examsData,
    isLoading,
    refetch,
  } = useGetExamsByMentor({
    pageNumber,
    pageSize,
  });

  const handleImportSuccess = () => {
    // Refetch exams list after successful import
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Management</h1>
          <p className="text-gray-600 mt-1">
            Create and manage exams with test cases
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setImportDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Exam
          </Button>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
        </div>
      </div>

      {/* Import Dialog */}
      <ExamImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={handleImportSuccess}
      />

      {/* Exams List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Exams</CardTitle>
          <CardDescription>
            Total: {examsData?.pagination.total || 0} exams
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading exams...</p>
            </div>
          ) : examsData?.items && examsData.items.length > 0 ? (
            <div className="space-y-4">
              {examsData.items.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {exam.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {exam.description}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>Total Marks: {exam.totalMarks}</span>
                      <span>Passing Marks: {exam.passingMarks}</span>
                      <span>
                        Created: {new Date(exam.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No exams found</p>
              <p className="text-sm text-gray-400 mt-1">
                Create a new exam or import from Excel file
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
