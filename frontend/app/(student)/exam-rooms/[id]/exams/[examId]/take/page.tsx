"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { SubmissionHistoryTab } from "@/components/student/SubmissionHistoryTab";
import { useToast } from "@/hooks/use-toast";
import { useJudgeCodeFromFile, useCompileCode } from "@/service";
import { useGetExamById, useSubmitStudentCode } from "@/services";
import { useGetStudentTestCases } from "@/services";
import { COMPILER_MESSAGES } from "@/constants/messages";
import type { JudgeCodeResponse } from "@/interface/compiler/compiler.interface";
import { useAuthStore } from "@/store/auth.store";
import { saveExamScore } from "@/utils/exam-score.utils";
import { useExamScore } from "@/hooks/use-exam-scores";
import {
  createMockSubmissionFromJudgeResult,
  saveMockSubmission,
} from "@/utils/submission-history.utils";

interface Exam {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
}

interface JudgeTestCaseResult {
  testCase: number;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  executionTime: number | null;
  error: string | null;
  errorCode: string | null;
}

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const editorRef = useRef<unknown>(null);

  const roomId = params.id as string;
  const examId = params.examId as string;

  // Fetch exam data from API
  const {
    data: examData,
    isLoading: isLoadingExam,
    error: examError,
  } = useGetExamById(examId);

  // Compiler mutation
  const { mutate: judgeCodeFromFile } = useJudgeCodeFromFile();
  const { mutate: compileCode, isPending: isCompiling } = useCompileCode();
  const { mutate: submitStudentCode } = useSubmitStudentCode();
  const { mutate: startExam } = useStartExam();

  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [participationId, setParticipationId] = useState<string | null>(null);
  const [startExamError, setStartExamError] = useState<string | null>(null);
  const [code, setCode] = useState(`#include <stdio.h>
#include <stdlib.h>

int main() {
    // Write your code here
    
    return 0;
}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningTestCases, setIsRunningTestCases] = useState(false);
  const [testResults, setTestResults] = useState<JudgeTestCaseResult[]>([]);
  const [activeTab, setActiveTab] = useState("question");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentScore, setCurrentScore] =
    useState<ReturnType<typeof useExamScore>>(null);
  const [submissionRefreshSignal, setSubmissionRefreshSignal] = useState(0);

  // Check if test cases are available
  const testCases = useMemo(() => testCasesData || [], [testCasesData]);
  const hasTestCases = testCases.length > 0;

  // Auto-submit handler
  const handleAutoSubmit = useCallback(async () => {
    toast({
      title: "Time is up",
      description: "Your exam has been automatically submitted",
    });
    // Will implement submit logic below
  }, [toast]);

  // Timer hook
  const { timeRemaining, formatTime } = useExamTimer({
    roomId,
    onTimeUp: handleAutoSubmit,
  });

  // Handlers
  const handleSaveDraft = useCallback(() => {
    if (!code.trim()) {
      toast({
        title: "No code to save",
        description: "Please write some code before saving",
        variant: "destructive",
      });
      return;
    }

    saveDraft();
    toast({
      title: "Draft saved",
      description: "Your code has been saved locally",
    });
  }, [code, roomId, examId, toast]);

  const handleSubmissionSuccess = useCallback(
    (
      judgeResult: JudgeCodeResponse,
      options: { fromFallback?: boolean } = {},
    ) => {
      const passedCount = judgeResult.passed;
      const totalCount = judgeResult.total;
      const allTestsPassed = passedCount === totalCount && totalCount > 0;

      localStorage.removeItem(`exam_code_${roomId}_${examId}`);

      if (exam) {
        const user = useAuthStore.getState().user;
        if (user) {
          const score = allTestsPassed ? exam.totalMarks : 0;
          const newScore: ExamScore = {
            studentId: user.uuid,
            examRoomId: roomId,
            examId: examId,
            score: score,
            totalMarks: exam.totalMarks,
            passedTestCases: passedCount,
            totalTestCases: totalCount,
            submittedAt: new Date().toISOString(),
          };

          saveExamScore(newScore);
          setCurrentScore(newScore);

          if (allTestsPassed) {
            toast({
              title: "Submitted successfully!",
              description: `Perfect! You scored ${score}/${exam.totalMarks} points (${passedCount}/${totalCount} test cases passed)`,
            });
          } else {
            toast({
              title: "Submitted",
              description: `Score: ${score}/${exam.totalMarks} (${passedCount}/${totalCount} test cases passed). Keep practicing!`,
            });
          }
        }
      }

      // Keep local mock snapshot so UI can still work when history APIs are unavailable.
      const mockSubmission = createMockSubmissionFromJudgeResult(
        examId,
        code,
        "c",
        judgeResult,
      );
      saveMockSubmission(examId, mockSubmission);

      if (options.fromFallback) {
        toast({
          title: "Fallback mode",
          description:
            "Submission saved through legacy judge flow and local history cache.",
        });
      }

      setActiveTab("submissions");
      setSubmissionRefreshSignal((prev) => prev + 1);
    },
    [code, exam, examId, roomId, toast],
  );

  const handleSubmit = useCallback(async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write code before submitting",
        variant: "destructive",
      });
      return;
    }

    if (code.trim().length < 10) {
      toast({
        title: COMPILER_MESSAGES.ERROR.CODE_TOO_SHORT,
        description: COMPILER_MESSAGES.VALIDATION.CODE_MIN_LENGTH,
        variant: "destructive",
      });
      return;
    }

    // Get participationId from localStorage
    const participationKey = `exam_participation_${roomId}_${examId}`;
    const participationId = localStorage.getItem(participationKey);

    let switchedToFallback = false;

    submitStudentCode(
      {
        code,
        examId: examId,
        language: "c",
        optimizationLevel: 2,
      },
      {
        onSuccess: (judgeResult) => {
          handleSubmissionSuccess(judgeResult);
          setIsSubmitting(false);
        },
        onError: (submitError: Error) => {
          if (!participationId) {
            toast({
              title: "Submit failed",
              description:
                submitError.message ||
                "Could not submit by new API and no legacy participation session was found.",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }

          switchedToFallback = true;
          toast({
            title: "Submission API unavailable",
            description:
              "Switching to legacy judge endpoint and local submission history cache.",
          });

          judgeCodeFromFile(
            {
              code: code,
              examId: examId,
              participationId: participationId,
              timeLimit: 2000,
              memoryLimit: 128,
              optimizationLevel: 2,
            },
            {
              onSuccess: (legacyResult) => {
                if (legacyResult.data) {
                  handleSubmissionSuccess(legacyResult.data, {
                    fromFallback: true,
                  });
                } else {
                  toast({
                    title: "Submission completed with errors",
                    description:
                      legacyResult.message || "Check your code for errors",
                  });
                }
              },
              onError: (fallbackError: Error) => {
                toast({
                  title: "Network Error",
                  description:
                    fallbackError.message || "Could not connect to server",
                  variant: "destructive",
                });
              },
              onSettled: () => {
                setIsSubmitting(false);
              },
            },
          );
        },
        onSettled: () => {
          if (!switchedToFallback) {
            setIsSubmitting(false);
          }
        },
      },
    );
  }, [
    code,
    examId,
    handleSubmissionSuccess,
    judgeCodeFromFile,
    participationId,
    submitStudentCode,
    toast,
  ]);

  const handleAutoSubmit = useCallback(async () => {
    toast({
      title: "Time is up",
      description: "Your exam has been automatically submitted",
    });

    await handleSubmit();
  }, [toast, handleSubmit]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, handleAutoSubmit]);

  const handleEditorDidMount = (editor: unknown) => {
    editorRef.current = editor;
  };

  const handleTestCode = useCallback(() => {
    if (!code.trim()) {
      toast({
        title: COMPILER_MESSAGES.ERROR.NO_CODE,
        description: COMPILER_MESSAGES.VALIDATION.CODE_REQUIRED,
        variant: "destructive",
      });
      return;
    }

    if (code.trim().length < 10) {
      toast({
        title: COMPILER_MESSAGES.ERROR.CODE_TOO_SHORT,
        description: COMPILER_MESSAGES.VALIDATION.CODE_MIN_LENGTH,
        variant: "destructive",
      });
      return;
    }

    setIsTestInputDialogOpen(true);
  }, [code, toast]);

  const handleTestCodeWithInput = useCallback(
    (input: string) => {
      setActiveTab("results");
      setTestResults([]);

      toast({
        title: COMPILER_MESSAGES.INFO.COMPILING,
        description: COMPILER_MESSAGES.INFO.EXECUTING,
      });

      compileCode(
        {
          code: code,
          input: input,
          timeLimit: 2000,
          memoryLimit: 128,
          optimizationLevel: 2,
        },
        {
          onSuccess: (response) => {
            if (response.data) {
              if (response.data.success) {
                toast({
                  title: COMPILER_MESSAGES.SUCCESS.EXECUTED,
                  description: `Compilation: ${response.data.compilationTime}ms, Execution: ${response.data.executionTime}ms`,
                });

                const mockResult: JudgeTestCaseResult = {
                  testCase: 1,
                  passed: true,
                  input: input,
                  expectedOutput: "Code compiled and ran successfully",
                  actualOutput: response.data.output || "No output",
                  executionTime: response.data.executionTime,
                  error: null,
                  errorCode: null,
                };

                setTestResults([mockResult]);
              } else {
                toast({
                  title: "Compilation/Runtime Error",
                  description:
                    response.message || "Check the error details below",
                });

                const errorResult: JudgeTestCaseResult = {
                  testCase: 1,
                  passed: false,
                  input: input,
                  expectedOutput: "",
                  actualOutput: null,
                  executionTime: response.data.executionTime,
                  error:
                    response.data.error || response.message || "Unknown error",
                  errorCode: response.data.errorCode || null,
                };

                setTestResults([errorResult]);
              }
            } else {
              toast({
                title: COMPILER_MESSAGES.ERROR.EXECUTION_FAILED,
                description: response.message || "No response data",
                variant: "destructive",
              });
              setTestResults([]);
            }
          },
          onError: (error: Error) => {
            toast({
              title: "Network Error",
              description: error.message || "Could not connect to server",
              variant: "destructive",
            });
            setTestResults([]);
          },
        },
      );
    },
    [code, toast, compileCode],
  );

  const handleRunTest = useCallback(() => {
    handleTestCodeWithInput(testInput);
    setIsTestInputDialogOpen(false);
  }, [testInput, handleTestCodeWithInput]);

  const handleRunTestCases = useCallback(async () => {
    if (!code.trim()) {
      toast({
        title: "No code to test",
        description: "Please write some code before running test cases",
        variant: "destructive",
      });
      return;
    }

    if (testCases.length === 0) {
      toast({
        title: "No test cases",
        description: "There are no test cases available for this exam",
        variant: "destructive",
      });
      return;
    }

    setIsRunningTestCases(true);
    setActiveTab("results");
    setTestResults([]);

    toast({
      title: "Running test cases",
      description: `Testing your code with ${testCases.length} test case(s)...`,
    });

    const results: JudgeTestCaseResult[] = [];

    // Run each test case sequentially
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];

      try {
        const response = await new Promise<any>((resolve, reject) => {
          compileCode(
            {
              code: code,
              input: testCase.inputPath || "",
              timeLimit: 2000,
              memoryLimit: 128,
              optimizationLevel: 2,
            },
            {
              onSuccess: resolve,
              onError: reject,
            },
          );
        });

        if (response.data && response.data.success) {
          const actualOutput = (response.data.output || "").trim();
          const expectedOutput = (testCase.outputPath || "").trim();
          const passed = actualOutput === expectedOutput;

          results.push({
            testCase: i + 1,
            passed: passed,
            input: testCase.inputPath || "",
            expectedOutput: expectedOutput,
            actualOutput: actualOutput,
            executionTime: response.data.executionTime,
            error: null,
            errorCode: null,
          });
        } else {
          results.push({
            testCase: i + 1,
            passed: false,
            input: testCase.inputPath || "",
            expectedOutput: testCase.outputPath || "",
            actualOutput: null,
            executionTime: response.data?.executionTime || 0,
            error:
              response.data?.error || response.message || "Execution failed",
            errorCode: response.data?.errorCode || null,
          });
        }
      } catch (error: any) {
        results.push({
          testCase: i + 1,
          passed: false,
          input: testCase.inputPath || "",
          expectedOutput: testCase.outputPath || "",
          actualOutput: null,
          executionTime: 0,
          error: error.message || "Network error",
          errorCode: null,
        });
      }
    }

    setTestResults(results);
    setIsRunningTestCases(false);

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;

    toast({
      title: "Test cases completed",
      description: `${passedCount}/${totalCount} test case(s) passed`,
      variant: passedCount === totalCount ? "default" : "destructive",
    });
  }, [code, testCases, toast, compileCode]);

  const handleEditorDidMount = (editor: unknown) => {
    editorRef.current = editor;
  };

  // Loading state
  if (isLoadingExam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (examError || !exam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Exam not found</p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/exam-rooms/${roomId}`)}
          >
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ExamHeader
        exam={exam}
        timeRemaining={timeRemaining}
        formatTime={formatTime}
        isCompiling={isCompiling}
        isSubmitting={isSubmitting}
        isRunningTestCases={isRunningTestCases}
        hasTestCases={hasTestCases}
        onBack={() => router.back()}
        onSaveDraft={handleSaveDraft}
        onTestCode={handleTestCode}
        onRunTestCases={handleRunTestCases}
        onSubmit={handleSubmit}
      />

      <div className="container mx-auto p-4 h-[calc(100vh-140px)]">
        <ResizablePanelGroup
          direction="horizontal"
          className="rounded-lg border"
        >
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <Card className="h-full overflow-hidden flex flex-col border-0 rounded-none">
              <CardHeader className="border-b shrink-0">
                <CardTitle>{exam.title}</CardTitle>
                <CardDescription>{exam.description}</CardDescription>
                <div className="flex gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Total Score:</span>
                    <Badge variant="outline">{exam.totalMarks}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Passing Score:</span>
                    <Badge variant="outline">{exam.passingMarks}</Badge>
                  </div>
                  {examScore && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Your Score:</span>
                      <Badge
                        variant={
                          examScore.score >= exam.passingMarks
                            ? "default"
                            : "destructive"
                        }
                        className={
                          examScore.score >= exam.passingMarks
                            ? "bg-green-600"
                            : ""
                        }
                      >
                        {examScore.score}/{examScore.totalMarks}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                {examScore && (
                  <div className="bg-muted p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      Submission Status
                      <Badge
                        variant={
                          examScore.score >= exam.passingMarks
                            ? "default"
                            : "destructive"
                        }
                        className={
                          examScore.score >= exam.passingMarks
                            ? "bg-green-600"
                            : ""
                        }
                      >
                        {examScore.score >= exam.passingMarks
                          ? "Passed"
                          : "Failed"}
                      </Badge>
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Score:</span>{" "}
                        <span
                          className={
                            examScore.score >= exam.passingMarks
                              ? "text-green-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {examScore.score}/{examScore.totalMarks}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Test Cases:</span>{" "}
                        {examScore.passedTestCases}/{examScore.totalTestCases}{" "}
                        passed
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted:{" "}
                        {new Date(examScore.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Description:</h3>
                  <p className="text-sm text-muted-foreground">
                    {exam.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Instructions:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Write your C code in the editor on the right</li>
                    <li>
                      Click &quot;Test Code&quot; to check with sample test
                      cases
                    </li>
                    <li>
                      Click &quot;Save Draft&quot; to save code (can continue
                      later)
                    </li>
                    <li>
                      Click &quot;Submit&quot; to submit your final answer
                    </li>
                    <li>Note: After submitting, you cannot edit your code</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={60} minSize={40}>
            <Card className="h-full overflow-hidden flex flex-col border-0 rounded-none">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col h-full"
              >
                <TabsList className="w-full justify-start rounded-none border-b shrink-0">
                  <TabsTrigger value="question">Code Editor</TabsTrigger>
                  <TabsTrigger value="results">
                    Test Results
                    {testResults.length > 0 && (
                      <Badge className="ml-2" variant="secondary">
                        {testResults.filter((r) => r.passed).length}/
                        {testResults.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
                </TabsList>

                <TabsContent
                  value="question"
                  className="flex-1 m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden"
                >
                  <CodeEditor
                    code={code}
                    onChange={setCode}
                    onMount={handleEditorDidMount}
                  />
                </TabsContent>

                <TabsContent
                  value="results"
                  className="flex-1 m-0 overflow-y-auto p-4"
                >
                  {isCompiling ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Running test cases...
                        </p>
                      </div>
                    </div>
                  ) : testResults.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Click &quot;Test Code&quot; to run test cases
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Test Results</h3>
                        <Badge
                          variant={
                            testResults.every((r) => r.passed)
                              ? "default"
                              : "destructive"
                          }
                        >
                          {testResults.filter((r) => r.passed).length}/
                          {testResults.length} Passed
                        </Badge>
                      </div>

                      {testResults.map((result, index) => (
                        <Card
                          key={index}
                          className={
                            result.passed
                              ? "border-green-500"
                              : "border-red-500"
                          }
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                Test Case {result.testCase}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                {result.executionTime && (
                                  <Badge variant="outline">
                                    {result.executionTime}ms
                                  </Badge>
                                )}
                                <Badge
                                  variant={
                                    result.passed ? "default" : "destructive"
                                  }
                                  className={
                                    result.passed
                                      ? "bg-green-600"
                                      : "bg-red-600"
                                  }
                                >
                                  {result.passed ? "Passed" : "Failed"}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {result.error && (
                              <div>
                                <p className="text-sm font-medium text-red-600">
                                  Error:
                                </p>
                                <pre className="bg-red-50 text-red-900 p-2 rounded text-sm mt-1 whitespace-pre-wrap">
                                  {result.error}
                                </pre>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">Input:</p>
                              <pre className="bg-muted p-2 rounded text-sm mt-1">
                                {result.input}
                              </pre>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Expected Output:
                              </p>
                              <pre className="bg-muted p-2 rounded text-sm mt-1">
                                {result.expectedOutput}
                              </pre>
                            </div>
                            {result.actualOutput && (
                              <div>
                                <p className="text-sm font-medium">
                                  Your Output:
                                </p>
                                <pre
                                  className={`p-2 rounded text-sm mt-1 ${
                                    result.passed
                                      ? "bg-green-50 text-green-900"
                                      : "bg-red-50 text-red-900"
                                  }`}
                                >
                                  {result.actualOutput}
                                </pre>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent
                  value="submissions"
                  className="flex-1 m-0 overflow-hidden"
                >
                  <SubmissionHistoryTab
                    key={`${examId}-${submissionRefreshSignal}`}
                    examId={examId}
                    refreshSignal={submissionRefreshSignal}
                    pageSize={8}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <TestInputDialog
        open={isTestInputDialogOpen}
        testInput={testInput}
        onOpenChange={setIsTestInputDialogOpen}
        onTestInputChange={setTestInput}
        onRunTest={handleRunTest}
      />
    </div>
  );
}
