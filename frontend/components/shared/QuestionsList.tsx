"use client";

import { useState } from "react";
import {
  Search,
  Clock,
  Database,
  Hash,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetQuestions } from "@/services";
import { Question } from "@/interface/question/question.interface";
import type { QuestionsListProps } from "@/interface/components/shared.types";

export function QuestionsList({
  onQuestionSelect,
  selectedQuestionId,
}: QuestionsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: questionsData, isLoading, error } = useGetQuestions();

  const questions = questionsData?.listQuestion || [];

  const filteredQuestions = questions.filter(
    (question) =>
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.questionId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select Question
          </CardTitle>
          <CardDescription>
            Choose a question to manage its test cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select Question
          </CardTitle>
          <CardDescription>
            Choose a question to manage its test cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-destructive font-medium">
              Failed to load questions
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Select Question
        </CardTitle>
        <CardDescription>
          Choose a question to manage its test cases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        {/* Questions List */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-8">
              <Search className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <h3 className="font-medium text-sm">No Questions Found</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "No questions available"}
              </p>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <div
                key={question.questionId}
                className={`group relative rounded-lg border p-3 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                  selectedQuestionId === question.questionId
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
                onClick={() => onQuestionSelect(question)}
              >
                <div className="space-y-2">
                  {/* Title and Code */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 flex-1">
                      {question.title}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {question.code && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-0.5"
                        >
                          {question.code}
                        </Badge>
                      )}
                      {selectedQuestionId === question.questionId && (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </div>

                  {/* Question ID */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Hash className="w-3 h-3" />
                    <span className="font-mono">
                      {question.questionId.slice(0, 8)}...
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{question.timeLimit}ms</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        <span>{question.memoryLimit}MB</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {question.score}pts
                      </Badge>
                      <span className="text-muted-foreground">
                        #{question.order}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredQuestions.length > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            {filteredQuestions.length} of {questions.length} questions
          </div>
        )}
      </CardContent>
    </Card>
  );
}
