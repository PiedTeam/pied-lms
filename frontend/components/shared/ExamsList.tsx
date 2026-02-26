"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const [formData, setFormData] = useState<CreateExamRequest>({
    title: "",
    description: "",
    totalMarks: 100,
    passingMarks: 50,
  });

  const { data: examsData, isLoading } = useGetExamsByMentor({
    pageNumber: 1,
    pageSize: 50,
  });
  const { mutate: createExam, isPending: isCreating } = useCreateExam();
  const { mutate: deleteExam, isPending: isDeleting } = useDeleteExam();

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createExam(formData, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Đề thi đã được tạo thành công",
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
          title: "Lỗi",
          description: error.message || "Không thể tạo đề thi",
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
          title: "Thành công",
          description: "Đề thi đã được xóa thành công",
        });
        setDeleteExamId(null);
      },
      onError: (error: Error) => {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể xóa đề thi",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đề Thi</h1>
          <p className="text-muted-foreground">Quản lý các đề thi</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo Đề Thi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleCreateSubmit}>
              <DialogHeader>
                <DialogTitle>Tạo Đề Thi Mới</DialogTitle>
                <DialogDescription>Nhập thông tin đề thi</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">
                    Tên Đề Thi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="VD: Đề thi giữa kỳ"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Mô Tả</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả về đề thi"
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
                      Tổng Điểm <span className="text-red-500">*</span>
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
                      Điểm Đạt <span className="text-red-500">*</span>
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
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Đang tạo..." : "Tạo Đề Thi"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Đề Thi</CardTitle>
          <CardDescription>
            {examsData?.items.length || 0} đề thi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : !examsData?.items.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có đề thi nào. Tạo đề thi đầu tiên!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên Đề Thi</TableHead>
                  <TableHead>Mô Tả</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examsData.items.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {exam.description || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Tổng: {exam.totalMarks}</Badge>
                        <Badge variant="secondary">
                          Đạt: {exam.passingMarks}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`${basePath}/exams/${exam.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`${basePath}/exams/${exam.id}/edit`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteExamId(exam.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteExamId}
        onOpenChange={() => setDeleteExamId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác Nhận Xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đề thi này? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
