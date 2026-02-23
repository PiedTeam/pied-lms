"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Loader2, Search, X } from "lucide-react";
// TODO: Old project service - need to be replaced or removed
// import { useGetAdminQuestions } from "@/service/admin/question.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TeacherQuestionsPage() {
  // TODO: Replace with new service
  // const { data, isLoading, error } = useGetAdminQuestions();
  const data = null;
  const isLoading = false;
  const error = null;
  const [searchQuery, setSearchQuery] = useState("");

  const questions = (data as any)?.listQuestion || [];

  const filteredQuestions = questions.filter((question: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      question.title.toLowerCase().includes(query) ||
      question.code.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Questions | {filteredQuestions.length}
        </h1>
        <Link href="/teacher/questions/create">
          <Button className="bg-[#40E0D0] hover:bg-[#40E0D0]/90 text-white shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Question
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-center text-destructive">
          {(error as Error).message || "Failed to load questions"}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && questions.length === 0 && (
        <div className="rounded-md border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No questions yet</p>
          <Link href="/teacher/questions/create">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create the first question
            </Button>
          </Link>
        </div>
      )}

      {/* Questions Table */}
      {!isLoading && !error && filteredQuestions.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Time Limit</TableHead>
                <TableHead>Memory Limit</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question: any) => (
                <TableRow key={question.uuid}>
                  <TableCell className="font-mono">{question.code}</TableCell>
                  <TableCell className="font-medium">
                    {question.title}
                  </TableCell>
                  <TableCell>{question.score}</TableCell>
                  <TableCell>{question.timeLimit}s</TableCell>
                  <TableCell>{question.memoryLimit}MB</TableCell>
                  <TableCell>{question.order}</TableCell>
                  <TableCell>
                    <Link href={`/teacher/questions/${question.uuid}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
