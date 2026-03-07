"use client";

import { useState } from "react";
import { Search, FileText, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ExamResponse } from "@/interface/exam/exam.interface";
import type { ExamSelectorProps } from "@/interface/components/shared.types";

export function ExamSelector({
  exams = [],
  selectedExamId,
  onSelectExam,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: ExamSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  // Filter exams by status
  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === "active") return !exam.isDeleted;
    if (activeTab === "archived") return exam.isDeleted;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search exams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Hidden</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {/* Exams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredExams.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? "No exams found matching your search"
                        : "No exams available"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredExams.map((exam) => (
                <Card
                  key={exam.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedExamId === exam.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => onSelectExam(exam.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm line-clamp-2 flex-1">
                          {exam.title}
                        </h3>
                        {selectedExamId === exam.id && (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                      {exam.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {exam.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {exam.isDeleted && (
                          <Badge variant="outline" className="text-xs">
                            Đã ẩn
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          Total: {exam.totalMarks}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Pass: {exam.passingMarks}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {onPageChange && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
