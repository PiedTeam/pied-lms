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
  Search,
  Filter,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const { data: quizlets, isLoading } = useGetAllQuizlets();
  const { mutate: createQuizlet, isPending: isCreating } = useCreateQuizlet();
  const { mutate: togglePublish, isPending: isToggling } =
    useTogglePublishQuizlet();

  // Filter quizlets based on active tab, search query, and level filter
  const filteredQuizlets = quizlets?.filter((quizlet) => {
    // Filter by tab
    if (activeTab === "published" && !quizlet.isPublished) return false;
    if (activeTab === "unpublished" && quizlet.isPublished) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = quizlet.title.toLowerCase().includes(query);
      const matchesUserName = quizlet.userName?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesUserName) return false;
    }

    // Filter by level
    if (levelFilter !== "all") {
      if (quizlet.level.toString() !== levelFilter) return false;
    }

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
<<<<<<< HEAD
          title: "Lỗi",
          description: "Chỉ chấp nhận file Excel (.xlsx, .xls)",
=======
          title: "Error",
          description: "Only Excel files (.xlsx, .xls) are accepted",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề",
=======
        title: "Error",
        description: "Please enter a title",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
<<<<<<< HEAD
        title: "Lỗi",
        description: "Vui lòng chọn file Excel",
=======
        title: "Error",
        description: "Please select an Excel file",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
            title: "Thành công",
=======
            title: "Success",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
            title: "Thành công",
            description: !currentStatus
              ? "Đã xuất bản quizlet"
              : "Đã hủy xuất bản quizlet",
