"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Play, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { SubmissionHistoryTab } from "@/components/student/SubmissionHistoryTab";
import { useToast } from "@/hooks/use-toast";
import { useJudgeCodeFromFile } from "@/service";
import { useGetExamById, useSubmitStudentCode } from "@/services";
import { useGetStudentTestCases } from "@/services";
import { compileCode as compileCodeService } from "@/services/compiler/compiler.service";
import { COMPILER_MESSAGES } from "@/constants/messages";
import type { JudgeCodeResponse } from "@/interface/compiler/compiler.interface";
import type {
  CompilerApiResponse,
  CompileCodeResponse,
} from "@/interface/compiler/compiler.interface";
import type {
  ExamScore,
  Exam,
  JudgeTestCaseResult,
} from "@/interface/exam/exam-page.types";
import type { TestCaseResponse } from "@/interface/testcase/testcase.interface";
import { useAuthStore } from "@/store/auth.store";
import { saveExamScore } from "@/utils/exam-score.utils";
import { useExamScore } from "@/hooks/use-exam-scores";
import {
  createMockSubmissionFromJudgeResult,
  saveMockSubmission,
} from "@/utils/submission-history.utils";

// Simple C syntax highlighter
const highlightCode = (code: string, isDark: boolean) => {
  // Escape HTML first
  let highlighted = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Use placeholders to protect already-highlighted content
  const placeholders: { [key: string]: string } = {};
  let placeholderIndex = 0;

  const createPlaceholder = (content: string) => {
    const placeholder = `__PLACEHOLDER_${placeholderIndex}__`;
    placeholders[placeholder] = content;
    placeholderIndex++;
    return placeholder;
  };

  const restorePlaceholders = (text: string) => {
    let result = text;
    Object.entries(placeholders).forEach(([placeholder, content]) => {
      result = result.replace(new RegExp(placeholder, "g"), content);
    });
    return result;
  };

  // Highlight strings first (to protect them from other patterns)
  const strings = /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g;
  highlighted = highlighted.replace(strings, (match) => {
    const colored = `<span style="color: ${isDark ? "#ce9178" : "#a31515"}">${match}</span>`;
    return createPlaceholder(colored);
  });

  // Highlight comments (won't match inside strings now)
  const comments = /\/\/.*|\/\*[\s\S]*?\*\//g;
  highlighted = highlighted.replace(comments, (match) => {
    const colored = `<span style="color: ${isDark ? "#6a9955" : "#008000"}">${match}</span>`;
    return createPlaceholder(colored);
  });

  // Highlight preprocessor directives
  const preprocessor =
    /#\s*(include|define|ifdef|endif|if|else|elif|pragma)\b/g;
  highlighted = highlighted.replace(preprocessor, (match) => {
    const colored = `<span style="color: ${isDark ? "#c586c0" : "#a626a4"}">${match}</span>`;
    return createPlaceholder(colored);
  });

  // Highlight keywords
  const keywords =
    /\b(int|void|char|float|double|if|else|for|while|return|include|define|struct|typedef|const|static|extern|auto|register|volatile|unsigned|signed|long|short|switch|case|default|break|continue|do|goto|sizeof|enum|union)\b/g;
  highlighted = highlighted.replace(keywords, (match) => {
    const colored = `<span style="color: ${isDark ? "#569cd6" : "#0000ff"}">${match}</span>`;
    return createPlaceholder(colored);
  });

  // Highlight numbers
  const numbers = /\b\d+\b/g;
  highlighted = highlighted.replace(numbers, (match) => {
    const colored = `<span style="color: ${isDark ? "#b5cea8" : "#098658"}">${match}</span>`;
    return createPlaceholder(colored);
  });

  // Restore all placeholders
  return restorePlaceholders(highlighted);
};

// Placeholder components (to be implemented)
const ExamHeader = ({
  exam,
  timeRemaining,
  formatTime,
  onBack,
  onSaveDraft,
  onRunTestCases,
  onSubmit,
}: {
  exam?: Exam;
  timeRemaining: number;
  formatTime: (seconds: number) => string;
  onBack: () => void;
  onSaveDraft: () => void;
  onRunTestCases: () => void;
  onSubmit: () => void;
}) => (
  <div className="bg-background border-b p-4">
    <div className="container mx-auto flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <h1 className="text-xl font-semibold">{exam?.title}</h1>
        <div className="text-sm text-muted-foreground">
          Time: {formatTime(timeRemaining)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onSaveDraft}>
          Save Draft
        </Button>
        <Button variant="outline" onClick={onRunTestCases}>
          Run Test Cases
        </Button>
        <Button onClick={onSubmit}>Submit</Button>
      </div>
    </div>
  </div>
);

