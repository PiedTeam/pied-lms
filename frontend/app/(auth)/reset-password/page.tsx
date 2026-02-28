"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useResetPassword } from "@/services/auth/auth.service";

interface PasswordResetFormData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const [successMessage, setSuccessMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<PasswordResetFormData>({
    defaultValues: {
      email,
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    mutate: resetPassword,
    isPending,
    isError,
    error,
  } = useResetPassword();

  // Check if email or token is missing
  if (!email || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Liên kết không hợp lệ</CardTitle>
            <CardDescription>Không thể đặt lại mật khẩu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>
                Liên kết đặt lại mật khẩu không hợp lệ. Thiếu email hoặc token.
                Vui lòng sử dụng liên kết từ email của bạn hoặc liên hệ hỗ trợ.
              </AlertDescription>
            </Alert>
            <Button
              type="button"
              variant="default"
              onClick={() => router.push("/login")}
              className="w-full"
            >
              Quay lại đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = (data: PasswordResetFormData) => {
    resetPassword(
      {
        email,
        token,
        newPassword: data.newPassword,
      },
      {
        onSuccess: (response) => {
          setSuccessMessage(response.message);
          // Clear password fields
          reset({
            email,
            newPassword: "",
            confirmPassword: "",
          });
          // Redirect to login after 2 seconds
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        },
      },
    );
  };

  const newPassword = watch("newPassword");

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Đặt lại mật khẩu</CardTitle>
          <CardDescription>Nhập mật khẩu mới của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {successMessage && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Thành công</AlertTitle>
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {isError && error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>
                {error.message ||
                  "Đặt lại mật khẩu thất bại. Vui lòng thử lại."}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                disabled
                className="bg-muted"
                aria-label="Email address"
                aria-readonly="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword", {
                  required: "Mật khẩu mới là bắt buộc",
                })}
                disabled={isPending}
                aria-label="New password"
                aria-required="true"
                aria-invalid={!!errors.newPassword}
                aria-describedby={
                  errors.newPassword ? "newPassword-error" : undefined
                }
              />
              {errors.newPassword && (
                <p
                  id="newPassword-error"
                  className="text-sm text-red-600"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Vui lòng xác nhận mật khẩu của bạn",
                  validate: (value) =>
                    value === newPassword || "Mật khẩu không khớp",
                })}
                disabled={isPending}
                aria-label="Confirm password"
                aria-required="true"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "confirmPassword-error" : undefined
                }
              />
              {errors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  className="text-sm text-red-600"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
              aria-label="Reset password"
              aria-busy={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </Button>
          </form>

          <div className="text-center pt-2">
            <Button
              type="button"
              variant="link"
              onClick={() => router.push("/login")}
              disabled={isPending}
            >
              Quay lại đăng nhập
            </Button>
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
