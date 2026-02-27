"use client";

import { useState } from "react";
import {
  Upload,
  UserCheck,
  Download,
  Copy,
  Check,
  Search,
  Plus,
  Trash2,
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

  const { data: usersData, isError } = useGetAllUsers({
    pageNumber: 1,
    pageSize: 100,
  });
  const { mutate: importStudents, isPending: isImporting } =
    useImportStudents();
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

    toast({ title: "Success", description: "Template file downloaded" });
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
          title: "Error",
          description: "Only Excel files (.xlsx, .xls) are accepted",
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
        title: "Error",
        description: "Please select a file",
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
          title: "Error",
          description: "Excel file has no data",
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
          title: "Error",
          description:
            "Excel file has rows with missing information (Email, FirstName, LastName)",
          variant: "destructive",
        });
        return;
      }

      importStudents(
        { students },
        {
          onSuccess: (response) => {
            toast({
              title: "Success",
              description:
                response.message || ADMIN_MESSAGES.SUCCESS.STUDENTS_IMPORTED,
            });
            toast({
              title: "Emails sent",
              description:
                "Each student will receive an email with a link to set their password.",
            });
            setIsImportDialogOpen(false);
            setFile(null);
          },
          onError: (error: Error) => {
            toast({
              title: "Error",
              description:
                error.message || ADMIN_MESSAGES.ERROR.IMPORT_STUDENTS_FAILED,
              variant: "destructive",
            });
          },
        },
      );
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Unable to read Excel file. Please check the file format.",
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
        title: "Error",
        description: "Please enter at least one student",
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
          toast({
            title: "Email đã được gửi",
            description:
              "Mỗi học sinh sẽ nhận được email với link để đặt mật khẩu.",
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
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied", description: "User ID copied to clipboard" });
  };

  const handleSelectUser = (id: string) => {
    setMentorUserId(id);
  };

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorUserId.trim()) {
      toast({
        title: "Error",
        description: "Please enter User ID",
        variant: "destructive",
      });
      return;
    }

    approveMentor(mentorUserId, {
      onSuccess: (response) => {
        toast({
          title: "Success",
          description:
            response.message || ADMIN_MESSAGES.SUCCESS.MENTOR_APPROVED,
        });
        setIsApproveDialogOpen(false);
        setMentorUserId("");
        setSearchQuery("");
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description:
            error.message || ADMIN_MESSAGES.ERROR.APPROVE_MENTOR_FAILED,
          variant: "destructive",
        });
      },
    });
  };

  const getRoleBadgeVariant = (roles: string[]) => {
    const role = roles[0] || "";
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
        <h1 className="text-3xl font-bold tracking-tight">Admin Tools</h1>
        <p className="text-muted-foreground">
          Tools for administrators
        </p>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="students">
            <UserPlus className="mr-2 h-4 w-4" />
            Import Students
          </TabsTrigger>
          <TabsTrigger value="mentor">
            <UserCheck className="mr-2 h-4 w-4" />
            Approve Mentor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Student List</CardTitle>
              <CardDescription>
                Import students via Excel file or manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Dialog
                  open={isImportDialogOpen}
                  onOpenChange={setIsImportDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Upload className="mr-2 h-5 w-5" />
                      Import from Excel
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleImportSubmit}>
                      <DialogHeader>
                        <DialogTitle>Import from Excel File</DialogTitle>
                        <DialogDescription>
                          Upload an Excel file containing student information
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
                            Accepts Excel files (.xlsx, .xls)
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
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isImporting}>
                          {isImporting ? (
                            <>
                              <Upload className="mr-2 h-4 w-4 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Import Students
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
                      Manual Import
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <form onSubmit={handleManualSubmit}>
                      <DialogHeader>
                        <DialogTitle>Manual Import</DialogTitle>
                        <DialogDescription>
                          Enter student information directly
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
                                  First Name <span className="text-red-500">*</span>
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
                                  Last Name <span className="text-red-500">*</span>
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
                          Add Student
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
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isImporting}>
                          {isImporting ? (
                            <>
                              <Upload className="mr-2 h-4 w-4 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            <>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Import Students
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Sample Excel File
                </Button>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="text-sm font-medium">Excel File Structure:</h4>
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
              <CardTitle>Approve Mentor</CardTitle>
              <CardDescription>
                Approve a user to become a Mentor
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
                    Approve Mentor
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
                  <form onSubmit={handleApproveSubmit}>
                    <DialogHeader>
                      <DialogTitle>Approve Mentor</DialogTitle>
                      <DialogDescription>
                        Select a user from the list or enter User ID
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="userId">
                          User ID <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="userId"
                          placeholder="Enter User ID (UUID)"
                          value={mentorUserId}
                          onChange={(e) => setMentorUserId(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>User List</Label>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search..."
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
                                <TableHead>Full Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">
                                  Actions
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
                                    Could not load user list
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
                                        variant={getRoleBadgeVariant(
                                          user.roles,
                                        )}
                                        className="text-xs"
                                      >
                                        {user.roles[0] || "N/A"}
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
                                          Select
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
                                    No users found
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
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isApproving}>
                        {isApproving ? (
                          <>
                            <UserCheck className="mr-2 h-4 w-4 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Approve
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="mt-4 bg-muted p-4 rounded-lg space-y-2">
                <h4 className="text-sm font-medium">Instructions:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Select a user from the list</li>
                  <li>Or copy the User ID using the Copy icon</li>
                  <li>Then click Approve to confirm</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
