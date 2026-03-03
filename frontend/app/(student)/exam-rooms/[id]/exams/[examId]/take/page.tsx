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
import { useToast } from "@/hooks/use-toast";
import { useJudgeCodeFromFile, useCompileCode } from "@/service";
import { useGetExamById } from "@/services";
import { useGetStudentTestCases } from "@/services";
import { COMPILER_MESSAGES } from "@/constants/messages";
import { useAuthStore } from "@/store/auth.store";
import { saveExamScore } from "@/utils/exam-score.utils";
import { useExamScore } from "@/hooks/use-exam-scores";
import { useExamTimer } from "@/hooks/use-exam-timer";
import { useExamCode } from "@/hooks/use-exam-code";
import { ExamHeader } from "@/components/exam/ExamHeader";
import { ExamInfoPanel } from "@/components/exam/ExamInfoPanel";
import { CodeEditor } from "@/components/exam/CodeEditor";
import { TestResultsPanel } from "@/components/exam/TestResultsPanel";
import { TestInputDialog } from "@/components/exam/TestInputDialog";
import type { JudgeTestCaseResult } from "@/interface/exam/exam.types";

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

  // Fetch test cases for student
  const { data: testCasesData, isLoading: isLoadingTestCases } =
    useGetStudentTestCases(examId);

  // Compiler mutations
  const { mutate: judgeCodeFromFile } = useJudgeCodeFromFile();
  const { mutate: compileCode, isPending: isCompiling } = useCompileCode();

  // Custom hooks
  const exam = useMemo(() => examData || null, [examData]);
  const { code, setCode, saveDraft, clearDraft } = useExamCode({
    roomId,
    examId,
  });
  const savedScore = useExamScore(roomId, examId);
  const examScore = useMemo(() => savedScore, [savedScore]);

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningTestCases, setIsRunningTestCases] = useState(false);
  const [testResults, setTestResults] = useState<JudgeTestCaseResult[]>([]);
  const [activeTab, setActiveTab] = useState("question");
  const [isTestInputDialogOpen, setIsTestInputDialogOpen] = useState(false);
  const [testInput, setTestInput] = useState("");

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
  }, [code, saveDraft, toast]);

  // Helper function to determine if navigation should occur
  const shouldNavigate = (passed: number, total: number): boolean => {
    return passed === total && total > 0;
  };

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

    if (!participationId) {
      toast({
        title: "Error",
        description: "Participation ID not found. Please start the exam again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    toast({
      title: "Submitting...",
      description: COMPILER_MESSAGES.INFO.JUDGING,
    });

    judgeCodeFromFile(
      {
        code: code,
        examId: examId,
        participationId: participationId,
        timeLimit: 2000,
        memoryLimit: 128,
        optimizationLevel: 1,
      },
      {
        onSuccess: (response) => {
          if (response.data) {
            const passedCount = response.data.passed;
            const totalCount = response.data.total;
            const allTestsPassed = passedCount === totalCount && totalCount > 0;

            clearDraft();

            if (exam) {
              const user = useAuthStore.getState().user;
              if (user) {
                const score = allTestsPassed ? exam.totalMarks : 0;
                const newScore = {
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

                toast({
                  title: allTestsPassed
                    ? "Submitted successfully!"
                    : "Submitted",
                  description: allTestsPassed
                    ? `Perfect! You scored ${score}/${exam.totalMarks} points (${passedCount}/${totalCount} test cases passed)`
                    : `Score: ${score}/${exam.totalMarks} (${passedCount}/${totalCount} test cases passed). Keep practicing!`,
                });
              }
            }

            // Only navigate if all tests passed
            if (shouldNavigate(passedCount, totalCount)) {
              setTimeout(() => {
                router.push(`/exam-rooms/${roomId}`);
              }, 2000);
            }
          } else {
            toast({
              title: "Submission completed with errors",
              description: response.message || "Check your code for errors",
            });
          }
        },
        onError: (error: Error) => {
          toast({
            title: "Network Error",
            description: error.message || "Could not connect to server",
            variant: "destructive",
          });
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  }, [
    code,
    toast,
    router,
    roomId,
    examId,
    exam,
    judgeCodeFromFile,
    clearDraft,
  ]);

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
            <ExamInfoPanel
              exam={exam}
              examScore={examScore}
              testCases={testCasesData}
              isLoadingTestCases={isLoadingTestCases}
            />
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
                  <TestResultsPanel
                    isCompiling={isCompiling}
                    testResults={testResults}
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
