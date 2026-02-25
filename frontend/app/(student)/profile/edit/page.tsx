"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileEditForm } from "@/components/student/ProfileEditForm";

export default function EditStudentProfilePage() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/profile">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Update your profile information
          </p>
        </div>
      </div>
      <ProfileEditForm />
    </div>
  );
}
