"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Info } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Đặt lại mật khẩu</CardTitle>
          <CardDescription>Tính năng này đang được phát triển</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Thông báo</AlertTitle>
            <AlertDescription>
              API reset password chưa được triển khai ở backend. Vui lòng liên
              hệ quản trị viên để được hỗ trợ đặt lại mật khẩu.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email của bạn</Label>
              <Input value={email} disabled className="bg-muted" />
            </div>

            <div className="rounded-lg border border-muted bg-muted/50 p-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Token nhận được:
              </p>
              <p className="text-xs font-mono break-all text-muted-foreground">
                {token ? token.substring(0, 80) + "..." : "Không có token"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Token này là ASP.NET Identity Password Reset Token, được mã hóa
                và có thời hạn 1 ngày.
              </p>
            </div>

            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">
                Thông tin kỹ thuật
              </AlertTitle>
              <AlertDescription className="text-blue-800 text-xs">
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Backend đã tạo token và gửi email thành công</li>
                  <li>Frontend có trang này để nhận token từ URL</li>
                  <li>
                    <strong>Thiếu:</strong> Backend chưa có API endpoint{" "}
                    <code className="bg-blue-100 px-1 rounded">
                      POST /api/auth/reset-password
                    </code>{" "}
                    để xử lý token
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <div className="text-center pt-4">
            <Button
              type="button"
              variant="default"
              onClick={() => router.push("/login")}
              className="w-full"
            >
              Quay lại đăng nhập
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Vui lòng liên hệ admin để được cấp mật khẩu mới
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
