"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type {
  UpdateQuestionDto,
  QuizletLevel,
} from "@/interface/quizlet/quizlet.interface";

interface QuizletEditFormProps {
  questions: UpdateQuestionDto[];
  onQuestionsChange: (questions: UpdateQuestionDto[]) => void;
}

export function QuizletEditForm({
  questions,
  onQuestionsChange,
}: QuizletEditFormProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const questionsPerPage = 3;

  // Filter questions by search query
  const filteredQuestions = questions
    .map((q, originalIndex) => ({ ...q, originalIndex }))
    .filter((question) =>
      question.content.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage,
  );

  const handleQuestionChange = (
    originalIndex: number,
    field: keyof UpdateQuestionDto,
    value: any,
  ) => {
    const newQuestions = [...questions];
    newQuestions[originalIndex] = {
      ...newQuestions[originalIndex],
      [field]: value,
    };
    onQuestionsChange(newQuestions);
  };

  const handleAnswerChange = (
    originalIndex: number,
    answerIndex: number,
    value: string,
  ) => {
    const newQuestions = [...questions];
    const newAnswers = [...newQuestions[originalIndex].answers];
    newAnswers[answerIndex] = value;
    newQuestions[originalIndex] = {
      ...newQuestions[originalIndex],
      answers: newAnswers,
    };
    onQuestionsChange(newQuestions);
  };

  const toggleCorrectAnswer = (originalIndex: number, answer: string) => {
    const newQuestions = [...questions];
    const question = newQuestions[originalIndex];
    const currentCorrect = question.correctAnswers;
    const isCurrentlyCorrect = currentCorrect.includes(answer);

    // Single choice logic: only allow one correct answer
    if (question.questionType === 0) {
      // SingleChoice
      if (isCurrentlyCorrect) {
        // Uncheck
        newQuestions[originalIndex] = {
          ...question,
          correctAnswers: [],
        };
      } else {
        // Check this one, uncheck all others
        newQuestions[originalIndex] = {
          ...question,
          correctAnswers: [answer],
        };
      }
    } else {
      // MultipleChoice - allow multiple selections
      if (isCurrentlyCorrect) {
        newQuestions[originalIndex] = {
          ...question,
          correctAnswers: currentCorrect.filter((a) => a !== answer),
        };
      } else {
        newQuestions[originalIndex] = {
          ...question,
          correctAnswers: [...currentCorrect, answer],
        };
      }
    }
    onQuestionsChange(newQuestions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Câu hỏi ({questions.length})</CardTitle>
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
            {paginatedQuestions.map(({ originalIndex }, idx) => {
              const question = questions[originalIndex];
              return (
                <div key={originalIndex} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-2">
                      {originalIndex + 1}
                    </Badge>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`question-${originalIndex}`}>
                          Nội dung câu hỏi{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id={`question-${originalIndex}`}
                          value={question.content}
                          onChange={(e) =>
                            handleQuestionChange(
                              originalIndex,
                              "content",
                              e.target.value,
                            )
                          }
                          placeholder="Nhập nội dung câu hỏi"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`score-${originalIndex}`}>
                            Điểm số
                          </Label>
                          <Input
                            id={`score-${originalIndex}`}
                            type="number"
                            step="0.1"
                            min="0"
                            value={question.score}
                            onChange={(e) =>
                              handleQuestionChange(
                                originalIndex,
                                "score",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`type-${originalIndex}`}>
                            Loại câu hỏi
                          </Label>
                          <select
                            id={`type-${originalIndex}`}
                            value={question.questionType}
                            onChange={(e) =>
                              handleQuestionChange(
                                originalIndex,
                                "questionType",
                                parseInt(e.target.value),
                              )
                            }
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          >
                            <option value="0">Một đáp án</option>
                            <option value="1">Nhiều đáp án</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`level-${originalIndex}`}>
                            Độ khó
                          </Label>
                          <select
                            id={`level-${originalIndex}`}
                            value={question.level}
                            onChange={(e) =>
                              handleQuestionChange(
                                originalIndex,
                                "level",
                                parseInt(e.target.value) as QuizletLevel,
                              )
                            }
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          >
                            <option value="0">Dễ</option>
                            <option value="1">Trung bình</option>
                            <option value="2">Khó</option>
                          </select>
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                          <Switch
                            id={`isHidden-${originalIndex}`}
                            checked={question.isHidden}
                            onCheckedChange={(checked) =>
                              handleQuestionChange(
                                originalIndex,
                                "isHidden",
                                checked,
                              )
                            }
                          />
                          <Label
                            htmlFor={`isHidden-${originalIndex}`}
                            className="cursor-pointer"
                          >
                            Ẩn level câu hỏi
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Đáp án <span className="text-red-500">*</span>
                        </Label>
                        <div className="space-y-2">
                          {question.answers.map((answer, aIndex) => (
                            <div
                              key={aIndex}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={question.correctAnswers.includes(
                                  answer,
                                )}
                                onChange={() =>
                                  toggleCorrectAnswer(originalIndex, answer)
                                }
                                className="h-4 w-4"
                              />
                              <span className="font-mono text-sm w-6">
                                {String.fromCharCode(65 + aIndex)}.
                              </span>
                              <Input
                                value={answer}
                                onChange={(e) =>
                                  handleAnswerChange(
                                    originalIndex,
                                    aIndex,
                                    e.target.value,
                                  )
                                }
                                placeholder={`Đáp án ${String.fromCharCode(65 + aIndex)}`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {question.questionType === 0
                            ? "Chọn 1 checkbox để đánh dấu đáp án đúng (Một đáp án)"
                            : "Chọn checkbox để đánh dấu các đáp án đúng (Nhiều đáp án)"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {idx < paginatedQuestions.length - 1 && <Separator />}
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
