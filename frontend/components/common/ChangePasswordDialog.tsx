"use client";

import { useState } from "react";
import { useChangePassword } from "@/service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const { toast } = useToast();
  const { mutate: changePassword, isPending } = useChangePassword();

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!currentPassword) {
<<<<<<< HEAD
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
=======
      newErrors.currentPassword = "Please enter your current password";
    }

    if (!newPassword) {
      newErrors.newPassword = "Please enter a new password";
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
    } else {
      const passwordErrors: string[] = [];

      if (newPassword.length < 8) {
<<<<<<< HEAD
        passwordErrors.push("Mật khẩu phải có ít nhất 8 ký tự");
      }
      if (!/[^a-zA-Z0-9]/.test(newPassword)) {
        passwordErrors.push("Mật khẩu phải có ít nhất 1 ký tự đặc biệt");
      }
      if (!/\d/.test(newPassword)) {
        passwordErrors.push("Mật khẩu phải có ít nhất 1 chữ số");
      }
      if (!/[A-Z]/.test(newPassword)) {
        passwordErrors.push("Mật khẩu phải có ít nhất 1 chữ hoa");
=======
        passwordErrors.push("Password must be at least 8 characters");
      }
      if (!/[^a-zA-Z0-9]/.test(newPassword)) {
        passwordErrors.push("Password must contain at least 1 special character");
      }
      if (!/\d/.test(newPassword)) {
        passwordErrors.push("Password must contain at least 1 digit");
      }
      if (!/[A-Z]/.test(newPassword)) {
        passwordErrors.push("Password must contain at least 1 uppercase letter");
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
      }

      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors.join(". ");
      }
    }

    if (!confirmPassword) {
<<<<<<< HEAD
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
=======
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    changePassword(
      {
        currentPassword,
        newPassword,
        confirmPassword,
      },
      {
        onSuccess: () => {
          toast({
<<<<<<< HEAD
            title: "Thành công",
            description: "Đổi mật khẩu thành công",
=======
            title: "Success",
            description: "Password changed successfully",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          });
          setOpen(false);
          // Reset form
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setErrors({});
        },
        onError: (error) => {
          toast({
<<<<<<< HEAD
            title: "Lỗi",
            description: error.message || "Đổi mật khẩu thất bại",
=======
            title: "Error",
            description: error.message || "Failed to change password",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Key className="mr-2 h-4 w-4" />
<<<<<<< HEAD
          Đổi mật khẩu
=======
          Change Password
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
<<<<<<< HEAD
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogDescription>
            Nhập mật khẩu hiện tại và mật khẩu mới của bạn
=======
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and your new password
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
<<<<<<< HEAD
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
=======
              <Label htmlFor="currentPassword">Current Password</Label>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (errors.currentPassword) {
                    setErrors({ ...errors, currentPassword: undefined });
                  }
                }}
                disabled={isPending}
                className={errors.currentPassword ? "border-destructive" : ""}
              />
              {errors.currentPassword && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.currentPassword}
                </p>
              )}
            </div>

            <div className="grid gap-2">
<<<<<<< HEAD
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
=======
              <Label htmlFor="newPassword">New Password</Label>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) {
                    setErrors({ ...errors, newPassword: undefined });
                  }
                }}
                disabled={isPending}
                className={errors.newPassword ? "border-destructive" : ""}
              />
              {errors.newPassword && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div className="grid gap-2">
<<<<<<< HEAD
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
=======
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: undefined });
                  }
                }}
                disabled={isPending}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
<<<<<<< HEAD
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
=======
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Processing..." : "Change Password"}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