const CodeEditor = ({
  code,
  onChange,
}: {
  code: string;
  onChange: (code: string) => void;
}) => {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    // Load theme preference from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("code-editor-theme");
      return saved ? saved === "dark" : true; // Default to dark
    }
    return true;
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Save theme preference to localStorage
  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("code-editor-theme", newTheme ? "dark" : "light");
    }
  };

  // Sync scroll between textarea and pre
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Calculate line numbers
  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header with Theme Toggle */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Code Editor
          </span>
          <Badge variant="outline" className="text-xs">
            C
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-7 px-2 hover:bg-muted"
          title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDarkTheme ? (
            <>
              <Sun className="h-3 w-3 mr-1" />
              <span className="text-xs">Light</span>
            </>
          ) : (
            <>
              <Moon className="h-3 w-3 mr-1" />
              <span className="text-xs">Dark</span>
            </>
          )}
        </Button>
      </div>

      {/* Code Editor Area with Syntax Highlighting and Line Numbers */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Line Numbers Column */}
        <div
          className={`shrink-0 select-none border-r ${
            isDarkTheme
              ? "bg-[#1e1e1e] border-[#3e3e3e] text-[#858585]"
              : "bg-gray-50 border-gray-300 text-gray-500"
          }`}
          style={{
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: "14px",
            lineHeight: "1.5",
            padding: "16px 8px",
            minWidth: "50px",
            textAlign: "right",
            overflowY: "hidden",
          }}
        >
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Code Editor Content */}
        <div className="flex-1 relative overflow-hidden">
          {/* Highlighted code display (background) */}
          <pre
            ref={preRef}
            className={`absolute inset-0 p-4 font-mono text-sm pointer-events-none overflow-y-auto overflow-x-hidden ${
              isDarkTheme
                ? "bg-[#1e1e1e] text-[#d4d4d4]"
                : "bg-white text-gray-900"
            }`}
            style={{
              fontFamily: 'Consolas, "Courier New", monospace',
              fontSize: "14px",
              lineHeight: "1.5",
              margin: 0,
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
          >
            <code
              dangerouslySetInnerHTML={{
                __html: highlightCode(code, isDarkTheme),
              }}
            />
          </pre>

          {/* Actual textarea (transparent, on top) */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            className={`absolute inset-0 p-4 font-mono text-sm border-0 resize-none focus:outline-none transition-colors duration-200 bg-transparent text-transparent overflow-y-auto overflow-x-hidden ${
              isDarkTheme ? "caret-[#d4d4d4]" : "caret-gray-900"
            }`}
            placeholder="Write your C code here..."
            style={{
              fontFamily: 'Consolas, "Courier New", monospace',
              fontSize: "14px",
              lineHeight: "1.5",
              tabSize: 4,
              resize: "none",
            }}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};

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

  // Fetch test cases
  const { data: testCasesData, isLoading: isLoadingTestCases } =
    useGetStudentTestCases(examId);

  // Compiler mutation
  const { mutate: judgeCodeFromFile } = useJudgeCodeFromFile();
  const { mutate: submitStudentCode } = useSubmitStudentCode();
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
  const [testInput, setTestInput] = useState("");
  const [isTestInputDialogOpen, setIsTestInputDialogOpen] = useState(false);

  // Get current exam score
  const examScore = useExamScore(roomId, examId);

  // Use currentScore if available (after submission), otherwise use examScore from hook
  const displayScore = currentScore || examScore;

  // Save draft helper
  const saveDraft = useCallback(() => {
    localStorage.setItem(`exam_code_${roomId}_${examId}`, code);
  }, [code, roomId, examId]);

  // Check if test cases are available
  const testCases = useMemo(() => testCasesData || [], [testCasesData]);

  // Handlers
  const handleSubmissionSuccess = useCallback(
    (
      judgeResult: JudgeCodeResponse,
      options: { fromFallback?: boolean } = {},
    ) => {
      const passedCount = judgeResult.passed;
      const totalCount = judgeResult.total;
      const allTestsPassed = passedCount === totalCount && totalCount > 0;

      localStorage.removeItem(`exam_code_${roomId}_${examId}`);

      if (examData) {
        const user = useAuthStore.getState().user;
        if (user) {
          // Calculate score based on passed test cases
          // If all tests pass, get full marks. Otherwise, calculate proportionally.
          let score = 0;
          if (totalCount > 0) {
            score = Math.round(
              (passedCount / totalCount) * examData.totalMarks,
            );
          }

          const newScore: ExamScore = {
            studentId: user.uuid,
            examRoomId: roomId,
            examId: examId,
            score: score,
            totalMarks: examData.totalMarks,
            passedTestCases: passedCount,
            totalTestCases: totalCount,
            submittedAt: new Date().toISOString(),
          };

          saveExamScore(newScore);
          setCurrentScore(newScore);

          if (allTestsPassed) {
            toast({
              title: "Submitted successfully!",
              description: `Perfect! You scored ${score}/${examData.totalMarks} points (${passedCount}/${totalCount} test cases passed)`,
            });
          } else {
            toast({
              title: "Submitted",
              description: `Score: ${score}/${examData.totalMarks} (${passedCount}/${totalCount} test cases passed). Keep practicing!`,
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
    [code, examData, examId, roomId, toast],
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
    roomId,
    handleSubmissionSuccess,
    judgeCodeFromFile,
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
        const response = await new Promise<
          CompilerApiResponse<CompileCodeResponse>
        >((resolve, reject) => {
          compileCodeService({
            code: code,
            input: testCase.inputPath || "",
            timeLimit: 2000,
            memoryLimit: 128,
            optimizationLevel: 2,
          })
            .then(resolve)
            .catch(reject);
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
      } catch (error: unknown) {
        results.push({
          testCase: i + 1,
          passed: false,
          input: testCase.inputPath || "",
          expectedOutput: testCase.outputPath || "",
          actualOutput: null,
          executionTime: 0,
          error: (error as { message?: string })?.message || "Network error",
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
  }, [code, testCases, toast]);

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
  if (examError || !examData) {
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
      {/* Action Bar */}
      <div className="bg-background border-b p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              ← Back
            </Button>
            <h1 className="text-xl font-semibold">{examData?.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => saveDraft()}>
              Save Draft
            </Button>
            <Button variant="outline" onClick={handleRunTestCases}>
              Run Test Cases
            </Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 h-[calc(100vh-140px)] flex flex-col">
        <ResizablePanelGroup
          direction="horizontal"
          className="rounded-lg border flex-1"
        >
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <Card className="h-full flex flex-col border-0 rounded-none">
              <CardHeader className="border-b shrink-0">
                <CardTitle>{examData.title}</CardTitle>
                <div className="flex gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Total Score:</span>
                    <Badge variant="outline">{examData.totalMarks}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Passing Score:</span>
                    <Badge variant="outline">{examData.passingMarks}</Badge>
                  </div>
                  {displayScore && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Your Score:</span>
                      <Badge
                        variant={
                          displayScore.score >= examData.passingMarks
                            ? "default"
                            : "destructive"
                        }
                        className={
                          displayScore.score >= examData.passingMarks
                            ? "bg-green-600"
                            : ""
                        }
                      >
                        {displayScore.score}/{displayScore.totalMarks}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                {displayScore && (
                  <div className="bg-muted p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      Submission Status
                      <Badge
                        variant={
                          displayScore.score >= examData.passingMarks
                            ? "default"
                            : "destructive"
                        }
                        className={
                          displayScore.score >= examData.passingMarks
                            ? "bg-green-600"
                            : ""
                        }
                      >
                        {displayScore.score >= examData.passingMarks
                          ? "Passed"
                          : "Failed"}
                      </Badge>
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Score:</span>{" "}
                        <span
                          className={
                            displayScore.score >= examData.passingMarks
                              ? "text-green-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {displayScore.score}/{displayScore.totalMarks}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Test Cases:</span>{" "}
                        {displayScore.passedTestCases}/
                        {displayScore.totalTestCases} passed
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted:{" "}
                        {new Date(displayScore.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Description:</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {examData.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Instructions:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Write your C code in the editor on the right</li>
                    <li>
                      Click &quot;Save Draft&quot; to save code (can continue
                      later)
                    </li>
                    <li>
                      Click &quot;Run Test Cases&quot; to check your solution
                      against the sample test cases.
                    </li>
                    <li>
                      Click &quot;Submit&quot; to submit your final answer
                    </li>
                    <li>Note: After submitting, you cannot edit your code</li>
                  </ul>
                </div>

                {/* Test Cases Section */}
                {testCases.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Sample Test Cases</h3>
                      <Badge variant="outline" className="text-xs">
                        {testCases.length} test case
                        {testCases.length > 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {testCases
                        .slice(0, 3)
                        .map((testCase: TestCaseResponse, index: number) => (
                          <div
                            key={testCase.testCaseId || index}
                            className="bg-muted p-3 rounded-lg border text-sm"
                          >
                            <div className="font-medium mb-2">
                              Test Case {index + 1}
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium text-xs text-muted-foreground">
                                  Input:
                                </span>
                                <pre className="bg-background p-2 rounded text-xs mt-1 overflow-x-auto">
                                  {testCase.inputPath || "No input"}
                                </pre>
                              </div>
                              <div>
                                <span className="font-medium text-xs text-muted-foreground">
                                  Expected Output:
                                </span>
                                <pre className="bg-background p-2 rounded text-xs mt-1 overflow-x-auto">
                                  {testCase.outputPath || "No output"}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      {testCases.length > 3 && (
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                            ... and {testCases.length - 3} more test case(s).
                            Click &quot;Run Tests&quot; to test against all
                            cases.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No Test Cases Message */}
                {testCases.length === 0 && !isLoadingTestCases && (
                  <div>
                    <h3 className="font-semibold mb-2">Test Cases:</h3>
                    <div className="bg-muted p-3 rounded-lg border text-sm text-muted-foreground">
                      No test cases available for this exam.
                    </div>
                  </div>
                )}

                {/* Loading Test Cases */}
                {isLoadingTestCases && (
                  <div>
                    <h3 className="font-semibold mb-2">Test Cases:</h3>
                    <div className="bg-muted p-3 rounded-lg border text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading test cases...
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={60} minSize={40}>
            <Card className="h-full flex flex-col border-0 rounded-none">
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
                  <CodeEditor code={code} onChange={setCode} />
                </TabsContent>

                <TabsContent
                  value="results"
                  className="flex-1 m-0 overflow-y-auto p-4"
                >
                  {isRunningTestCases ? (
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
                          Click &quot;Run Test Cases&quot; to execute the
                          sample tests
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

      {/* Test Code Dialog */}
      <Dialog
        open={isTestInputDialogOpen}
        onOpenChange={setIsTestInputDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Test Code</DialogTitle>
            <DialogDescription>
              Nhập input để test code của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2 space-y-4">
            <div>
              <label className="text-sm font-medium">Test Input</label>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="w-full min-h-[150px] p-2 border rounded font-mono text-sm"
                placeholder="Enter test input here..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the input data for testing your code
              </p>
            </div>
          </div>

          <div className="flex justify-between shrink-0 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsTestInputDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={async () => {
                if (!code.trim()) {
                  toast({
                    title: "Error",
                    description: "Please write code before testing",
                    variant: "destructive",
                  });
                  return;
                }

                if (code.trim().length < 10) {
                  toast({
                    title: "Error",
                    description: "Code is too short",
                    variant: "destructive",
                  });
                  return;
                }

                setIsTestInputDialogOpen(false);

                toast({
                  title: "Compiling",
                  description: "Executing your code...",
                });

                try {
                  const response = await compileCodeService({
                    code: code,
                    input: testInput,
                    timeLimit: 2000,
                    memoryLimit: 128,
                    optimizationLevel: 2,
                  });

                  if (response.data) {
                    // Create JudgeTestCaseResult object
                    const result: JudgeTestCaseResult = {
                      testCase: 0, // Custom test case index
                      passed: response.data.success && !response.data.error,
                      input: testInput,
                      expectedOutput: "", // Not applicable for custom test
                      actualOutput: response.data.success
                        ? response.data.output || ""
                        : null,
                      executionTime: response.data.executionTime || null,
                      error: response.data.error || null,
                      errorCode: response.data.errorCode || null,
                    };

                    // Set test results and switch to results tab
                    setTestResults([result]);
                    setActiveTab("results");

                    toast({
                      title: response.data.success
                        ? "Execution Successful"
                        : "Execution Failed",
                      description: response.data.success
                        ? `Output: ${response.data.output || "No output"}`
                        : response.data.error || "Check your code",
                      variant: response.data.success
                        ? "default"
                        : "destructive",
                    });
                  } else {
                    toast({
                      title: "Execution Failed",
                      description: "No response data",
                      variant: "destructive",
                    });
                  }
                } catch (error: unknown) {
                  toast({
                    title: "Error",
                    description:
                      (error as { message?: string })?.message ||
                      "Network error",
                    variant: "destructive",
                  });
                }
              }}
            >
              <Play className="mr-2 h-4 w-4" />
              Run Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
