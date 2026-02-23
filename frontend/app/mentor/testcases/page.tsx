"use client";

import { useState } from "react";
import { Plus, FileText, Trophy, Clock, Database, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TestCaseForm } from "@/components/shared/TestCaseForm";
import { TestCasesList } from "@/components/shared/TestCasesList";
import { QuestionsList } from "@/components/shared/QuestionsList";
import { useToast } from "@/hooks/use-toast";
import { TESTCASE_MESSAGES } from "@/constants/messages.constants";
import { Question } from "@/interface/question/question.interface";

export default function MentorTestCasesPage() {
  const { toast } = useToast();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleQuestionSelect = (question: Question) => {
    setSelectedQuestion(question);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    toast({
      title: "Thành công",
      description: TESTCASE_MESSAGES.SUCCESS.CREATED,
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Test Case Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage test cases for programming questions
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Questions List */}
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <QuestionsList
              onQuestionSelect={handleQuestionSelect}
              selectedQuestionId={selectedQuestion?.questionId}
            />
          </div>
        </div>

        {/* Test Cases Management */}
        <div className="xl:col-span-3 min-w-0">
          {selectedQuestion ? (
            <div className="space-y-6">
              {/* Selected Question Info */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-xl flex items-center gap-2 truncate">
                        <FileText className="h-5 w-5 text-primary shrink-0" />
                        {selectedQuestion.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Question ID:{" "}
                        <span className="font-mono text-xs">
                          {selectedQuestion.questionId}
                        </span>
                      </CardDescription>
                    </div>
                    <Dialog
                      open={isCreateDialogOpen}
                      onOpenChange={setIsCreateDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="shrink-0">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Test Case
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Create New Test Case</DialogTitle>
                          <DialogDescription>
                            Create a test case for: {selectedQuestion.title}
                          </DialogDescription>
                        </DialogHeader>
                        <TestCaseForm
                          questionId={selectedQuestion.questionId}
                          onSuccess={handleCreateSuccess}
                          onCancel={() => setIsCreateDialogOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="w-fit">
                        <Trophy className="w-3 h-3 mr-1" />
                        {selectedQuestion.score}
                      </Badge>
                      <span className="text-muted-foreground">points</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="w-fit">
                        <Clock className="w-3 h-3 mr-1" />
                        {selectedQuestion.timeLimit}
                      </Badge>
                      <span className="text-muted-foreground">ms</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="w-fit">
                        <Database className="w-3 h-3 mr-1" />
                        {selectedQuestion.memoryLimit}
                      </Badge>
                      <span className="text-muted-foreground">MB</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="w-fit">
                        <Hash className="w-3 h-3 mr-1" />
                        {selectedQuestion.order}
                      </Badge>
                      <span className="text-muted-foreground">order</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Cases List */}
              <TestCasesList
                questionId={selectedQuestion.questionId}
                questionTitle={selectedQuestion.title}
              />
            </div>
          ) : (
            <Card className="h-[400px] flex items-center justify-center">
              <CardContent className="text-center">
                <div className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground">
                  No Question Selected
                </h3>
                <p className="text-sm text-muted-foreground/80 mt-2 max-w-sm mx-auto">
                  Select a question from the list to view and manage its test
                  cases
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
