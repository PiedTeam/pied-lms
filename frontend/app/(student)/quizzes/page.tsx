"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  Clock,
  User,
  Calendar,
  Award,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useGetStudentQuizlets } from "@/service";
import { QuizletLevel } from "@/interface/quizlet/quizlet.interface";

export default function StudentQuizzesPage() {
  const router = useRouter();
  const { data: quizlets, isLoading } = useGetStudentQuizlets();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; // 4 quizlets per page

  const getLevelBadge = (level: QuizletLevel, isHidden: boolean) => {
    if (isHidden) return null;

    switch (level) {
      case QuizletLevel.Easy:
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <Award className="h-3 w-3 mr-1" />
            Easy
          </Badge>
        );
      case QuizletLevel.Medium:
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700">
            <Award className="h-3 w-3 mr-1" />
            Medium
          </Badge>
        );
      case QuizletLevel.Hard:
        return (
          <Badge className="bg-red-600 hover:bg-red-700">
            <Award className="h-3 w-3 mr-1" />
            Hard
          </Badge>
        );
      default:
        return null;
    }
  };

  // Filter by search query
  const filteredQuizlets = useMemo(() => {
    if (!quizlets) return [];
    if (!searchQuery.trim()) return quizlets;

    return quizlets.filter(
      (quizlet) =>
        quizlet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quizlet.userName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [quizlets, searchQuery]);

  // Paginate on frontend
  const totalPages = Math.ceil(filteredQuizlets.length / pageSize);
  const paginatedQuizlets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredQuizlets.slice(startIndex, startIndex + pageSize);
  }, [filteredQuizlets, currentPage, pageSize]);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
        <p className="text-muted-foreground">
          Test your knowledge with quiz sets
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : paginatedQuizlets.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {paginatedQuizlets.map((quizlet) => (
              <Card
                key={quizlet.id}
                className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary"
                onClick={() => router.push(`/quizzes/${quizlet.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileSpreadsheet className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant="default" className="bg-blue-600">
                        Published
                      </Badge>
                      {getLevelBadge(quizlet.level, quizlet.isHidden)}
                    </div>
                  </div>
                  <CardTitle className="text-xl line-clamp-2">
                    {quizlet.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Created by:</span>
                      <span className="truncate">{quizlet.userName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Created at:</span>
                      <span>
                        {new Date(quizlet.createdAt).toLocaleDateString(
                          "en-US",
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Questions:</span>
                      <span className="font-semibold text-primary">
                        {quizlet.quantityQuestion}
                      </span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 font-semibold" size="lg">
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                &gt;
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-16">
            <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">
              {searchQuery
                ? "No quizzes found"
                : "No quizzes available"}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {searchQuery
                ? "Could not find any quiz sets matching your search"
                : "No quizzes have been published yet. Please check back later!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
