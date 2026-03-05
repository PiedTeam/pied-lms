"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { axiosGeneral as axios } from "@/common/axios";
import { forceLogout } from "@/lib/auth-session";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
}

export function LogoutButton({
  variant = "outline",
  size = "default",
  className = "",
  showIcon = true,
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    // Best-effort server logout, do not block UI logout flow.
    void axios.post("/auth/logout", undefined, { timeout: 5000 }).catch(() => {
      // Ignore API logout failures - local logout still must succeed.
    });

    await forceLogout({ reason: "manual-logout" });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  );
}
