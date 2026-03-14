"use client";

import { useAuthStore } from "@/store/auth.store";
import { ProfileView } from "@/components/student/ProfileView";

export function StudentProfile() {
  // Get user data from auth store (from login)
  const user = useAuthStore((state) => state.user);

  // Transform user data to match profile interface
  const profile = user
    ? {
        full_name: user.fullName,
        email: user.email,
        created_at: null, // Not available from login data
        updated_at: null, // Not available from login data
      }
    : null;

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="mt-2 text-muted-foreground">
          View your profile information
        </p>
      </div>
      <ProfileView profile={profile as any} isLoading={false} error={null} />
    </div>
  );
}
