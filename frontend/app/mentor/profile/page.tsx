"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Edit } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

export default function MentorProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            View and manage your profile information
          </p>
        </div>
        <Button asChild>
          <Link href="/mentor/profile/edit">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <p className="text-lg">{user?.fullName || "Not provided"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user?.email || "Not provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Role
              </label>
              <div>
                <Badge variant="secondary">Mentor</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                User ID
              </label>
              <p className="font-mono text-sm">
                {user?.uuid || "Not available"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Account Status
              </label>
              <div>
                <Badge variant="default">Active</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Member Since
              </label>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" asChild>
              <Link href="/mentor/dashboard">View Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/mentor/students">Manage Students</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/mentor/exam-rooms">View Exam Rooms</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
