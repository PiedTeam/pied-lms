"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Award } from "lucide-react";

export default function TeacherAnalyticsPage() {
  // TODO: Fetch analytics data from API

  const stats = [
    {
      title: "Total Submissions",
      value: "0",
      change: "+0%",
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      title: "Average Score",
      value: "0%",
      change: "+0%",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Active Students",
      value: "0",
      change: "+0%",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Pass Rate",
      value: "0%",
      change: "+0%",
      icon: Award,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track student performance and exam statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder for charts */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Analytics charts will be displayed here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
