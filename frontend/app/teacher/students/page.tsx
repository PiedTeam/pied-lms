"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetAllStudents } from "@/services";

export default function TeacherStudentsPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 10;

  const { data: studentsData, isLoading } = useGetAllStudents({
    pageNumber,
    pageSize,
  });

  const totalPages = studentsData
    ? Math.ceil(studentsData.totalCount / pageSize)
    : 0;

  const filteredStudents =
    studentsData?.items.filter(
      (student) =>
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${student.firstName} ${student.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    ) || [];

  const formatDateTime = (dateString: string | null) => {
<<<<<<< HEAD
    if (!dateString) return "Chưa đăng nhập";
    return new Date(dateString).toLocaleString("vi-VN", {
=======
    if (!dateString) return "Never logged in";
    return new Date(dateString).toLocaleString("en-US", {
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
<<<<<<< HEAD
          Danh sách học sinh
        </h1>
        <p className="text-muted-foreground">
          Quản lý và xem thông tin học sinh trong hệ thống
=======
          Student List
        </h1>
        <p className="text-muted-foreground">
          Manage and view student information in the system
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
<<<<<<< HEAD
            <CardTitle>Học sinh</CardTitle>
=======
            <CardTitle>Students</CardTitle>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
<<<<<<< HEAD
                  placeholder="Tìm kiếm theo tên hoặc email..."
=======
                  placeholder="Search by name or email..."
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[300px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-muted animate-pulse rounded-md"
                />
              ))}
            </div>
          ) : !studentsData?.items.length ? (
            <div className="text-center py-8 text-muted-foreground">
<<<<<<< HEAD
              Không có học sinh nào trong hệ thống
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy học sinh phù hợp
=======
              No students found in the system
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No matching students found
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
<<<<<<< HEAD
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Đăng nhập lần cuối</TableHead>
=======
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
<<<<<<< HEAD
                        <Badge variant="outline">{student.role}</Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(student.createdAt)}</TableCell>
                      <TableCell>{formatDateTime(student.lastLogin)}</TableCell>
=======
                        <Badge variant="outline">
                          {student.roles[0] || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={student.isActive ? "default" : "secondary"}
                        >
                          {student.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(student.createdAt)}</TableCell>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
<<<<<<< HEAD
                    Trang {pageNumber} / {totalPages} - Tổng:{" "}
=======
                    Page {pageNumber} / {totalPages} - Total:{" "}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    {studentsData.totalCount}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                      disabled={pageNumber === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPageNumber((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={pageNumber === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