=======
            title: "Success",
            description: !currentStatus
              ? "Quizlet published"
              : "Quizlet unpublished",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          });
        },
        onError: (error: Error) => {
          toast({
<<<<<<< HEAD
            title: "Lỗi",
=======
            title: "Error",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            description: error.message,
            variant: "destructive",
          });
        },
      },
    );
  };

  const getLevelBadge = (level: QuizletLevel) => {
    // For Admin/Teacher/Mentor: ALWAYS show level badge regardless of isHidden
    // isHidden only affects Student UI
    switch (level) {
      case QuizletLevel.Easy:
<<<<<<< HEAD
        return <Badge className="bg-green-600">Dễ</Badge>;
      case QuizletLevel.Medium:
        return <Badge className="bg-yellow-600">Trung bình</Badge>;
      case QuizletLevel.Hard:
        return <Badge className="bg-red-600">Khó</Badge>;
=======
        return <Badge className="bg-green-600">Easy</Badge>;
      case QuizletLevel.Medium:
        return <Badge className="bg-yellow-600">Medium</Badge>;
      case QuizletLevel.Hard:
        return <Badge className="bg-red-600">Hard</Badge>;
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
      default:
        return <Badge variant="outline">Level {level}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
<<<<<<< HEAD
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Quizlet</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý các bộ câu hỏi từ file Excel
=======
          <h1 className="text-3xl font-bold tracking-tight">Quizlet Management</h1>
          <p className="text-muted-foreground">
            Create and manage question sets from Excel files
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
<<<<<<< HEAD
            Tải file mẫu
=======
            Download Template
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
<<<<<<< HEAD
                Tạo Quizlet
=======
                Create Quizlet
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
<<<<<<< HEAD
                  <DialogTitle>Tạo Quizlet mới</DialogTitle>
                  <DialogDescription>
                    Upload file Excel chứa câu hỏi. File phải có định dạng .xlsx
                    hoặc .xls
=======
                  <DialogTitle>Create New Quizlet</DialogTitle>
                  <DialogDescription>
                    Upload an Excel file containing questions. File must be .xlsx
                    or .xls format
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">
<<<<<<< HEAD
                      Tiêu đề <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Nhập tiêu đề quizlet"
=======
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter quizlet title"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">
<<<<<<< HEAD
                      Mô tả <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Nhập mô tả"
=======
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Enter description"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="level">
<<<<<<< HEAD
                      Độ khó <span className="text-red-500">*</span>
=======
                      Difficulty <span className="text-red-500">*</span>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    </Label>
                    <Select
                      value={level.toString()}
                      onValueChange={(value) =>
                        setLevel(parseInt(value) as QuizletLevel)
                      }
                    >
                      <SelectTrigger>
<<<<<<< HEAD
                        <SelectValue placeholder="Chọn độ khó" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Dễ</SelectItem>
                        <SelectItem value="2">Trung bình</SelectItem>
                        <SelectItem value="3">Khó</SelectItem>
=======
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Easy</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">Hard</SelectItem>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
                      File Excel phải có cấu trúc đúng theo file mẫu. Tải file
                      mẫu để xem cấu trúc.
=======
                      The Excel file must follow the template structure. Download
                      the template to see the structure.
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublished"
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                    />
                    <Label htmlFor="isPublished" className="cursor-pointer">
<<<<<<< HEAD
                      Xuất bản ngay
=======
                      Publish immediately
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isHidden"
                      checked={isHidden}
                      onCheckedChange={setIsHidden}
                    />
                    <Label htmlFor="isHidden" className="cursor-pointer">
<<<<<<< HEAD
                      Ẩn level (độ khó) của quizlet
=======
                      Hide quizlet difficulty level
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
                    Hủy
=======
                    Cancel
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 animate-spin" />
<<<<<<< HEAD
                        Đang tạo...
=======
                        Creating...
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
<<<<<<< HEAD
                        Tạo Quizlet
=======
                        Create Quizlet
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
          <CardTitle>Danh sách Quizlet</CardTitle>
=======
          <CardTitle>Quizlet List</CardTitle>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          <CardDescription>
            {filteredQuizlets?.length || 0} / {quizlets?.length || 0} quizlet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
<<<<<<< HEAD
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="published">Xuất bản</TabsTrigger>
              <TabsTrigger value="unpublished">Hủy xuất bản</TabsTrigger>
=======
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="unpublished">Unpublished</TabsTrigger>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </TabsList>

            <div className="flex items-center gap-4 mt-6 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
<<<<<<< HEAD
                  placeholder="Tìm kiếm theo tiêu đề hoặc người tạo..."
=======
                  placeholder="Search by title or creator..."
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[180px]">
<<<<<<< HEAD
                    <SelectValue placeholder="Độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả độ khó</SelectItem>
                    <SelectItem value="1">Dễ</SelectItem>
                    <SelectItem value="2">Trung bình</SelectItem>
                    <SelectItem value="3">Khó</SelectItem>
=======
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="1">Easy</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">Hard</SelectItem>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-0">
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
<<<<<<< HEAD
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Người tạo</TableHead>
                      <TableHead>Độ khó</TableHead>
                      <TableHead>Số câu hỏi</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
=======
                      <TableHead>Title</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
                              (Đã ẩn)
=======
                              (Hidden)
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{quizlet.userName || "—"}</TableCell>
                        <TableCell>{getLevelBadge(quizlet.level)}</TableCell>
                        <TableCell>{quizlet.quantityQuestion}</TableCell>
                        <TableCell>
                          {quizlet.isPublished ? (
<<<<<<< HEAD
                            <Badge variant="default">Đã xuất bản</Badge>
                          ) : (
                            <Badge variant="secondary">Nháp</Badge>
=======
                            <Badge variant="default">Published</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(quizlet.createdAt).toLocaleDateString(
<<<<<<< HEAD
                            "vi-VN",
=======
                            "en-US",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
                              title="Xem chi tiết"
=======
                              title="View details"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
                              title="Chỉnh sửa"
=======
                              title="Edit"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
                                ? "Hủy xuất bản"
                                : "Xuất bản"}
=======
                                ? "Unpublish"
                                : "Publish"}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
                    Chưa có quizlet nào
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {activeTab === "published"
                      ? "Chưa có quizlet nào được xuất bản"
                      : activeTab === "unpublished"
                        ? "Chưa có quizlet nào hủy xuất bản"
                        : "Tạo quizlet đầu tiên bằng cách upload file Excel"}
=======
                    No quizlets yet
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {activeTab === "published"
                      ? "No published quizlets yet"
                      : activeTab === "unpublished"
                        ? "No unpublished quizlets"
                        : "Create your first quizlet by uploading an Excel file"}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
<<<<<<< HEAD
                    Tạo Quizlet
=======
                    Create Quizlet
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
<<<<<<< HEAD
          <CardTitle>Hướng dẫn tạo file Excel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Cấu trúc file Excel:</h4>
            <p className="text-sm text-muted-foreground mb-3">
              File Excel phải có các cột sau (theo thứ tự):
=======
          <CardTitle>Excel File Creation Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Excel File Structure:</h4>
            <p className="text-sm text-muted-foreground mb-3">
              The Excel file must have the following columns (in order):
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </p>
            <div className="bg-muted p-4 rounded-lg text-sm">
              <ul className="space-y-2">
                <li>
<<<<<<< HEAD
                  <span className="font-medium">Content:</span> Nội dung câu hỏi
=======
                  <span className="font-medium">Content:</span> Question content
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                </li>
                <li>
                  <span className="font-medium">
                    Option1, Option2, Option3, Option4:
                  </span>{" "}
<<<<<<< HEAD
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
=======
                  Answer choices (minimum 2 answers)
                </li>
                <li>
                  <span className="font-medium">CorrectAnswer:</span> Correct
                  answer (e.g. "Ha Noi" or "2" for multiple answers)
                </li>
                <li>
                  <span className="font-medium">IsHidden:</span> TRUE/FALSE -
                  hide/show the difficulty level of the question
                </li>
                <li>
                  <span className="font-medium">Level:</span> 1 = Easy, 2 = Medium,
                  3 = Hard
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
<<<<<<< HEAD
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
=======
            <h4 className="font-medium">Notes:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>File must be .xlsx or .xls format</li>
              <li>First row must be column headers</li>
              <li>
                Correct answer must exactly match one of the Options (case
                sensitive)
              </li>
              <li>
                For multiple correct answers, separate with commas (e.g. "2,3")
              </li>
              <li>
                IsHidden: TRUE to hide difficulty level of question, FALSE to
                show level
              </li>
              <li>Download the template to see detailed structure and examples</li>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </ul>
          </div>

          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
<<<<<<< HEAD
            Tải file mẫu Excel
=======
            Download Sample Excel File
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
