"use client";

import { useRouter } from "next/navigation";
import { FileSpreadsheet, Clock, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetStudentQuizlets } from "@/service";

export default function StudentQuizzesPage() {
  const router = useRouter();
  const { data: quizlets, isLoading } = useGetStudentQuizlets();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
        <p className="text-muted-foreground">
          Test your knowledge with our collection of quizzes
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading quizzes...
        </div>
      ) : quizlets && quizlets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizlets.map((quizlet) => (
            <Card
              key={quizlet.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/quizzes/${quizlet.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  {quizlet.isPublished && (
                    <Badge variant="default">Published</Badge>
                  )}
                </div>
                <CardTitle className="mt-4">{quizlet.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <User className="h-4 w-4" />
                  {quizlet.userName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{quizlet.listQuestion.length} questions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(quizlet.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <Button className="w-full mt-4">Start Quiz</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No quizzes available</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Check back later for new quizzes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
