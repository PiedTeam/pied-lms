"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllUsers } from "@/service";

export default function UsersPage() {
  const router = useRouter();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: usersData, isLoading } = useGetAllUsers({
    pageNumber,
    pageSize,
  });

  const filteredUsers = usersData?.items.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

<<<<<<< HEAD
  const getRoleBadgeVariant = (role: string) => {
=======
  // Calculate total pages
  const totalPages = usersData?.totalCount
    ? Math.ceil(usersData.totalCount / pageSize)
    : 1;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý người dùng
          </h1>
          <p className="text-muted-foreground">
            Xem danh sách người dùng trong hệ thống
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>
                {usersData?.totalCount || 0} người dùng
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải...
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Ngày tạo</TableHead>
<<<<<<< HEAD
                    <TableHead>Đăng nhập cuối</TableHead>
=======
                    <TableHead>Trạng thái</TableHead>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>
<<<<<<< HEAD
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
=======
                        <Badge variant={getRoleBadgeVariant(user.roles)}>
                          {user.roles[0] || "N/A"}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
<<<<<<< HEAD
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString("vi-VN")
                          : "Chưa đăng nhập"}
=======
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                        >
                          {user.isActive ? "Hoạt động" : "Không hoạt động"}
                        </Badge>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/teacher/users/${user.id}`)
                          }
                        >
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Hiển thị
                  </span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setPageNumber(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    trên trang
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPageNumber((prev) => Math.max(1, prev - 1))
                    }
                    disabled={pageNumber === 1}
                  >
<<<<<<< HEAD
                    Trước
                  </Button>
                  <span className="text-sm">
                    Trang {pageNumber} / {usersData?.totalPages || 1}
=======
                    &lt;
                  </Button>
                  <span className="text-sm">
                    Trang {pageNumber} / {totalPages}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber((prev) => prev + 1)}
<<<<<<< HEAD
                    disabled={pageNumber >= (usersData?.totalPages || 1)}
                  >
                    Sau
=======
                    disabled={pageNumber >= totalPages}
                  >
                    &gt;
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                Không tìm thấy người dùng
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Chưa có người dùng nào trong hệ thống"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
