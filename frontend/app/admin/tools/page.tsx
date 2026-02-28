"use client";

import { useState } from "react";
import {
<<<<<<< HEAD
  Upload,
=======
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
  UserCheck,
  Download,
  Copy,
  Check,
  Search,
<<<<<<< HEAD
  Plus,
  Trash2,
=======
  Upload,
  Plus,
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
  UserPlus,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
<<<<<<< HEAD
import { useImportStudents, useApproveMentor, useGetAllUsers } from "@/service";
import { ADMIN_MESSAGES } from "@/constants/messages.constants";
import * as XLSX from "xlsx";
import type { StudentImportDto } from "@/interface/admin/admin.interface";

export default function AdminToolsPage() {
  const { toast } = useToast();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [mentorUserId, setMentorUserId] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualStudents, setManualStudents] = useState<StudentImportDto[]>([
    { email: "", firstName: "", lastName: "" },
  ]);
=======
import { useApproveMentor, useGetAllUsers } from "@/service";
import { ADMIN_MESSAGES } from "@/constants/messages";
import * as XLSX from "xlsx";
import { ExcelImportInlineForm } from "@/components/admin/ExcelImportInlineForm";
import { ManualImportInlineForm } from "@/components/admin/ManualImportInlineForm";

export default function AdminToolsPage() {
  const { toast } = useToast();
  const [showExcelForm, setShowExcelForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [mentorUserId, setMentorUserId] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd

  const { data: usersData, isError } = useGetAllUsers({
    pageNumber: 1,
    pageSize: 100,
  });
<<<<<<< HEAD
  const { mutate: importStudents, isPending: isImporting } =
    useImportStudents();
=======
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
  const { mutate: approveMentor, isPending: isApproving } = useApproveMentor();

  const filteredUsers =
    usersData?.items.filter(
      (user) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const handleDownloadTemplate = () => {
    const sampleData = [
      { Email: "student1@example.com", FirstName: "Nguyen Van", LastName: "A" },
      { Email: "student2@example.com", FirstName: "Tran Thi", LastName: "B" },
      { Email: "student3@example.com", FirstName: "Le Van", LastName: "C" },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_import_template.xlsx");

<<<<<<< HEAD
    toast({ title: "Thành công", description: "Đã tải xuống file mẫu" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validExtensions = [".xlsx", ".xls"];
      const fileExtension = selectedFile.name
        .substring(selectedFile.name.lastIndexOf("."))
        .toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
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

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(fileBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<{
        Email: string;
        FirstName: string;
        LastName: string;
      }>(worksheet);

      if (jsonData.length === 0) {
        toast({
          title: "Lỗi",
          description: "File Excel không có dữ liệu",
          variant: "destructive",
        });
        return;
      }

      const students = jsonData.map((row) => ({
        email: row.Email,
        firstName: row.FirstName,
        lastName: row.LastName,
      }));

      const invalidRows = students.filter(
        (s) => !s.email || !s.firstName || !s.lastName,
      );
      if (invalidRows.length > 0) {
        toast({
          title: "Lỗi",
          description:
            "File Excel có dòng thiếu thông tin (Email, FirstName, LastName)",
          variant: "destructive",
        });
        return;
      }

      importStudents(
        { students },
        {
          onSuccess: (response) => {
            toast({
              title: "Thành công",
              description:
                response.message || ADMIN_MESSAGES.SUCCESS.STUDENTS_IMPORTED,
            });
            setIsImportDialogOpen(false);
            setFile(null);
          },
          onError: (error: Error) => {
            toast({
              title: "Lỗi",
              description:
                error.message || ADMIN_MESSAGES.ERROR.IMPORT_STUDENTS_FAILED,
              variant: "destructive",
            });
          },
        },
      );
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          "Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.",
        variant: "destructive",
      });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validStudents = manualStudents.filter(
      (s) => s.email && s.firstName && s.lastName,
    );

    if (validStudents.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập ít nhất một sinh viên",
        variant: "destructive",
      });
      return;
    }

    importStudents(
      { students: validStudents },
      {
        onSuccess: (response) => {
          toast({
            title: "Thành công",
            description:
              response.message || ADMIN_MESSAGES.SUCCESS.STUDENTS_IMPORTED,
          });
          setIsManualDialogOpen(false);
          setManualStudents([{ email: "", firstName: "", lastName: "" }]);
        },
        onError: (error: Error) => {
          toast({
            title: "Lỗi",
            description:
              error.message || ADMIN_MESSAGES.ERROR.IMPORT_STUDENTS_FAILED,
            variant: "destructive",
          });
        },
      },
    );
  };

  const addManualStudent = () => {
    setManualStudents([
      ...manualStudents,
      { email: "", firstName: "", lastName: "" },
    ]);
  };

  const removeManualStudent = (index: number) => {
    if (manualStudents.length > 1) {
      setManualStudents(manualStudents.filter((_, i) => i !== index));
    }
  };

  const updateManualStudent = (
    index: number,
    field: keyof StudentImportDto,
    value: string,
  ) => {
    const updated = [...manualStudents];
    updated[index][field] = value;
    setManualStudents(updated);
=======
    toast({ title: "Success", description: "Template file downloaded" });
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
<<<<<<< HEAD
    toast({ title: "Đã sao chép", description: "User ID đã được sao chép" });
=======
    toast({ title: "Copied", description: "User ID copied to clipboard" });
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
  };

  const handleSelectUser = (id: string) => {
    setMentorUserId(id);
  };

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorUserId.trim()) {
      toast({
<<<<<<< HEAD
        title: "Lỗi",
        description: "Vui lòng nhập User ID",
=======
        title: "Error",
        description: "Please enter User ID",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        variant: "destructive",
      });
      return;
    }

    approveMentor(mentorUserId, {
      onSuccess: (response) => {
        toast({
<<<<<<< HEAD
          title: "Thành công",
=======
          title: "Success",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          description:
            response.message || ADMIN_MESSAGES.SUCCESS.MENTOR_APPROVED,
        });
        setIsApproveDialogOpen(false);
        setMentorUserId("");
        setSearchQuery("");
      },
      onError: (error: Error) => {
        toast({
<<<<<<< HEAD
          title: "Lỗi",
=======
          title: "Error",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          description:
            error.message || ADMIN_MESSAGES.ERROR.APPROVE_MENTOR_FAILED,
          variant: "destructive",
        });
      },
    });
  };

<<<<<<< HEAD
  const getRoleBadgeVariant = (role: string) => {
=======
  const getRoleBadgeVariant = (roles: string[]) => {
    const role = roles[0] || "";
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
    switch (role) {
      case "Admin":
        return "destructive";
      case "Teacher":
        return "default";
      case "Mentor":
        return "secondary";
      case "Student":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
<<<<<<< HEAD
        <h1 className="text-3xl font-bold tracking-tight">Công cụ quản trị</h1>
        <p className="text-muted-foreground">
          Các công cụ dành cho quản trị viên
        </p>
=======
        <h1 className="text-3xl font-bold tracking-tight">Admin Tools</h1>
        <p className="text-muted-foreground">Tools for administrators</p>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="students">
            <UserPlus className="mr-2 h-4 w-4" />
<<<<<<< HEAD
            Nhập sinh viên
          </TabsTrigger>
          <TabsTrigger value="mentor">
            <UserCheck className="mr-2 h-4 w-4" />
            Phê duyệt Mentor
=======
            Import Students
          </TabsTrigger>
          <TabsTrigger value="mentor">
            <UserCheck className="mr-2 h-4 w-4" />
            Approve Mentor
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
<<<<<<< HEAD
              <CardTitle>Nhập danh sách sinh viên</CardTitle>
              <CardDescription>
                Nhập sinh viên bằng file Excel hoặc nhập thủ công
=======
              <CardTitle>Import Student List</CardTitle>
              <CardDescription>
                Import students via Excel file or manually
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
<<<<<<< HEAD
                <Dialog
                  open={isImportDialogOpen}
                  onOpenChange={setIsImportDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Upload className="mr-2 h-5 w-5" />
                      Nhập từ Excel
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleImportSubmit}>
                      <DialogHeader>
                        <DialogTitle>Nhập từ file Excel</DialogTitle>
                        <DialogDescription>
                          Upload file Excel chứa thông tin sinh viên
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="file">
                            File <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="file"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Chấp nhận file Excel (.xlsx, .xls)
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsImportDialogOpen(false)}
                          disabled={isImporting}
                        >
                          Hủy
                        </Button>
                        <Button type="submit" disabled={isImporting}>
                          {isImporting ? (
                            <>
                              <Upload className="mr-2 h-4 w-4 animate-spin" />
                              Đang nhập...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Nhập sinh viên
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={isManualDialogOpen}
                  onOpenChange={setIsManualDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg" variant="outline">
                      <Plus className="mr-2 h-5 w-5" />
                      Nhập thủ công
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <form onSubmit={handleManualSubmit}>
                      <DialogHeader>
                        <DialogTitle>Nhập thủ công</DialogTitle>
                        <DialogDescription>
                          Nhập thông tin sinh viên trực tiếp
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {manualStudents.map((student, index) => (
                          <div
                            key={index}
                            className="grid gap-3 p-4 border rounded-lg relative"
                          >
                            {manualStudents.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6"
                                onClick={() => removeManualStudent(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            <div className="grid gap-2">
                              <Label htmlFor={`email-${index}`}>
                                Email <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`email-${index}`}
                                type="email"
                                placeholder="student@example.com"
                                value={student.email}
                                onChange={(e) =>
                                  updateManualStudent(
                                    index,
                                    "email",
                                    e.target.value,
                                  )
                                }
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="grid gap-2">
                                <Label htmlFor={`firstName-${index}`}>
                                  Họ <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`firstName-${index}`}
                                  placeholder="Nguyen Van"
                                  value={student.firstName}
                                  onChange={(e) =>
                                    updateManualStudent(
                                      index,
                                      "firstName",
                                      e.target.value,
                                    )
                                  }
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`lastName-${index}`}>
                                  Tên <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`lastName-${index}`}
                                  placeholder="A"
                                  value={student.lastName}
                                  onChange={(e) =>
                                    updateManualStudent(
                                      index,
                                      "lastName",
                                      e.target.value,
                                    )
                                  }
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addManualStudent}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Thêm sinh viên
                        </Button>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsManualDialogOpen(false);
                            setManualStudents([
                              { email: "", firstName: "", lastName: "" },
                            ]);
                          }}
                          disabled={isImporting}
                        >
                          Hủy
                        </Button>
                        <Button type="submit" disabled={isImporting}>
                          {isImporting ? (
                            <>
                              <Upload className="mr-2 h-4 w-4 animate-spin" />
                              Đang nhập...
                            </>
                          ) : (
                            <>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Nhập sinh viên
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
=======
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setShowExcelForm(true)}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Import from Excel
                </Button>

                <Button
                  className="w-full"
                  size="lg"
                  variant="outline"
                  onClick={() => setShowManualForm(true)}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Manual Import
                </Button>
              </div>

              {/* Form Container - NEW */}
              <div className="space-y-4 mt-4">
                {showExcelForm && (
                  <ExcelImportInlineForm
                    onClose={() => setShowExcelForm(false)}
                    onSuccess={() => setShowExcelForm(false)}
                  />
                )}
                {showManualForm && (
                  <ManualImportInlineForm
                    onClose={() => setShowManualForm(false)}
                    onSuccess={() => setShowManualForm(false)}
                  />
                )}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              </div>

              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="mr-2 h-4 w-4" />
<<<<<<< HEAD
                  Tải file Excel mẫu
                </Button>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="text-sm font-medium">Cấu trúc file Excel:</h4>
=======
                  Download Sample Excel File
                </Button>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="text-sm font-medium">Excel File Structure:</h4>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  <div className="bg-background p-3 rounded text-xs font-mono">
                    <div className="grid grid-cols-3 gap-2 font-semibold border-b pb-2 mb-2">
                      <div>Email</div>
                      <div>FirstName</div>
                      <div>LastName</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <div>student@example.com</div>
                      <div>Nguyen Van</div>
                      <div>A</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentor" className="space-y-4">
          <Card>
            <CardHeader>
<<<<<<< HEAD
              <CardTitle>Phê duyệt Mentor</CardTitle>
              <CardDescription>
                Phê duyệt người dùng trở thành Mentor
=======
              <CardTitle>Approve Mentor</CardTitle>
              <CardDescription>
                Approve a user to become a Mentor
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog
                open={isApproveDialogOpen}
                onOpenChange={setIsApproveDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg">
                    <UserCheck className="mr-2 h-5 w-5" />
<<<<<<< HEAD
                    Phê duyệt Mentor
=======
                    Approve Mentor
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
                  <form onSubmit={handleApproveSubmit}>
                    <DialogHeader>
<<<<<<< HEAD
                      <DialogTitle>Phê duyệt Mentor</DialogTitle>
                      <DialogDescription>
                        Chọn người dùng từ danh sách hoặc nhập User ID
=======
                      <DialogTitle>Approve Mentor</DialogTitle>
                      <DialogDescription>
                        Select a user from the list or enter User ID
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="userId">
                          User ID <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="userId"
<<<<<<< HEAD
                          placeholder="Nhập User ID (UUID)"
=======
                          placeholder="Enter User ID (UUID)"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                          value={mentorUserId}
                          onChange={(e) => setMentorUserId(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
<<<<<<< HEAD
                        <Label>Danh sách người dùng</Label>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Tìm kiếm..."
=======
                        <Label>User List</Label>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search..."
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                        <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Email</TableHead>
<<<<<<< HEAD
                                <TableHead>Họ tên</TableHead>
                                <TableHead>Vai trò</TableHead>
                                <TableHead className="text-right">
                                  Thao tác
=======
                                <TableHead>Full Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">
                                  Actions
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {isError ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center py-4 text-destructive"
                                  >
<<<<<<< HEAD
                                    Không thể tải danh sách người dùng
=======
                                    Could not load user list
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                  </TableCell>
                                </TableRow>
                              ) : filteredUsers && filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                  <TableRow key={user.id}>
                                    <TableCell className="font-medium text-xs">
                                      {user.email}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {user.firstName} {user.lastName}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
<<<<<<< HEAD
                                        variant={getRoleBadgeVariant(user.role)}
                                        className="text-xs"
                                      >
                                        {user.role}
=======
                                        variant={getRoleBadgeVariant(
                                          user.roles,
                                        )}
                                        className="text-xs"
                                      >
                                        {user.roles[0] || "N/A"}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleSelectUser(user.id)
                                          }
                                        >
<<<<<<< HEAD
                                          Chọn
=======
                                          Select
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleCopyId(user.id)}
                                        >
                                          {copiedId === user.id ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center py-4"
                                  >
<<<<<<< HEAD
                                    Không tìm thấy người dùng
=======
                                    No users found
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsApproveDialogOpen(false);
                          setSearchQuery("");
                        }}
                        disabled={isApproving}
                      >
<<<<<<< HEAD
                        Hủy
=======
                        Cancel
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                      </Button>
                      <Button type="submit" disabled={isApproving}>
                        {isApproving ? (
                          <>
                            <UserCheck className="mr-2 h-4 w-4 animate-spin" />
<<<<<<< HEAD
                            Đang phê duyệt...
=======
                            Approving...
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
<<<<<<< HEAD
                            Phê duyệt
=======
                            Approve
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="mt-4 bg-muted p-4 rounded-lg space-y-2">
<<<<<<< HEAD
                <h4 className="text-sm font-medium">Hướng dẫn:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Chọn người dùng từ danh sách</li>
                  <li>Hoặc sao chép User ID bằng icon Copy</li>
                  <li>Sau đó nhấn Phê duyệt để xác nhận</li>
=======
                <h4 className="text-sm font-medium">Instructions:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Select a user from the list</li>
                  <li>Or copy the User ID using the Copy icon</li>
                  <li>Then click Approve to confirm</li>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
