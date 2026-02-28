"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useGetExamsByMentor, useCreateExam, useDeleteExam } from "@/service";
import type { CreateExamRequest } from "@/interface/exam/exam.interface";

interface ExamsListProps {
  basePath: string; // "/admin", "/teacher", or "/mentor"
}

export function ExamsList({ basePath }: ExamsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteExamId, setDeleteExamId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  const [pageNumber, setPageNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6; // Fixed page size
  const [formData, setFormData] = useState<CreateExamRequest>({
    title: "",
    description: "",
    totalMarks: 100,
    passingMarks: 50,
  });

  // Determine query parameters based on active tab
  const includeDeleted = activeTab === "archived";

  const { data: examsData, isLoading } = useGetExamsByMentor({
    pageNumber,
    pageSize,
    includeDeleted,
  });
  const { mutate: createExam, isPending: isCreating } = useCreateExam();
  const { mutate: deleteExam, isPending: isDeleting } = useDeleteExam();

  // Filter exams by tab (client-side filtering for archived tab)
  const allExams = examsData?.items || [];

  // Apply search filter
  const filteredExams = searchQuery
    ? allExams.filter(
<<<<<<< HEAD
        (exam) =>
          exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exam.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
=======
      (exam) =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
    : allExams;

  const currentExams =
    activeTab === "archived"
      ? filteredExams.filter((exam) => exam.isDeleted)
      : filteredExams.filter((exam) => !exam.isDeleted);

  // Calculate counts for tabs (from pagination data)
  const totalCount = examsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Reset page number when changing tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPageNumber(1);
  };

  // Handle next page
  const handleNextPage = () => {
    if (pageNumber < totalPages) {
      setPageNumber((prev) => prev + 1);
    }
  };

  // Handle previous page
  const handlePrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber((prev) => prev - 1);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createExam(formData, {
      onSuccess: () => {
        toast({
<<<<<<< HEAD
          title: "Thành công",
          description: "Đề thi đã được tạo thành công",
=======
          title: "Success",
          description: "Exam created successfully",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        });
        setIsCreateDialogOpen(false);
        setFormData({
          title: "",
          description: "",
          totalMarks: 100,
          passingMarks: 50,
        });
      },
      onError: (error: Error) => {
        toast({
<<<<<<< HEAD
          title: "Lỗi",
          description: error.message || "Không thể tạo đề thi",
=======
          title: "Error",
          description: error.message || "Failed to create exam",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          variant: "destructive",
        });
      },
    });
  };

  const handleDelete = () => {
    if (!deleteExamId) return;

    deleteExam(deleteExamId, {
      onSuccess: () => {
        toast({
<<<<<<< HEAD
          title: "Thành công",
          description: "Đề thi đã được ẩn thành công",
=======
          title: "Success",
          description: "Exam hidden successfully",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        });
        setDeleteExamId(null);
      },
      onError: (error: Error) => {
        toast({
<<<<<<< HEAD
          title: "Lỗi",
          description: error.message || "Không thể ẩn đề thi",
=======
          title: "Error",
          description: error.message || "Failed to hide exam",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
<<<<<<< HEAD
          <h1 className="text-3xl font-bold tracking-tight">Đề Thi</h1>
          <p className="text-muted-foreground">Quản lý các đề thi</p>
=======
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground">Manage exams</p>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
<<<<<<< HEAD
              Tạo Đề Thi
=======
              Create Exam
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleCreateSubmit}>
              <DialogHeader>
<<<<<<< HEAD
                <DialogTitle>Tạo Đề Thi Mới</DialogTitle>
                <DialogDescription>Nhập thông tin đề thi</DialogDescription>
=======
                <DialogTitle>Create New Exam</DialogTitle>
                <DialogDescription>Enter exam information</DialogDescription>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">
<<<<<<< HEAD
                    Tên Đề Thi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="VD: Đề thi giữa kỳ"
=======
                    Exam Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. Midterm Exam"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
<<<<<<< HEAD
                  <Label htmlFor="description">Mô Tả</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả về đề thi"
=======
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Exam description"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="totalMarks">
<<<<<<< HEAD
                      Tổng Điểm <span className="text-red-500">*</span>
=======
                      Total Score <span className="text-red-500">*</span>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    </Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      min="1"
                      placeholder="100"
                      value={formData.totalMarks}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalMarks: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="passingMarks">
<<<<<<< HEAD
                      Điểm Đạt <span className="text-red-500">*</span>
=======
                      Passing Score <span className="text-red-500">*</span>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    </Label>
                    <Input
                      id="passingMarks"
                      type="number"
                      min="1"
                      placeholder="50"
                      value={formData.passingMarks}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passingMarks: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
<<<<<<< HEAD
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Đang tạo..." : "Tạo Đề Thi"}
=======
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Exam"}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
<<<<<<< HEAD
          <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
          <TabsTrigger value="archived">Đã ẩn</TabsTrigger>
=======
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Hidden</TabsTrigger>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
<<<<<<< HEAD
                  <CardTitle>Danh Sách Đề Thi</CardTitle>
                  <CardDescription>
                    Trang {pageNumber} / {totalPages} - Tổng: {totalCount}
=======
                  <CardTitle>Exam List</CardTitle>
                  <CardDescription>
                    Page {pageNumber} / {totalPages} - Total: {totalCount}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  </CardDescription>
                </div>
                <div className="w-72">
                  <Input
<<<<<<< HEAD
                    placeholder="Tìm kiếm đề thi..."
=======
                    placeholder="Search exams..."
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {/* Loading skeleton */}
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 animate-pulse"
                    >
                      <div className="h-12 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {!currentExams.length ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {activeTab === "active"
<<<<<<< HEAD
                        ? "Chưa có đề thi nào. Tạo đề thi đầu tiên!"
                        : "Không có đề thi nào đã ẩn."}
=======
                        ? "No exams yet. Create your first exam!"
                        : "No hidden exams."}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
<<<<<<< HEAD
                          <TableHead>Tên Đề Thi</TableHead>
                          <TableHead>Mô Tả</TableHead>
                          <TableHead>Điểm</TableHead>
                          <TableHead className="text-right">Thao Tác</TableHead>
=======
                          <TableHead>Exam Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentExams.map((exam) => {
                          const isArchived = exam.isDeleted;

                          return (
                            <TableRow
                              key={exam.id}
                              className={isArchived ? "opacity-60" : ""}
                            >
                              <TableCell className="font-medium">
                                {exam.title}
                                {isArchived && (
                                  <span className="ml-2 text-xs text-muted-foreground">
<<<<<<< HEAD
                                    (Đã ẩn)
=======
                                    (Hidden)
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="max-w-md truncate">
                                {exam.description || "—"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
<<<<<<< HEAD
                                    Tổng: {exam.totalMarks}
                                  </Badge>
                                  <Badge variant="secondary">
                                    Đạt: {exam.passingMarks}
=======
                                    Total: {exam.totalMarks}
                                  </Badge>
                                  <Badge variant="secondary">
                                    Pass: {exam.passingMarks}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      router.push(
                                        `${basePath}/exams/${exam.id}`,
                                      )
                                    }
<<<<<<< HEAD
                                    title="Xem chi tiết"
=======
                                    title="View details"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {!isArchived && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          router.push(
                                            `${basePath}/exams/${exam.id}/edit`,
                                          )
                                        }
<<<<<<< HEAD
                                        title="Chỉnh sửa"
=======
                                        title="Edit"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteExamId(exam.id)}
<<<<<<< HEAD
                                        title="Ẩn đề thi"
=======
                                        title="Hide exam"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                      >
                                        <Archive className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}

                  {/* Pagination Controls - Always show if totalPages > 1 */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePrevPage}
                        disabled={pageNumber === 1 || isLoading}
<<<<<<< HEAD
                        title="Trang trước"
=======
                        title="Previous page"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                      >
                        &lt;
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextPage}
                        disabled={pageNumber >= totalPages || isLoading}
<<<<<<< HEAD
                        title="Trang sau"
=======
                        title="Next page"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                      >
                        &gt;
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={!!deleteExamId}
        onOpenChange={() => setDeleteExamId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
<<<<<<< HEAD
            <AlertDialogTitle>Xác nhận ẩn đề thi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn ẩn đề thi này? Đề thi sẽ không hiển thị
              trong danh sách nhưng dữ liệu vẫn được lưu trữ. Admin có thể khôi
              phục lại sau này nếu cần.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
=======
            <AlertDialogTitle>Confirm Hide Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to hide this exam? The exam will not appear
              in the list but data will still be stored. Admin can restore it
              later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
<<<<<<< HEAD
              {isDeleting ? "Đang ẩn..." : "Ẩn đề thi"}
=======
              {isDeleting ? "Hiding..." : "Hide Exam"}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
