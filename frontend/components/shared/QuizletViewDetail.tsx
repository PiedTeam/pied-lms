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
import type { QuizletResponse } from "@/interface/quizlet/quizlet.interface";

interface QuizletViewDetailProps {
  quizlet: QuizletResponse;
}

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
        <CardTitle>Câu hỏi ({quizlet.listQuestion.length})</CardTitle>
        <CardDescription>Danh sách các câu hỏi trong quizlet</CardDescription>
        <div className="pt-4">
          <Input
            placeholder="Tìm kiếm câu hỏi..."
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
                          <Badge className="bg-green-600">Dễ</Badge>
                        )}
                        {question.level === 2 && (
                          <Badge className="bg-yellow-600">Trung bình</Badge>
                        )}
                        {question.level === 3 && (
                          <Badge className="bg-red-600">Khó</Badge>
                        )}
                        {question.isHidden && (
                          <Badge variant="outline">Level ẩn</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Điểm: {question.score} | Loại:{" "}
                        {question.questionType === "SingleChoice"
                          ? "Một đáp án"
                          : "Nhiều đáp án"}
                      </p>
                    </div>
                  </div>

                  <div className="ml-10 space-y-2">
                    {question.answers && question.answers.length > 0 ? (
                      question.answers.map((answer, optIndex) => {
                        const isCorrect =
                          question.correctAnswers?.includes(answer);
                        return (
                          <div
                            key={optIndex}
                            className={`flex items-center gap-2 p-2 rounded ${
                              isCorrect
                                ? "bg-green-50 border border-green-200"
                                : "bg-muted"
                            }`}
                          >
                            <span className="font-mono text-sm">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span
                              className={
                                isCorrect ? "font-medium text-green-700" : ""
                              }
                            >
                              {answer}
                            </span>
                            {isCorrect && (
                              <Badge variant="default" className="ml-auto">
                                Đáp án đúng
                              </Badge>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Không có đáp án
                      </p>
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
                  Trang {currentPage} / {totalPages}
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
              ? "Không tìm thấy câu hỏi phù hợp"
              : "Không có câu hỏi nào"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
