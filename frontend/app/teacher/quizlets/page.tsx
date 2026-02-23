"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, Plus } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useGetAllQuizlets,
  useCreateQuizlet,
  useDeleteQuizlet,
} from "@/service";

export default function QuizletsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuizlet, setSelectedQuizlet] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const { data: quizlets, isLoading } = useGetAllQuizlets();
  const { mutate: createQuizlet, isPending: isCreating } = useCreateQuizlet();
  const { mutate: deleteQuizlet } = useDeleteQuizlet();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".xlsx")) {
        toast({
          title: "Lỗi",
          description: "Chỉ chấp nhận file Excel (.xlsx)",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file Excel",
        variant: "destructive",
      });
      return;
    }

    createQuizlet(
      {
        title,
        description,
        isPublished,
        listQuestion: file,
      },
      {
        onSuccess: (message) => {
          toast({
            title: "Thành công",
            description: message,
          });
          setIsCreateDialogOpen(false);
          setTitle("");
          setDescription("");
          setIsPublished(false);
          setFile(null);
        },
        onError: (error: Error) => {
          toast({
            title: "Lỗi",
            description: error.message,
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleDelete = (id: number, title: string) => {
    setSelectedQuizlet({ id, title });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedQuizlet) return;

    deleteQuizlet(selectedQuizlet.id, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Đã xóa quizlet thành công",
        });
        setIsDeleteDialogOpen(false);
        setSelectedQuizlet(null);
      },
      onError: (error: Error) => {
        toast({
          title: "Lỗi",
          description: error.message,
          variant: "destructive",
        });
        setIsDeleteDialogOpen(false);
        setSelectedQuizlet(null);
      },
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Quizlet</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý các bộ câu hỏi từ file Excel
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo Quizlet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Tạo Quizlet mới</DialogTitle>
                <DialogDescription>
                  Upload file Excel chứa câu hỏi. File phải có định dạng .xlsx
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">
                    Tiêu đề <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Nhập tiêu đề quizlet"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    placeholder="Nhập mô tả (tùy chọn)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="file">
                    File Excel <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file"
                      type="file"
                      accept=".xlsx"
                      onChange={handleFileChange}
                      required
                    />
                    <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    File Excel phải có các cột: Content, Option1, Option2,
                    Option3, Option4, CorrectAnswer
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                  <Label htmlFor="isPublished" className="cursor-pointer">
                    Xuất bản ngay
                  </Label>
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
                  {isCreating ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Tạo Quizlet
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Quizlet</CardTitle>
          <CardDescription>{quizlets?.length || 0} quizlet</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải...
            </div>
          ) : quizlets && quizlets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Người tạo</TableHead>
                  <TableHead>Số câu hỏi</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizlets.map((quizlet) => (
                  <TableRow key={quizlet.id}>
                    <TableCell className="font-medium">
                      {quizlet.title}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {quizlet.description || "—"}
                    </TableCell>
                    <TableCell>{quizlet.userName}</TableCell>
                    <TableCell>{quizlet.questions.length}</TableCell>
                    <TableCell>
                      {quizlet.isPublished ? (
                        <Badge variant="default">Đã xuất bản</Badge>
                      ) : (
                        <Badge variant="secondary">Nháp</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(quizlet.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/teacher/quizlets/${quizlet.id}?data=${encodeURIComponent(JSON.stringify(quizlet))}`,
                            )
                          }
                        >
                          Xem
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/teacher/quizlets/${quizlet.id}/edit?data=${encodeURIComponent(JSON.stringify(quizlet))}`,
                            )
                          }
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDelete(quizlet.id, quizlet.title)
                          }
                        >
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                Chưa có quizlet nào
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Tạo quizlet đầu tiên bằng cách upload file Excel
              </p>
              <Button
                className="mt-4"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tạo Quizlet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa quizlet "{selectedQuizlet?.title}"? Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn tạo file Excel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Cấu trúc file Excel:</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Content</th>
                    <th className="text-left p-2">Option1</th>
                    <th className="text-left p-2">Option2</th>
                    <th className="text-left p-2">Option3</th>
                    <th className="text-left p-2">Option4</th>
                    <th className="text-left p-2">CorrectAnswer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">Thủ đô của Việt Nam là gì?</td>
                    <td className="p-2">Hà Nội</td>
                    <td className="p-2">Hồ Chí Minh</td>
                    <td className="p-2">Đà Nẵng</td>
                    <td className="p-2">Cần Thơ</td>
                    <td className="p-2">Hà Nội</td>
                  </tr>
                  <tr>
                    <td className="p-2">1 + 1 bằng mấy?</td>
                    <td className="p-2">1</td>
                    <td className="p-2">2</td>
                    <td className="p-2">3</td>
                    <td className="p-2">4</td>
                    <td className="p-2">2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Lưu ý:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>File phải có định dạng .xlsx (Excel 2007+)</li>
              <li>Dòng đầu tiên phải là header với tên cột chính xác</li>
              <li>Content, Option1, Option2, CorrectAnswer là bắt buộc</li>
              <li>Option3 và Option4 là tùy chọn</li>
              <li>
                CorrectAnswer phải khớp chính xác với một trong các Option
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
