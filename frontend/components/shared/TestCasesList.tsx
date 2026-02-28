"use client";

import { useState } from "react";
import {
  Play,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TestCaseForm } from "@/components/shared/TestCaseForm";
import { TestCaseRunner } from "@/components/shared/TestCaseRunner";
import { useGetTestCasesByExam, useDeleteTestCase } from "@/service";
import type { TestCaseResponse } from "@/interface/testcase/testcase.interface";

interface TestCasesListProps {
  examId: string; // Changed from questionId
  examTitle?: string; // Changed from questionTitle
}

export function TestCasesList({
  examId, // Changed from questionId
  examTitle, // Changed from questionTitle
}: TestCasesListProps) {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] =
    useState<TestCaseResponse | null>(null);
  const [runningTestCase, setRunningTestCase] =
    useState<TestCaseResponse | null>(null);

  const { data: testCases, isLoading } = useGetTestCasesByExam(examId); // Changed from useGetTestCasesByQuestion
  const { mutate: deleteTestCase, isPending: isDeleting } = useDeleteTestCase();

  const handleDelete = (id: string) => {
    deleteTestCase(id, {
      onSuccess: (message) => {
        toast({
          title: "Thành công",
          description: message,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Lỗi",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const formatTime = (ms: number) => {
    if (ms >= 1000) {
      return `${ms / 1000}s`;
    }
    return `${ms}ms`;
  };

  const formatMemory = (mb: number) => {
    return `${mb}MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Test Cases</h2>
          {examTitle && (
            <p className="text-muted-foreground">Đề thi: {examTitle}</p> // Changed from "Câu hỏi"
          )}
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo Test Case
            </Button>
          </DialogTrigger>
<<<<<<< HEAD
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
=======
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              <DialogTitle>Tạo Test Case mới</DialogTitle>
              <DialogDescription>
                Tạo test case để kiểm tra tính đúng đắn của code
              </DialogDescription>
            </DialogHeader>
<<<<<<< HEAD
            <TestCaseForm
              examId={examId} // Changed from questionId
              existingTestCases={testCases || []} // Pass existing test cases
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                toast({
                  title: "Thành công",
                  description: "Test case đã được tạo",
                });
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
=======
            <div className="overflow-y-auto flex-1 pr-2">
              <TestCaseForm
                examId={examId} // Changed from questionId
                existingTestCases={testCases || []} // Pass existing test cases
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  toast({
                    title: "Thành công",
                    description: "Test case đã được tạo",
                  });
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </div>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Test Cases</CardTitle>
          <CardDescription>{testCases?.length || 0} test case</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải...
            </div>
          ) : testCases && testCases.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Input Path</TableHead>
                  <TableHead>Output Path</TableHead>
                  <TableHead>Index</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testCases.map((testCase) => (
                  <TableRow key={testCase.testCaseId}>
                    {" "}
                    {/* Changed from testCase.id */}
                    <TableCell className="font-mono text-sm max-w-xs">
                      <div className="truncate" title={testCase.inputPath}>
                        {testCase.inputPath || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm max-w-xs">
                      <div className="truncate" title={testCase.outputPath}>
                        {testCase.outputPath || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">Index: {testCase.index}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={testCase.isHidden ? "secondary" : "default"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {testCase.isHidden ? (
                          <>
                            <EyeOff className="h-3 w-3" />
                            Ẩn
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3" />
                            Công khai
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRunningTestCase(testCase)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTestCase(testCase)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa test case này? Hành
                                động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDelete(testCase.testCaseId)
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Play className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                Chưa có test case nào
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Tạo test case đầu tiên để kiểm tra code
              </p>
              <Button
                className="mt-4"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tạo Test Case
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingTestCase && (
        <Dialog
          open={!!editingTestCase}
          onOpenChange={() => setEditingTestCase(null)}
        >
<<<<<<< HEAD
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
=======
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              <DialogTitle>Chỉnh sửa Test Case</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin test case
              </DialogDescription>
            </DialogHeader>
<<<<<<< HEAD
            <TestCaseForm
              examId={examId} // Changed from questionId
              testCase={editingTestCase}
              existingTestCases={testCases || []} // Pass existing test cases
              onSuccess={() => {
                setEditingTestCase(null);
                toast({
                  title: "Thành công",
                  description: "Test case đã được cập nhật",
                });
              }}
              onCancel={() => setEditingTestCase(null)}
            />
=======
            <div className="overflow-y-auto flex-1 pr-2">
              <TestCaseForm
                examId={examId} // Changed from questionId
                testCase={editingTestCase}
                existingTestCases={testCases || []} // Pass existing test cases
                onSuccess={() => {
                  setEditingTestCase(null);
                  toast({
                    title: "Thành công",
                    description: "Test case đã được cập nhật",
                  });
                }}
                onCancel={() => setEditingTestCase(null)}
              />
            </div>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </DialogContent>
        </Dialog>
      )}

      {/* Run Dialog */}
      {runningTestCase && (
        <Dialog
          open={!!runningTestCase}
          onOpenChange={() => setRunningTestCase(null)}
        >
<<<<<<< HEAD
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
=======
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              <DialogTitle>Chạy Test Case</DialogTitle>
              <DialogDescription>
                Nhập code để test với test case này
              </DialogDescription>
            </DialogHeader>
<<<<<<< HEAD
            <TestCaseRunner
              testCase={runningTestCase}
              onClose={() => setRunningTestCase(null)}
            />
=======
            <div className="overflow-y-auto flex-1 pr-2">
              <TestCaseRunner
                testCase={runningTestCase}
                onClose={() => setRunningTestCase(null)}
              />
            </div>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
