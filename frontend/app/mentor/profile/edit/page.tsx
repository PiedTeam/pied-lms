"use client";

import { ProfileEditForm } from "@/components/student/ProfileEditForm";

export default function MentorProfileEditPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground">Update your profile information</p>
      </div>

      <div className="max-w-2xl">
        <ProfileEditForm />
      </div>
    </div>
  );
}
