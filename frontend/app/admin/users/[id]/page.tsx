"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, User, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetUserById } from "@/service";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: user, isLoading, error } = useGetUserById(userId);

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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
<<<<<<< HEAD
        <div className="text-center py-12">Đang tải...</div>
=======
        <div className="text-center py-12">Loading...</div>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-destructive">
<<<<<<< HEAD
                {(error as Error)?.message || "Không tìm thấy người dùng"}
=======
                {(error as Error)?.message || "User not found"}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push("/admin/users")}
              >
<<<<<<< HEAD
                Quay lại
=======
                Go back
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/users")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
<<<<<<< HEAD
            Chi tiết người dùng
          </h1>
          <p className="text-muted-foreground">
            Thông tin chi tiết về người dùng
=======
            User Details
          </h1>
          <p className="text-muted-foreground">
            Detailed information about the user
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
<<<<<<< HEAD
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>ID: {user.id}</CardDescription>
            </div>
            <Badge variant={getRoleBadgeVariant(user.role)} className="text-sm">
              {user.role}
=======
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>ID: {user.id}</CardDescription>
            </div>
            <Badge
              variant={getRoleBadgeVariant(user.roles)}
              className="text-sm"
            >
              {user.roles.join(", ")}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-base">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
<<<<<<< HEAD
                  Họ tên
=======
                  Full Name
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                </p>
                <p className="text-base">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
<<<<<<< HEAD
                  Ngày tạo
                </p>
                <p className="text-base">
                  {new Date(user.createdAt).toLocaleString("vi-VN")}
=======
                  Created At
                </p>
                <p className="text-base">
                  {new Date(user.createdAt).toLocaleString("en-US")}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
<<<<<<< HEAD
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Đăng nhập cuối
                </p>
                <p className="text-base">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString("vi-VN")
                    : "Chưa đăng nhập"}
                </p>
              </div>
=======
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
