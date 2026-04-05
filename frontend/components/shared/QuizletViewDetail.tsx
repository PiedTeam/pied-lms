"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import type { QuizletViewDetailProps } from "@/interface/components/shared.types";

export function QuizletViewDetail({ quizlet }: QuizletViewDetailProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const questionsPerPage = 3;

  // Filter questions by search query
  const filteredQuestions = quizlet.listQuestion.filter((question) =>
    question.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions ({quizlet.listQuestion.length})</CardTitle>
        <CardDescription>List of questions in the quizlet</CardDescription>
        <div className="pt-4">
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {filteredQuestions.length > 0 ? (
          <>
            {paginatedQuestions.map((question, index) => {
              const actualIndex = quizlet.listQuestion.findIndex(
                (q) => q === question,
              );
              return (
                <div key={actualIndex} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      {actualIndex + 1}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{question.content}</p>
                        {question.level === 1 && (
                          <Badge className="bg-green-600">Easy</Badge>
                        )}
                        {question.level === 2 && (
                          <Badge className="bg-yellow-600">Medium</Badge>
                        )}
                        {question.level === 3 && (
                          <Badge className="bg-red-600">Hard</Badge>
                        )}
                        {question.isHidden && (
                          <Badge variant="outline">Hidden level</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Score: {question.score} | Type:{" "}
                        {question.questionType === "SingleChoice"
                          ? "Single Choice"
                          : "Multiple Choice"}
                      </p>
                    </div>
                  </div>

                  <div className="ml-10 space-y-2">
                    {question.answers && question.answers.length > 0 ? (
                      question.answers.map((answer, optIndex) => {
                        const isCorrect = question.correctAnswers?.includes(
                          answer.content,
                        );
                        return (
                          <div
                            key={optIndex}
                            className={`rounded p-3 ${
                              isCorrect
                                ? "bg-green-50 border border-green-200"
                                : "bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <span
                                className={
                                  isCorrect ? "font-medium text-green-700" : ""
                                }
                              >
                                {answer.content}
                              </span>
                              {isCorrect && (
                                <Badge variant="default" className="ml-auto">
                                  Correct Answer
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No answers provided
                      </p>
                    )}

                    {question.explanation && (
                      <div className="rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 text-sm text-blue-900 shadow-sm">
                        <div className="flex items-start gap-2">
                          <span
                            className="font-bold text-blue-600 mt-0.5"
                            aria-hidden="true"
                          >
                            💡
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold text-blue-900 mb-1">
                              Explanation:
                            </p>
                            <p className="text-blue-800 leading-relaxed">
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {index < paginatedQuestions.length - 1 && <Separator />}
                </div>
              );
            })}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-muted-foreground">
            {searchQuery
              ? "No matching questions found"
              : "No questions available"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
