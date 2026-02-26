"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileJson,
  Plus,
  Eye,
  Pencil,
  Download,
  FileSpreadsheet,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import {
  useGetAllQuizlets,
  useCreateQuizlet,
  useTogglePublishQuizlet,
} from "@/service";
import { QuizletLevel } from "@/interface/quizlet/quizlet.interface";

interface QuizletsListProps {
  role: "admin" | "teacher" | "mentor";
}

export function QuizletsList({ role }: QuizletsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [level, setLevel] = useState<QuizletLevel>(QuizletLevel.Easy);
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const { data: quizlets, isLoading } = useGetAllQuizlets();
  const { mutate: createQuizlet, isPending: isCreating } = useCreateQuizlet();
  const { mutate: togglePublish, isPending: isToggling } =
    useTogglePublishQuizlet();

  // Filter quizlets based on active tab
  const filteredQuizlets = quizlets?.filter((quizlet) => {
    if (activeTab === "all") return true;
    if (activeTab === "published") return quizlet.isPublished;
    if (activeTab === "unpublished") return !quizlet.isPublished;
    return true;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validExtensions = [".xlsx", ".xls"];
      const isValid = validExtensions.some((ext) =>
        selectedFile.name.toLowerCase().endsWith(ext),
      );
      if (!isValid) {
        toast({
          title: "Lỗi",
          description: "Chỉ chấp nhận file Excel (.xlsx, .xls)",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDownloadTemplate = () => {
    // Download the template file from public folder
    const link = document.createElement("a");
    link.href = "/templates/quiz_data_with_fields.xlsx";
    link.download = "quiz_template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        isHidden,
        level,
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
          setIsHidden(false);
          setLevel(QuizletLevel.Easy);
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

  const handleTogglePublish = (id: number, currentStatus: boolean) => {
    togglePublish(
      { id, isPublished: !currentStatus },
      {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: !currentStatus
              ? "Đã xuất bản quizlet"
              : "Đã hủy xuất bản quizlet",
          });
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

  const getLevelBadge = (level: QuizletLevel) => {
    switch (level) {
      case QuizletLevel.Easy:
        return <Badge className="bg-green-600">Dễ</Badge>;
      case QuizletLevel.Medium:
        return <Badge className="bg-yellow-600">Trung bình</Badge>;
      case QuizletLevel.Hard:
        return <Badge className="bg-red-600">Khó</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
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

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Tải file mẫu
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
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
                    hoặc .xls
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
                    <Label htmlFor="description">
                      Mô tả <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Nhập mô tả"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="level">
                      Độ khó <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={level.toString()}
                      onValueChange={(value) =>
                        setLevel(parseInt(value) as QuizletLevel)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn độ khó" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Dễ</SelectItem>
                        <SelectItem value="2">Trung bình</SelectItem>
                        <SelectItem value="3">Khó</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="file">
                      File Excel <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="file"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        required
                      />
                      <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      File Excel phải có cấu trúc đúng theo file mẫu. Tải file
                      mẫu để xem cấu trúc.
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

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isHidden"
                      checked={isHidden}
                      onCheckedChange={setIsHidden}
                    />
                    <Label htmlFor="isHidden" className="cursor-pointer">
                      Ẩn level (độ khó) của quizlet
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Quizlet</CardTitle>
          <CardDescription>{quizlets?.length || 0} quizlet</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="published">Xuất bản</TabsTrigger>
              <TabsTrigger value="unpublished">Hủy xuất bản</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 animate-pulse"
                    >
                      <div className="h-12 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : filteredQuizlets && filteredQuizlets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Người tạo</TableHead>
                      <TableHead>Độ khó</TableHead>
                      <TableHead>Số câu hỏi</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuizlets.map((quizlet) => (
                      <TableRow
                        key={quizlet.id}
                        className={quizlet.isHidden ? "opacity-60" : ""}
                      >
                        <TableCell className="font-medium">
                          {quizlet.title}
                          {quizlet.isHidden && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (Đã ẩn)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{quizlet.userName || "—"}</TableCell>
                        <TableCell>{getLevelBadge(quizlet.level)}</TableCell>
                        <TableCell>{quizlet.quantityQuestion}</TableCell>
                        <TableCell>
                          {quizlet.isPublished ? (
                            <Badge variant="default">Đã xuất bản</Badge>
                          ) : (
                            <Badge variant="secondary">Nháp</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(quizlet.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/${role}/quizlets/${quizlet.id}`)
                              }
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(
                                  `/${role}/quizlets/${quizlet.id}/edit`,
                                )
                              }
                              title="Chỉnh sửa"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={
                                quizlet.isPublished ? "secondary" : "default"
                              }
                              size="sm"
                              onClick={() =>
                                handleTogglePublish(
                                  quizlet.id,
                                  quizlet.isPublished,
                                )
                              }
                              disabled={isToggling}
                            >
                              {quizlet.isPublished
                                ? "Hủy xuất bản"
                                : "Xuất bản"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <FileJson className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    Chưa có quizlet nào
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {activeTab === "published"
                      ? "Chưa có quizlet nào được xuất bản"
                      : activeTab === "unpublished"
                        ? "Chưa có quizlet nào hủy xuất bản"
                        : "Tạo quizlet đầu tiên bằng cách upload file Excel"}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn tạo file Excel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Cấu trúc file Excel:</h4>
            <p className="text-sm text-muted-foreground mb-3">
              File Excel phải có các cột sau (theo thứ tự):
            </p>
            <div className="bg-muted p-4 rounded-lg text-sm">
              <ul className="space-y-2">
                <li>
                  <span className="font-medium">Content:</span> Nội dung câu hỏi
                </li>
                <li>
                  <span className="font-medium">
                    Option1, Option2, Option3, Option4:
                  </span>{" "}
                  Các đáp án (tối thiểu 2 đáp án)
                </li>
                <li>
                  <span className="font-medium">CorrectAnswer:</span> Đáp án
                  đúng (ví dụ: "Ha Noi" hoặc "2" cho nhiều đáp án)
                </li>
                <li>
                  <span className="font-medium">IsHidden:</span> TRUE/FALSE -
                  ẩn/hiện level (độ khó) của câu hỏi
                </li>
                <li>
                  <span className="font-medium">Level:</span> 1 = Dễ, 2 = Trung
                  bình, 3 = Khó
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Lưu ý:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>File phải có định dạng .xlsx hoặc .xls</li>
              <li>Dòng đầu tiên là tiêu đề các cột</li>
              <li>
                Đáp án đúng phải khớp chính xác với một trong các Option (phân
                biệt hoa thường)
              </li>
              <li>
                Nếu có nhiều đáp án đúng, phân cách bằng dấu phẩy (ví dụ: "2,3")
              </li>
              <li>
                IsHidden: TRUE để ẩn level (độ khó) của câu hỏi, FALSE để hiển
                thị level
              </li>
              <li>Tải file mẫu để xem cấu trúc chi tiết và ví dụ</li>
            </ul>
          </div>

          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Tải file mẫu Excel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
